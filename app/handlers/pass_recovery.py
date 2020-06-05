import json
import logging

from handlers import base
from lib.account import AccountService
from lib.mail import MailService

logger = logging.getLogger(__name__)


class PasswordRecoveryHandler(base.BaseRequestHandler):

    def get(self):
        self.render('pass_recovery.html')

    async def post(self):
        data = json.loads(self.request.body.decode('utf-8'))
        account_service = AccountService(db=self.db)
        account_service_create_pass_recovery_token_res = (
            await account_service.create_pass_recovery_token(
                user_email=data['email']
            )
        )
        if account_service_create_pass_recovery_token_res['status_code'] == 400:
            self.send_error(status_code=400)
            return

        mail_service = MailService(db=self.db)
        mail_service_send_password_recovery_email_res = (
            await mail_service.send_password_recovery_email(
                email=account_service_create_pass_recovery_token_res['data']['email'],
                token=account_service_create_pass_recovery_token_res['data']['token'],
            )
        )
        if mail_service_send_password_recovery_email_res['status_code'] == 200:
            self.set_status(204)
            await self.finish()
        else:
            raise base.UnrecognizedStatusCode(
                mail_service_send_password_recovery_email_res['status_code']
            )
