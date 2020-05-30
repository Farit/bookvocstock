import logging

from handlers import base

logger = logging.getLogger(__name__)


class DefaultHandler(base.BaseRequestHandler):
    def get(self):
        logger.warning('Page %s not found', self.request.full_url())
        self.render('default.html')
