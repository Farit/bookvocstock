import asyncio
import logging
import uuid as uuid_generator

from functools import partial
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor

import bson
import pymongo
import bcrypt

from lib.base import Base

logger = logging.getLogger(__name__)


class AccountService(Base):
    """Manages tasks that involves user account"""

    def __init__(self, db):
        super().__init__(db=db)

        # io_loop, and executor attributes required for `run_on_executor'
        # (decorator to run a synchronous method asynchronously on an executor)
        self.io_loop = asyncio.get_running_loop()
        self.executor = ThreadPoolExecutor(max_workers=2)

    def create_indexes(self):
        """Creates an indexes on collections."""
        logger.info(
            'Creating index: %s.credentials: email - ASCENDING, UNIQUE',
            self.db.name)
        self.db.credentials.create_index(
            [("email", pymongo.ASCENDING)], unique=True)

        logger.info(
            'Creating index: %s.credentials: uuid - ASCENDING, UNIQUE',
            self.db.name)
        self.db.credentials.create_index(
            [("uuid", pymongo.ASCENDING)], unique=True)

    async def login(self, email, password):
        """To authenticate a given email and password for user
        Args:
            email (String): user entered email
            password (String): user entered password
        """
        user_cred = await self.db.credentials.find_one({'email': email})
        if not user_cred:
            logger.error('Invalid email')
            return {'status_code': 403}

        pass_check = await self.io_loop.run_in_executor(
            self.executor,
            partial(
                self.check_password,
                entered_password=password,
                hashed_password=user_cred['password']
            )
        )
        if not pass_check:
            logger.error('Invalid password')
            return {'status_code': 403}

        return {'status_code': 200,
                'data': {'email': user_cred['email'],
                         'uuid': user_cred['uuid']}}

    async def register(self, email, password):
        """New user registration"""
        hashed_password = await self.io_loop.run_in_executor(
            self.executor,
            partial(self.make_password, password=password)
        )

        # Because of `uuid` and `email` keys are unique indexes, we have two
        # outcome here.
        # If duplicate key is email, it means we have registered user with
        # that email and on that situation we raise EmailDuplicateError.
        # if duplicate key is uuid, we regenerate new uuid
        # In order to catch DuplicateKeyError and regenerate new uuid
        # we wrapped whole procedure in while loop and try .. except
        # statement
        while True:
            try:
                uuid = uuid_generator.uuid4().hex
                await self.db.credentials.insert_one(
                    {'uuid': uuid,
                     'email': email,
                     'password': hashed_password,
                     'registered_timestamp': self.set_local_timezone(
                         datetime.now())}
                )
                return {'status_code': 200,
                        'data': {'email': email, 'uuid': uuid}}

            except Exception as err:
                logger.exception(err)
                return {'status_code': 500}

    async def create_pass_recovery_token(self, user_email):
        """Creates password recovery token"""
        user = None
        user_cred = await self.db.credentials.find_one({'email': user_email})
        if user_cred:
            object_id = await self.db.password_recovery_tokens.insert_one(
                {
                    'uuid': user_cred['uuid'],
                    'created_timestamp': self.set_local_timezone(
                        datetime.now()),
                    'expiration_timestamp': self.set_local_timezone(
                        datetime.now() + timedelta(hours=24)),
                    'rotten': False
                }
            )
            return {'status_code': 200,
                    'data': {'token': str(object_id), 'email': user_email}}
        else:
            return {'status_code': 400}

    async def change_password(self, token, new_password):
        """Changes user password
        Args:
            token (String): password recovery token
            new_password (String): user new password
        """
        try:
            user_uuid = await self._get_uuid_by_token(token)

        except TokenExpiredError as err:
            logger.error('Token expired: %s', err.token)
            return {'status_code': 400}

        except TokenInvalidError as err:
            logger.error('Token invalid: %s', err.token)
            return {'status_code': 400}

        hashed_password = await self.io_loop.run_in_executor(
            self.executor,
            partial(self.make_password, password=new_password)
        )
        await self.db.credentials.update(
            {'uuid': user_uuid},
            {'$set': {'password': hashed_password}}
        )
        return {'status_code': 200, 'data': {'uuid': user_uuid}}

    async def _get_uuid_by_token(self, token):
        """Retrieves user unique identifier (uuid) by token
        Args:
            token (String): password recovery token
        """
        token_data = await self.db.password_recovery_tokens.find_one(
            {'_id': bson.ObjectId(token), 'rotten': False})
        if not token_data:
            raise TokenInvalidError(token)

        # Mark token as rotten
        await self.db.password_recovery_tokens.update(
            {'_id': bson.ObjectId(token)},
            {'$set': {'rotten': True}}
        )

        # MongoDB returns created_timestamp in utc format
        if token_data['expiration_timestamp'] < datetime.utcnow():
            raise TokenExpiredError(token)

        return token_data['uuid']

    @staticmethod
    def check_password(entered_password, hashed_password):
        """Password check function. Using bcrypt ("one-way" hash function).
        Notice: bcrypt() takes about 100ms to compute, and therefore was
        decorated by `run_on_executor` to run on separate thread
        Args:
            entered_password (String): user entered password on login
            hashed_password (String): retrieved user password from database
        Returns:
            on success: True
            on failure: False
        """
        entered_psw = entered_password.encode('utf-8')
        if isinstance(hashed_password, str):
            hashed_psw = hashed_password.encode('utf-8')
        else:
            hashed_psw = hashed_password

        if bcrypt.hashpw(entered_psw, hashed_psw) == hashed_password:
            return True
        return False

    @staticmethod
    def make_password(password):
        """Hashing password function. Using bcrypt ("one-way" hash function).
        Notice: bcrypt() takes about 100ms to compute, and therefore was
        decorated by `run_on_executor` to run on separate thread
        Args:
            password (String)
        Returns:
            hashed_password (String)
        """
        psw = password.encode('utf-8')
        hashed_password = bcrypt.hashpw(psw, bcrypt.gensalt())
        return hashed_password

    async def get_user_by_uuid(self, uuid):
        """Retrieves user data by user unique identifier
        Args:
            uuid (String): user unique identifier
        """
        user_cred = await self.db.credentials.find_one({'uuid': uuid})
        return {'status_code': 200,
                'data': {'uuid': uuid, 'email': user_cred['email']}}


class TokenInvalidError(Exception):
    """Exception raised when we could not found password recovery token in our
    database
    """

    def __init__(self, token):
        super().__init__()
        self.token = token


class TokenExpiredError(Exception):
    """Exception raised when password recovery token is expired"""

    def __init__(self, token):
        super().__init__()
        self.token = token