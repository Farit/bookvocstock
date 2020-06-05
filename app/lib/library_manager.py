import math
import logging

from lib.base import Base
from lib.vocabulary import VocabularyService
from lib.catalogue import CatalogueService
from lib.sentences import SentencesService
from lib.words import WordsService

logger = logging.getLogger(__name__)


class LibraryManager(Base):

    def __init__(self, db):
        super().__init__(db=db)
        self.five_thousand_common_words = set()
        # with open('data/fivet_common_en_words.csv') as fh:
        #     for line in fh:
        #         word = line.split(',')[1].strip().lower()
        #         self.five_thousand_common_words.add(word)

    async def get(self, uuid, tuid=None, analytics=False):
        try:
            vocabulary_service = VocabularyService(db=self.db)
            catalogue_service = CatalogueService(db=self.db)
            sentences_service = SentencesService(db=self.db)
            words_service = WordsService(db=self.db)

            texts = []

            vocabulary_service_get_lexicon_res = (
                await vocabulary_service.get_lexicon(
                    uuid=uuid
                )
            )
            user_lexicon = vocabulary_service_get_lexicon_res['data']

            catalogue_service_get_res = await catalogue_service.get(
                uuid=uuid, tuid=tuid
            )
            catalogue_records = catalogue_service_get_res['data']

            for catalogue_record in catalogue_records:
                text = {
                    "id": catalogue_record['tuid'],
                    'title': catalogue_record['title'],
                    'text_type': catalogue_record['text_type'],
                    'text_attrs': catalogue_record['text_attrs']
                }
                if analytics:
                    text.update(
                        {'unknown': 0, 'known': 0, 'learning': 0, 'familiar': 0}
                    )

                total_sent = catalogue_record['total_sent']

                sentences_service_get_mined_total_number_res = (
                    await sentences_service.get_mined_total_number(
                        uuid=uuid,
                        tuid=tuid
                    )
                )
                total_mined_sent = (
                    sentences_service_get_mined_total_number_res['data']
                )

                if total_mined_sent != total_sent:
                    percent_mining = (total_mined_sent / total_sent) * 100
                    text["percent_mining"] = math.floor(percent_mining)
                else:
                    words_service_get_text_words_res = (
                        await words_service.get_text_words(
                            uuid=uuid,
                            tuid=tuid
                        )
                    )
                    text_words = words_service_get_text_words_res['data']

                    for word in text_words:
                        word_stage = user_lexicon.get(word['word'], 'unknown')
                        if analytics:
                            text[word_stage] += 1
                        word['stage'] = word_stage
                        if word['word'] in self.five_thousand_common_words:
                            word['fivet_common_word'] = True

                    if not analytics:
                        text['words'] = text_words
                    text["percent_mining"] = 100

                texts.append(text)

            response = {'status_code': 200, 'data': texts}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def get_context(self, uuid, tuid, word):
        try:
            sentences_service = SentencesService(db=self.db)
            words_service = WordsService(db=self.db)

            words_service_get_word_suids_res = (
                await words_service.get_word_suids(
                    uuid=uuid,
                    tuid=tuid,
                    word=word
                )
            )
            suids = words_service_get_word_suids_res['data']

            sentences_service_get_res = await sentences_service.get(
                uuid=uuid,
                tuid=tuid,
                suids=suids
            )
            sentences = sentences_service_get_res['data']

            response = {'status_code': 200, 'data': sentences}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response
