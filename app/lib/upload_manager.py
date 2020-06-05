import logging

from lib.base import Base
from lib.catalogue import CatalogueService
from lib.extraction import ExtractionService
from lib.segmentation import SegmentationService
from lib.sentences import SentencesService
from lib.words import WordsService

logger = logging.getLogger(__name__)


class UploadManager(Base):

    async def register(self, uuid, file):
        try:
            catalogue_service = CatalogueService(db=self.db)
            extraction_service = ExtractionService(db=self.db)
            segmentation_service = SegmentationService(db=self.db)
            sentences_service = SentencesService(db=self.db)
            words_service = WordsService(db=self.db)

            catalogue_service_create_record_res = (
                await catalogue_service.create_record(uuid=uuid)
            )
            catalogue_record = catalogue_service_create_record_res['data']

            extraction_service_extract_res = (
                await extraction_service.extract(
                    uuid=uuid,
                    tuid=catalogue_record['tuid'],
                    file=file
                )
            )

            segmentation_service_get_sentences_res = (
                await segmentation_service.get_sentences(
                    file=extraction_service_extract_res['data']['text']
                )
            )
            if not segmentation_service_get_sentences_res['data']['sentences']:
                raise TextError(
                    uuid, catalogue_record['tuid'], 'Empty segmentation'
                )

            catalogue_service_update_record_res = (
                await catalogue_service.update_record(
                    uuid=uuid,
                    tuid=catalogue_record['tuid'],
                    total_sent=len(
                        segmentation_service_get_sentences_res['data']['sentences']
                    ),
                )
            )

            sentences_service_insert_res = (
                await sentences_service.insert(
                    uuid=uuid,
                    tuid=catalogue_record['tuid'],
                    sentences=segmentation_service_get_sentences_res['data']['sentences']
                )
            )

            words_service_create_new_collection_res = (
                await words_service.create_new_collection(
                    uuid=uuid,
                    tuid=catalogue_record['tuid'],
                )
            )

            response = {
                'status_code': 200,
                'data': {
                    'id': extraction_service_extract_res['data']['tuid'],
                    'title': extraction_service_extract_res['data']['title'],
                    'text_type': extraction_service_extract_res['data']['text_type'],
                    'text_attrs': extraction_service_extract_res['data']['text_attrs']
                }
            }

        except TextError as err:
            logger.critical(err)
            response = {'status_code': 500,
                        'reason': 'Unable to extract text from file'}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response


class TextError(Exception):

    def __init__(self, uuid, tuid, desc):
        super().__init__()
        self.uuid = uuid
        self.tuid = tuid
        self.desc = desc

    def __str__(self):
        return '{} uuid:{}, tuid:{}, desc={}'.format(
            self.__class__.__name__, self.uuid, self.tuid, self.desc)

