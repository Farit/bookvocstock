import logging
import tornado.web

from handlers import base
from lib.library_manager import LibraryManager

logger = logging.getLogger(__name__)


class TextWordContextHandler(base.BaseRequestHandler):

    @tornado.web.authenticated
    async def get(self, tuid, word):
        library_manager = LibraryManager(db=self.db)
        library_manager_get_context_res = (
            await library_manager.get_context(
                uuid=self.current_user['uuid'],
                tuid=tuid,
                word=word
            )
        )
        self.write({'context': library_manager_get_context_res['data']})
        await self.finish()
