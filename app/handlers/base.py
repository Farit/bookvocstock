import logging
import tornado.web
import tornado.gen
import tornado.template

from lib.sessions import SessionsService

logger = logging.getLogger(__name__)


class BaseRequestHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('base.html')

    async def prepare(self):
        """Retrieves session from suid (session id) cookie"""
        session_id = self.get_secure_cookie('suid')
        if session_id:
            try:
                session_service = SessionsService(db=self.db)
                session_service_get_res = await session_service.get(
                    session_id=session_id.decode('utf-8')
                )
                if session_service_get_res['status_code'] == 200:
                    self.session = session_service_get_res['data']

            except tornado.gen.TimeoutError as err:
                logger.critical(err, exc_info=True)
                loader = tornado.template.Loader(self.get_template_path())
                data = loader.load('timeout.html').generate(
                    static_url=self.static_url)

                self.set_status(503)
                self.write(data)
                await self.finish()
        else:
            self.session = None

    def write_error(self, status_code: int, **kwargs) -> None:
        logger.error('Error %s', status_code)
        loader = tornado.template.Loader(self.get_template_path())
        if status_code == 504:
            data = loader.load('timeout.html').generate(
                static_url=self.static_url, current_user=self.current_user)
            self.set_status(504)
            self.write(data)
            self.finish()
        elif status_code == 504:
            data = loader.load('server_error.html').generate(
                static_url=self.static_url, current_user=self.current_user)
            self.set_status(500)
            self.write(data)
            self.finish()
        else:
            super().write_error(status_code, **kwargs)

    def get_current_user(self):
        """Determines current user from session"""
        if self.session:
            return {'uuid': self.session['uuid'],
                    'email': self.session['email']}

    @property
    def db(self):
        return self.application.settings['db']

    async def create_session(self, uuid, email):
        sessions_service = SessionsService(db=self.db)
        sessions_service_create_res = await sessions_service.create(
            uuid=uuid, email=email
        )

        session_id = sessions_service_create_res['data']['session_id']
        expires_days = sessions_service_create_res['data']['expires_days']
        self.set_secure_cookie('suid', session_id, expires_days=expires_days)
        self.set_status(204)
        await self.finish()


class UnrecognizedStatusCode(Exception):

    def __init__(self, status_code):
        super().__init__()
        self.status_code = status_code

    def __str__(self):
        return 'Unrecognized status code %s' % self.status_code
