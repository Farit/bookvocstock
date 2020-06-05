import logging
import tornado.web

from handlers.text import text
from lib.mining_manager import MiningManagerService

logger = logging.getLogger(__name__)


class TextMiningHandler(text.TextHandler):

    @tornado.web.authenticated
    async def post(self, tuid):
        mining_manager = MiningManagerService(db=self.db)
        await mining_manager.start_mining(
            uuid=self.current_user['uuid'],
            tuid=tuid
        )
