import hashlib
import logging
import uuid as uuid_generator

from datetime import datetime, timedelta

import pymongo
import pymongo.errors

from lib.base import Base

logger = logging.getLogger(__name__)


class SessionsService(Base):
    """Class responsible for interacting with user sessions.
    """

    # Lifetime of the session. For how long session will be valid.
    SESSION_LIFETIME_DAYS = 30

    def create_indexes(self):
        logger.info(
            'Index: %s.sessions: session_id - ASCENDING, UNIQUE', self.db.name)
        self.db.sessions.create_index(
            [("session_id", pymongo.ASCENDING)], unique=True)

    async def create(self, uuid, email):
        """Creating user session
        Args:
            uuid (String): user unique identifier
            email (String): user email
        """

        # Because of `session_id` key is unique index, we have small
        # possibility, that when we generate new session identifier
        # we may produce already generated session_id.
        # In order to catch DuplicateKeyError and regenerate new session
        # id, we wrapped whole procedure in while loop and try .. except
        # statement
        while True:
            try:
                session_id = uuid_generator.uuid4().hex
                hashed_session_id = self.hash_session_id(session_id)
                now_datetime = self.set_local_timezone(datetime.now())

                await self.db.sessions.insert_one(
                    {
                        'uuid': uuid,
                        'email': email,
                        'session_id': hashed_session_id,
                        'opened_timestamp': now_datetime,
                        'expires_timestamp': now_datetime + timedelta(
                            days=self.SESSION_LIFETIME_DAYS),
                        'closed_timestamp': None
                    }
                )
                return {'status_code': 200,
                        'data': {'session_id': session_id,
                                 'expires_days': self.SESSION_LIFETIME_DAYS}}

            except pymongo.errors.DuplicateKeyError as err:
                logger.error(err)
                # Generate new session_id
                continue

    async def get(self, session_id):
        """Retrieves session from database
        Args:
            session_id (String): user session identifier
        """
        hashed_session_id = self.hash_session_id(session_id)

        session = await self.db.sessions.find_one(
            {
                'session_id': hashed_session_id,
                'closed_timestamp': {"$eq": None},
                'expires_timestamp': {"$gte": self.set_local_timezone(
                    datetime.now())}
            }
        )
        if session:
            return {'status_code': 200,
                    'data': {'uuid': session['uuid'],
                             'email': session['email'],
                             'session_id': session['session_id']}}
        return {'status_code': 200, 'data': None}

    async def close(self, session_id):
        """Closes user session.
        Args:
            session_id (String): user session identifier
        """
        hashed_session_id = self.hash_session_id(session_id)

        await self.db.sessions.update_one(
            {'session_id': hashed_session_id},
            {
                '$set': {
                    'closed_timestamp': self.set_local_timezone(datetime.now())
                }
            }
        )
        return {'status_code': 200}

    @staticmethod
    def hash_session_id(session_id):
        """Method for hashing session id. Uses sha256 algorithm
        Args:
            session_id (String): user session identifier
        Returns:
            hashed_session_id (String): containing only hexadecimal digits
        """
        seed = session_id.encode('utf-8')
        return hashlib.sha256(seed).hexdigest()
