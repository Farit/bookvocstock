import os.path
import signal
import logging

import motor
import tornado.web
import tornado.ioloop
import tornado.httpserver


from urls import urls
from handlers import default
from lib.account import AccountService
from lib.catalogue import CatalogueService
from lib.extraction import ExtractionService
from lib.library_manager import LibraryManager
from lib.mail import MailService
from lib.mining import MiningService
from lib.mining_manager import MiningManagerService
from lib.segmentation import SegmentationService
from lib.sentences import SentencesService
from lib.sessions import SessionsService
from lib.upload_manager import UploadManager
from lib.vocabulary import VocabularyService
from lib.words import WordsService

logger = logging.getLogger(__name__)


class Application:
    MONGODB_URL = 'mongodb://127.0.0.1:27017'

    def __init__(self, port, debug_server_mode):
        self.io_loop = tornado.ioloop.IOLoop.instance()
        self.port = port
        self.debug_server_mode = debug_server_mode
        self.set_up_signal_handling(signal.SIGINT)
        self.set_up_signal_handling(signal.SIGTERM)

        app_root = os.path.dirname(os.path.abspath(__file__))

        logger.info(
            "Creating a connection to a MongoDB instance at %s",
            self.MONGODB_URL
        )
        async_client = motor.MotorClient(self.MONGODB_URL, connect=True)
        database_name = 'myvocstock'
        logger.info("Getting a database: %s", database_name)
        self.db = async_client[database_name]

        self.app = tornado.web.Application(
            handlers=urls,
            template_path=os.path.join(app_root, 'templates'),
            static_path=os.path.join(app_root, 'static'),
            cookie_secret='iMCK1B8UT66jyCDLlKXWaDhKq5AF2E1nvO8Mhyxy3Lk=',
            default_handler_class=default.DefaultHandler,
            debug=self.debug_server_mode,
            db=self.db
        )

        http_server = tornado.httpserver.HTTPServer(self.app)
        http_server.listen(self.port)

    def start(self):
        logger.info('Server started on port %s', self.port)
        for key, value in self.app.settings.items():
            logger.info('settings: %s = %s', key, value)

        logger.info("IOLoop starting ...")
        self.io_loop.add_callback(self.create_db_indexes)
        self.io_loop.start()

    def stop(self, signum, frame):
        self.io_loop.stop()
        logger.info('Server stopped')

    def set_up_signal_handling(self, signame):
        signal.signal(signame, self.stop)
        logger.info(
            'Set up signal handling: %s handle %s',
            signame, self.stop.__name__
        )

    def create_db_indexes(self):
        """Creates an indexes on collections."""
        AccountService(db=self.db).create_indexes()
        CatalogueService(db=self.db).create_indexes()
        ExtractionService(db=self.db).create_indexes()
        LibraryManager(db=self.db).create_indexes()
        MailService(db=self.db).create_indexes()
        MiningService(db=self.db).create_indexes()
        MiningManagerService(db=self.db).create_indexes()
        SegmentationService(db=self.db).create_indexes()
        SentencesService(db=self.db).create_indexes()
        SessionsService(db=self.db).create_indexes()
        UploadManager(db=self.db).create_indexes()
        VocabularyService(db=self.db).create_indexes()
        WordsService(db=self.db).create_indexes()
