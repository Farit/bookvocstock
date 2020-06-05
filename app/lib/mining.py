import os
import re
import logging

import nltk

from nltk.stem import RegexpStemmer
from nltk.corpus.reader import wordnet
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.tokenize import word_tokenize

from lib.base import Base

logger = logging.getLogger(__name__)


class MiningService(Base):

    def __init__(self, db):
        super().__init__(db)
        self.nltk_data_path = os.path.join(os.getcwd(), 'nltk_data')

        # Remove affixes from a word: it's -> it, we'll -> we
        stemmer_pattern = r"â€™s$|nâ€™t$|â€™ll$|â€™re$|â€™ve$|â€™d$|â€™m$|'s$"
        stemmer_pattern += r"|n't$|'ll$|'re$|'ve$|'d$|'m$|"
        self.stemmer = RegexpStemmer(stemmer_pattern)

        # Part-of-speech tagger
        self.tagger = nltk.tag.pos_tag
        self.wordnetlemmatize = WordNetLemmatizer()

        self._stop_words = None
        self._junk_symbols = None
        self._proper_nouns = None

    def start(self):
        nltk.download('averaged_perceptron_tagger',
                      download_dir=self.nltk_data_path)
        nltk.download('wordnet', download_dir=self.nltk_data_path)
        nltk.data.path.append(self.nltk_data_path)
        super().start()

    async def stop_words(self):
        if self._stop_words is None:
            docs = await self.db.stop_words.find({}, {'_id': 0}).to_list(None)
            self._stop_words = [doc['word'] for doc in docs]
        return self._stop_words

    async def junk_symbols(self):
        if self._junk_symbols is None:
            docs = await self.db.junk_symbols.find({}, {'_id': 0}).to_list(None)
            self._junk_symbols = [doc['symbol'] for doc in docs]
        return self._junk_symbols

    async def proper_nouns(self):
        if self._proper_nouns is None:
            docs = await self.db.proper_nouns.find({}, {'_id': 0}).to_list(None)
            self._proper_nouns = [doc['word'] for doc in docs]
        return self._proper_nouns

    async def parse_sentence(self, uuid, tuid, suid, sentence):
        words = []
        for w in (w.rstrip('â€™') for w in word_tokenize(sentence.lower())):
            if w.strip():
                words.append(w)

        data = {
            'suid': suid,
            'uuid': uuid,
            'tuid': tuid,
            'words': words
        }
        data['lemmas'] = await self.mine_lemma_data(data['words'])
        return {'status_code': 200, 'data': data}

    async def mine_lemma_data(self, words):
        data = []
        for word, treebank_tag in self.tagger(words):
            lemword, part_of_speech = self.normalize_word(
                word.lower(), treebank_tag)

            if part_of_speech == 'proper_noun':
                continue

            if ((await self._is_not_stop_word(lemword)) and
               (await self._is_not_junk_symbol(lemword)) and
               (await self._is_not_proper_noun(lemword)) and
               self._is_legible_word(lemword)):

                data.append({
                    'lemword': lemword, 'part_of_speech': part_of_speech})
        return data

    async def _is_not_stop_word(self, word):
        return word not in (await self.stop_words())

    async def _is_not_junk_symbol(self, word):
        return word not in (await self.junk_symbols())

    async def _is_not_proper_noun(self, word):
        return word not in (await self.proper_nouns())

    @staticmethod
    def _is_legible_word(word):
        return re.search(r'^[a-zA-Z].*', word) is not None

    def normalize_word(self, word, treebank_tag):
        """Lemmatizing and stemming words.
           stemming: to remove affixes from a word, e.g we'll -> we
           lemmatizing: bring word to a root, e.g ran -> run, looking -> look
        """
        wordnet_pos, part_of_speech = self.get_wordnet_pos(treebank_tag)

        if wordnet_pos == wordnet.NOUN and part_of_speech == 'proper':
            return word, 'proper_noun'

        lemword = self.wordnetlemmatize.lemmatize(word, wordnet_pos)
        return self.stemmer.stem(lemword), part_of_speech

    @staticmethod
    def get_wordnet_pos(treebank_tag):
        """Treebank part-of-speech tagging correspondence to wordnet"""

        if treebank_tag == 'NNP':
            return wordnet.NOUN, 'proper'

        # JJ-adjective
        # JJR-adjective, comparative
        # JJS-adjective, superlative
        elif treebank_tag.startswith('J'):
            return wordnet.ADJ, 'adj'

        # VB-verb, base form
        # VBD-verb, past tense
        # VBG-verb, gerund or present participle; VBN-verb, past participle
        # VBP-verb, non-3rd person singular present
        # VBZ-verb, 3rd person singular present
        elif treebank_tag.startswith('V'):
            return wordnet.VERB, 'verb'

        # RB-adverb
        # RBR-adverb, comparative
        # RBS-adverb, superlative
        # RP-particle
        elif treebank_tag.startswith('R'):
            return wordnet.ADV, 'adv'

        # NN-noun
        elif treebank_tag.startswith('N'):
            return wordnet.NOUN, 'noun'

        # default
        else:
            return wordnet.NOUN, ''
