import json
import logging

import tornado.web
import tornado.template

from handlers import base
from lib.library_manager import LibraryManager
from lib.catalogue import CatalogueService
from lib.upload_manager import UploadManager

logger = logging.getLogger(__name__)


class TextHandler(base.BaseRequestHandler):

    @tornado.web.authenticated
    async def get(self, tuid):
        library_manager = LibraryManager(db=self.db)
        library_manager_get_res = await library_manager.get(
            uuid=self.current_user['uuid'],
            tuid=tuid,
        )
        data = library_manager_get_res['data'][0]
        data['words'] = json.dumps(data['words'])
        await self.render('text.html', data=data)

    @tornado.web.authenticated
    async def patch(self, tuid):
        data = json.loads(self.request.body.decode('utf-8'))
        catalogue_service = CatalogueService(db=self.db)
        await catalogue_service.update_record(
            tuid=tuid,
            uuid=self.current_user['uuid'],
            title=data['title'],
            text_type=data['text_type'],
            text_attrs=data['text_attrs']
        )

    @tornado.web.authenticated
    async def post(self, tuid):
        data = json.loads(self.request.body.decode('utf-8'))
        upload_manager = UploadManager(db=self.db)
        upload_manager_register_res = await upload_manager.register(
            uuid=self.current_user['uuid'],
            file=data['file']
        )
        self.set_status(200)
        self.write(upload_manager_register_res['data'])
        await self.finish()
