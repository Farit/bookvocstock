import logging
import uuid as uuid_generator

import pymongo

from datetime import datetime

from lib.base import Base

logger = logging.getLogger(__name__)


class SentencesService(Base):

    async def get(self, uuid, tuid, suids):
        try:
            collection = 'uuid_{}.tuid_{}.sentences'.format(uuid, tuid)
            resp = await self.db[collection].find(
                {'suid': {'$in': suids}},
                {'_id': 0, 'sent': 1}).to_list(None)
            sentences = [s['sent'] for s in resp]

            response = {'status_code': 200, 'data': sentences}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def insert(self, uuid, tuid, sentences):
        try:
            data = []
            created_timestamp = self.set_local_timezone(datetime.now())
            for sent in sentences:
                data.append({
                    'uuid': uuid,
                    'tuid': tuid,
                    'suid': uuid_generator.uuid4().hex,
                    'sent': sent,
                    'created_timestamp': created_timestamp
                })

            collection = 'uuid_{}.tuid_{}.sentences'.format(uuid, tuid)
            self._create_sent_collection_indexes(uuid, tuid)
            await self.db[collection].insert_many(data)

            response = {'status_code': 200}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def get_unmined(self, uuid, tuid, limit=100):
        try:
            collection = 'uuid_{}.tuid_{}.sentences'.format(uuid, tuid)
            sentences = await self.db[collection].find(
                {'submitted_timestamp': {'$exists': False}},
                {'sent': 1, 'suid': 1, '_id': 0}).to_list(limit)

            response = {'status_code': 200, 'data': sentences}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def mark_as_submitted(self, uuid, tuid, suids):
        try:
            collection = 'uuid_{}.tuid_{}.sentences'.format(uuid, tuid)

            await self.db[collection].update_many(
                {'suid': {'$in': suids}},
                {'$set': {
                    'submitted_timestamp': self.set_local_timezone(
                        datetime.now())
                }}
            )

            response = {'status_code': 200}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def get_mined_total_number(self, uuid, tuid):
        try:
            collection = 'uuid_{}.tuid_{}.sentences'.format(uuid, tuid)
            mined_count = await self.db[collection].count_documents(
                {'mined_timestamp': {'$exists': True}}
            )
            response = {'status_code': 200, 'data': mined_count}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def mark_as_mined(self, uuid, tuid, suid):
        try:
            collection = 'uuid_{}.tuid_{}.sentences'.format(uuid, tuid)

            await self.db[collection].update_one(
                {'suid': suid},
                {'$set': {
                    'mined_timestamp': self.set_local_timezone(datetime.now())
                }}
            )
            response = {'status_code': 200}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    def _create_sent_collection_indexes(self, uuid, tuid):
        collection = 'uuid_{}.tuid_{}.sentences'.format(uuid, tuid)

        self.db[collection].create_index(
            [("suid", pymongo.ASCENDING)], unique=False)
        self.db[collection].create_index(
            [("mined_timestamp", pymongo.ASCENDING)], unique=False)
