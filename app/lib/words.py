import logging

import pymongo

from lib.base import Base

logger = logging.getLogger(__name__)


class WordsService(Base):

    async def insert_bulk(self, uuid, tuid, suid, lemmas):
        try:
            collection = 'uuid_{}.tuid_{}.words'.format(uuid, tuid)

            data = []
            for lemma in lemmas:
                data.append({
                    'word': lemma['lemword'],
                    'suid': suid,
                    'pos': lemma['part_of_speech'],
                })

            if data:
                await self.db[collection].insert_many(data)

            response = {'status_code': 200}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def get_text_words(self, uuid, tuid):
        try:
            text_words = []

            collection = 'uuid_{}.tuid_{}.words'.format(uuid, tuid)
            cursor = self.db[collection].aggregate(
                [{'$group': {'_id': '$word', 'occur': {'$sum': 1}}},
                 {'$sort': {'occur': -1}},
                 {'$project': {'word': '$_id', '_id': 0, 'occur': 1}}],
                allowDiskUse=True, cursor={}
            )

            while await cursor.fetch_next:
                doc = cursor.next_object()
                text_words.append(doc)

            response = {'status_code': 200, 'data': text_words}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def get_word_suids(self, uuid, tuid, word):
        try:
            collection = 'uuid_{}.tuid_{}.words'.format(uuid, tuid)
            resp = await self.db[collection].find(
                {'word': word},
                {'_id': 0, 'suid': 1}
            ).to_list(None)
            response = {'status_code': 200, 'data': [i['suid'] for i in resp]}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def create_new_collection(self, uuid, tuid):
        try:
            collection = 'uuid_{}.tuid_{}.words'.format(uuid, tuid)
            self.db[collection].create_index(
                [("word", pymongo.ASCENDING)], unique=False)

            response = {'status_code': 200}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response
