import re
import string
import logging


from nltk.tokenize import sent_tokenize

from lib.base import Base

logger = logging.getLogger(__name__)


class SegmentationService(Base):

    async def get_sentences(self, file):
        sentences = []
        for sentence in sent_tokenize(file):
            # Order matters
            sentence = self._remove_surplus_whitespace(sentence)
            sentence = self._remove_needless_characters(sentence)
            if sentence:
                sentences.append(sentence)
        return {'status_code': 200, 'data': {'sentences': sentences}}

    @staticmethod
    def _remove_surplus_whitespace(sentence):
        return re.sub(r'\s+', ' ', sentence).strip(" ")

    @staticmethod
    def _remove_needless_characters(sentence):
        sent = re.sub(r'^[ 0-9' + string.punctuation + ']*', '', sentence)
        sent = re.sub(r'\[image:.*\]', '', sent)
        return sent
