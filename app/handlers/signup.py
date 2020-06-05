import json
import logging

from handlers import base
from lib.account import AccountService

logger = logging.getLogger(__name__)


class SignupHandler(base.BaseRequestHandler):
    def get(self):
        self.render('signup.html')

    async def post(self):
        data = json.loads(self.request.body.decode('utf-8'))

        account_service = AccountService(db=self.db)
        account_service_register_res = await account_service.register(
            email=data['email'],
            password=data['password']
        )
        if account_service_register_res['status_code'] == 409:
            self.send_error(status_code=409)
            return

        await self.create_session(
            uuid=account_service_register_res['data']['uuid'],
            email=account_service_register_res['data']['email']
        )

