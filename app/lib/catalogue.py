import logging
import uuid as uuid_generator

import pymongo

from datetime import datetime

from lib.base import Base
logger = logging.getLogger(__name__)


class CatalogueService(Base):

    def create_indexes(self):
        logger.info('Index: %s.records: uuid - ASCENDING', self.db.name)
        self.db.records.create_index(
            [("uuid", pymongo.ASCENDING)], unique=False)

        logger.info('Index: %s.records: tuid - ASCENDING', self.db.name)
        self.db.records.create_index(
            [("tuid", pymongo.ASCENDING)], unique=False)

    async def create_record(self, uuid):
        try:
            tuid = uuid_generator.uuid4().hex
            created_timestamp = self.set_local_timezone(datetime.now())
            await self.db.records.insert_one({
                'uuid': uuid,
                'tuid': tuid,
                'created_timestamp': created_timestamp
            })
            response = {'status_code': 200,
                        'data': {'uuid': uuid, 'tuid': tuid}}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def update_record(self, uuid, tuid, **kwargs):
        data = {key: value for key, value in kwargs.items()}
        try:
            await self.db.records.update_one(
                {'uuid': uuid, 'tuid': tuid}, {'$set': data})
            response = {'status_code': 200}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def get(self, uuid, tuid=None):
        """Retrieves catalogue information of the uploaded texts.
        if tuid is None, then returns all user texts catalogue information,
        else returns text with specified identifier tuid

        Args:
            uuid(str): user identifier,
            tuid(str): text identifier

        Returns:
            a list with text or texts
        """
        try:
            query = {'uuid': uuid, 'submitted_timestamp': {'$exists': True}}
            if tuid is not None:
                query['tuid'] = tuid

            project = {
                '_id': 0, 'created_timestamp': 0,  'submitted_timestamp': 0
            }
            records = await self.db.records.find(query, project).sort(
                'created_timestamp', pymongo.DESCENDING).to_list(None)
            response = {'status_code': 200, 'data': records}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def mark_record_as_submitted(self, uuid, tuid):
        response = await self.update_record(
            uuid=uuid, tuid=tuid,
            submitted_timestamp=self.set_local_timezone(datetime.now())
        )
        return response