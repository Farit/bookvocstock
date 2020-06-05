import logging

from handlers import base

logger = logging.getLogger(__name__)


class AboutHandler(base.BaseRequestHandler):
    def get(self):
        self.render('about.html')
