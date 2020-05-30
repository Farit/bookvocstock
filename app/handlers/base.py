import logging
import tornado.web
import tornado.template

logger = logging.getLogger(__name__)


class BaseRequestHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('base.html')

