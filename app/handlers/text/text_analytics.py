import logging
import tornado.web
import tornado.gen

from handlers.text import text
from lib.library_manager import LibraryManager

logger = logging.getLogger(__name__)


class TextAnalyticsHandler(text.TextHandler):

    @tornado.web.authenticated
    async def get(self, tuid):
        library_manager = LibraryManager(db=self.db)
        library_manager_get_res = await library_manager.get(
            uuid=self.current_user['uuid'],
            tuid=tuid,
            analytics=True
        )
        self.write(library_manager_get_res['data'][0])
        await self.finish()

