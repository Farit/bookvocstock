import json
import logging

from handlers import base
from lib.account import AccountService

logger = logging.getLogger(__name__)


class LoginHandler(base.BaseRequestHandler):

    def get(self):
        self.render('login.html')

    async def post(self):
        data = json.loads(self.request.body.decode('utf-8'))

        account_service = AccountService(db=self.db)
        account_service_login_res = await account_service.login(
            email=data['email'],
            password=data['password']
        )
        if account_service_login_res['status_code'] == 403:
            self.send_error(status_code=403)
            return

        await self.create_session(
            uuid=account_service_login_res['data']['uuid'],
            email=account_service_login_res['data']['email']
        )

