import logging
import tornado.web
import tornado.gen

from handlers import base
from lib.vocabulary import VocabularyService

logger = logging.getLogger(__name__)


class VocabularyHandler(base.BaseRequestHandler):

    @tornado.web.authenticated
    async def get(self):
        vocabulary_service = VocabularyService(db=self.db)
        vocabulary_service_get_total_voc_by_date_res = (
            await vocabulary_service.get_total_vocabulary_by_date(
                uuid=self.current_user['uuid']
            )
        )
        await self.render(
            'vocabulary.html',
            data=vocabulary_service_get_total_voc_by_date_res['data']
        )

    @tornado.web.authenticated
    async def post(self):
        word = self.get_argument('word')
        current_stage = self.get_argument('current_stage')
        to_stage = self.get_argument('to_stage')

        vocabulary_service = VocabularyService(db=self.db)
        await vocabulary_service.update(
            uuid=self.current_user['uuid'],
            word=word,
            current_stage=current_stage,
            to_stage=to_stage
        )
