import asyncio
import logging

from functools import partial

from lib.base import Base
from lib.catalogue import CatalogueService
from lib.sentences import SentencesService
from lib.mining import MiningService
from lib.words import WordsService

logger = logging.getLogger(__name__)


class MiningManagerService(Base):

    def __init__(self, db):
        super().__init__(db=db)

        # io_loop, and executor attributes required for `run_on_executor'
        # (decorator to run a synchronous method asynchronously on an executor)
        self.io_loop = asyncio.get_running_loop()

    async def start_mining(self, uuid, tuid):
        catalogue_service = CatalogueService(db=self.db)
        await catalogue_service.mark_record_as_submitted(
            uuid=uuid,
            tuid=tuid,
        )
        asyncio.ensure_future(partial(self._put_to_mining, uuid=uuid, tuid=tuid)())

    async def _put_to_mining(self, uuid, tuid):
        sentences_service = SentencesService(db=self.db)
        mining_service = MiningService(db=self.db)
        words_service = WordsService(db=self.db)

        unmined_sentences = []
        limit = 100
        try:
            sentences_service_get_unmined_res = (
                await sentences_service.get_unmined(
                    uuid=uuid,
                    tuid=tuid,
                    limit=limit
                )
            )
            unmined_sentences = sentences_service_get_unmined_res['data']

            for sent_data in unmined_sentences:
                mining_service_parse_sent_res = (
                    await mining_service.parse_sentence(
                        sentence=sent_data['sent'],
                        suid=sent_data['suid'],
                        uuid=uuid,
                        tuid=tuid,
                    )
                )
                await sentences_service.mark_as_mined(
                    uuid=mining_service_parse_sent_res['data']['uuid'],
                    tuid=mining_service_parse_sent_res['data']['tuid'],
                    suid=mining_service_parse_sent_res['data']['suid'],
                )
                await words_service.insert_bulk(
                    uuid=mining_service_parse_sent_res['data']['uuid'],
                    tuid=mining_service_parse_sent_res['data']['tuid'],
                    suid=mining_service_parse_sent_res['data']['suid'],
                    lemmas=mining_service_parse_sent_res['data']['lemmas'],
                )

            await sentences_service.mark_as_submitted(
                uuid=uuid,
                tuid=tuid,
                suids=[s['suid'] for s in unmined_sentences]
            )

        except Exception as err:
            logger.critical(err, exc_info=True)

        finally:
            if len(unmined_sentences) == limit:
                asyncio.ensure_future(partial(self._put_to_mining, uuid=uuid, tuid=tuid)())
