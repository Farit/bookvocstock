import os.path
import signal
import logging

import tornado.web
import tornado.ioloop
import tornado.httpserver


from urls import urls
from handlers import default

logger = logging.getLogger(__name__)


class Application:

    def __init__(self, port, debug_server_mode):
        self.port = port
        self.debug_server_mode = debug_server_mode
        self.set_up_signal_handling(signal.SIGINT)
        self.set_up_signal_handling(signal.SIGTERM)

        app_root = os.path.dirname(os.path.abspath(__file__))

        self.app = tornado.web.Application(
            handlers=urls,
            template_path=os.path.join(app_root, 'templates'),
            static_path=os.path.join(app_root, 'static'),
            cookie_secret='iMCK1B8UT66jyCDLlKXWaDhKq5AF2E1nvO8Mhyxy3Lk=',
            default_handler_class=default.DefaultHandler,
            debug=self.debug_server_mode,
        )

        http_server = tornado.httpserver.HTTPServer(self.app)
        http_server.listen(self.port)

    def start(self):
        logger.info('Server started on port %s', self.port)
        for key, value in self.app.settings.items():
            logger.info('settings: %s = %s', key, value)

        logger.info("IOLoop starting ...")
        tornado.ioloop.IOLoop.instance().start()

    def stop(self, signum, frame):
        tornado.ioloop.IOLoop.instance().stop()
        logger.info('Server stopped')

    def set_up_signal_handling(self, signame):
        signal.signal(signame, self.stop)
        logger.info(
            'Set up signal handling: %s handle %s',
            signame, self.stop.__name__
        )
