import logging
import tornado.web

from handlers import base
from lib.sessions import SessionsService

logger = logging.getLogger(__name__)


class LogoutHandler(base.BaseRequestHandler):

    @tornado.web.authenticated
    async def get(self):
        session_id = self.get_secure_cookie('suid').decode('utf-8')
        sessions_service = SessionsService(db=self.db)
        sessions_service_close_res = await sessions_service.close(
            session_id=session_id
        )
        if sessions_service_close_res['status_code'] == 200:
            self.clear_cookie("suid")
            self.redirect('/')
        else:
            raise base.UnrecognizedStatusCode(
                status_code=sessions_service_close_res['status_code']
            )
