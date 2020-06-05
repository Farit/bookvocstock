import logging
import tornado.gen
import smtplib
import tornado.template

from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from tornado.ioloop import IOLoop
from tornado.concurrent import run_on_executor
from concurrent.futures import ThreadPoolExecutor
from tornado.options import define, options

from lib.base import Base
logger = logging.getLogger(__name__)

define(name='smtp_domain', type=str)
define(name='smtp_port', type=int)
define(name='smtp_login', type=str)
define(name='smtp_password', type=str)


class MailService(Base):
    def __init__(self, db):
        super().__init__(db)

        # io_loop, and executor attributes required for `run_on_executor'
        # (decorator to run a synchronous method asynchronously on an executor)
        self.io_loop = IOLoop.instance()
        self.executor = ThreadPoolExecutor(max_workers=2)

    async def send_password_recovery_email(self, email, token):
        """Sends password recovery email to a user
        Args:
            email (String): recipient email address
            token (String): password recovery unique token
        """
        logger.info('Sent password recovery to email: %s', email)
        fromaddr = options.smtp_login
        toaddr = email

        message = MIMEMultipart()
        message['From'] = fromaddr
        message['To'] = toaddr
        message['Subject'] = 'Myvocstock Account Recovery'

        with open('app/templates/pass_recovery.html') as fh:
            html_template = fh.read()

        _template = tornado.template.Template(html_template)
        body = _template.generate(
            subject=message['subject'],
            email=email,
            link="http://127.0.0.1/password/reset?token=%s" % token
        )
        message.attach(MIMEText(body, 'html', 'utf-8'))
        await self.db.recovery_emails.insert(
            {
                'email': email,
                'timestamp': self.set_local_timezone(datetime.now())
            }
        )

        await self._send_email(fromaddr, toaddr, message)
        return {'status_code': 200}

    @run_on_executor
    def _send_email(self, fromaddr, toaddr, message):
        try:
            server = smtplib.SMTP(options.smtp_domain, options.smtp_port)

            # A security function, needed to connect to the mail server.
            # It will protect our password.
            server.starttls()

            server.login(options.smtp_login, options.smtp_password)

            text = message.as_string()
            server.sendmail(fromaddr, toaddr, text)
            server.quit()

        except Exception as err:
            logger.critical(err, exc_info=True)