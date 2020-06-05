import json
import logging
import tornado.web
import tornado.gen

from handlers import base
from lib.library_manager import LibraryManager

logger = logging.getLogger(__name__)


class LibraryHandler(base.BaseRequestHandler):

    @tornado.web.authenticated
    async def get(self):
        library_manager = LibraryManager(db=self.db)
        library_manager_get_res = await library_manager.get(
            uuid=self.current_user['uuid'],
            analytics=True
        )
        await self.render(
            'library.html',
            library=library_manager_get_res['data'],
            data=json.dumps(library_manager_get_res['data'])
        )

