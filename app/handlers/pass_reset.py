import json
import logging

from handlers import base
from lib.account import AccountService

logger = logging.getLogger(__name__)


class PasswordResetHandler(base.BaseRequestHandler):

    def get(self):
        self.render('pass_reset.html')

    async def post(self):
        data = json.loads(self.request.body.decode('utf-8'))
        if not data.get('token'):
            self.send_error(status_code=400)
            return

        account_service = AccountService(db=self.db)
        account_service_change_password_res = (
            await account_service.change_password(
                token=data['token'],
                new_password=data['password']
            )
        )
        if account_service_change_password_res['status_code'] == 400:
            self.send_error(status_code=400)
            return

        account_service_get_user_by_uuid_res = (
            await account_service.get_user_by_uuid(
                uuid=account_service_change_password_res['data']['uuid'],
            )
        )
        await self.create_session(
            uuid=account_service_get_user_by_uuid_res['data']['uuid'],
            email=account_service_get_user_by_uuid_res['data']['email']
        )
