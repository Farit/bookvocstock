import logging

from datetime import datetime

import pymongo

from lib.base import Base

logger = logging.getLogger(__name__)


class VocabularyService(Base):
    def __init__(self, db):
        super().__init__(db)
        self.state_machine = {
            'unknown': {
                'learning': self._add,
                'known': self._add,
                'familiar': self._add
            },
            'learning': {
                'unknown': self._remove,
                'known': self._move,
                'familiar': self._move
            },
            'known': {
                'unknown': self._remove,
                'learning': self._move,
                'familiar': self._move
            },
            'familiar': {
                'unknown': self._remove,
                'learning': self._move,
                'known': self._move
            }
        }

    def create_indexes(self):
        logger.info(
            'Index: %s.lexicon: uuid - ASCENDING', self.db.name)
        self.db.lexicon.create_index(
            [("uuid", pymongo.ASCENDING)], unique=False)

    async def get_lexicon(self, uuid):
        try:
            lexicon = {}

            query = {'uuid': uuid}
            project = {'_id': 0, 'uuid': 0}
            cursor = self.db.lexicon.find(query, project)

            while await cursor.fetch_next:
                doc = cursor.next_object()
                lexicon[doc['lexeme']] = doc['stage']

            response = {'status_code': 200, 'data': lexicon}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def get_total_vocabulary_by_date(self, uuid):
        try:
            data = {}

            query = {'uuid': uuid}
            project = {'_id': 0, 'uuid': 0}
            cursor = self.db.lexicon.find(query, project)

            while await cursor.fetch_next:
                doc = cursor.next_object()
                day = datetime(
                    doc['timestamp'].year, doc['timestamp'].month,
                    doc['timestamp'].day
                )
                day_stats = data.setdefault(
                    day,
                    {'total': 0, 'known': 0, 'familiar': 0, 'learning': 0}
                )
                if 'date' not in day_stats:
                    day_stats['date'] = doc['timestamp'].strftime(
                        '%b %d, %Y').lower()
                day_stats['total'] += 1
                day_stats[doc['stage']] += 1

            result = []
            data_sorted = sorted(data.items(), key=lambda item: item[0])
            for ind, value in enumerate(data_sorted):
                if ind == 0:
                    result.append(value[1])
                else:
                    value[1]['total'] += result[ind - 1]['total']
                    value[1]['known'] += result[ind - 1]['known']
                    value[1]['learning'] += result[ind - 1]['learning']
                    value[1]['familiar'] += result[ind - 1]['familiar']
                    result.append(value[1])

            response = {'status_code': 200, 'data': {'voc_by_date': result}}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def update(self, uuid, word, current_stage, to_stage):
        try:
            data = {'word': word, 'stage': to_stage}
            method = self.state_machine[current_stage][to_stage]
            await method(uuid, **data)

            response = {'status_code': 200}

        except Exception as err:
            logger.critical(err, exc_info=True)
            response = {'status_code': 500}

        return response

    async def _add(self, uuid,  **kwargs):
        try:
            await self.db.lexicon.insert_one({
                'lexeme': kwargs['word'],
                'uuid': uuid,
                'stage': kwargs['stage'],
                'timestamp': datetime.now()
            })

        except Exception as err:
            logger.critical(err, exc_info=True)

    async def _move(self, uuid, **kwargs):
        try:
            await self.db.lexicon.update_one(
                {'uuid': uuid, 'lexeme': kwargs['word']},
                {'$set': {'stage': kwargs['stage']}}
            )
        except Exception as err:
            logger.critical(err, exc_info=True)

    async def _remove(self, uuid,  **kwargs):
        try:
            await self.db.lexicon.delete_many(
                {'uuid': uuid, 'lexeme': kwargs['word']})
        except Exception as err:
            logger.critical(err, exc_info=True)
