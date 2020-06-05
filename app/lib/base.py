import tzlocal
import logging

logger = logging.getLogger(__name__)


class Base:

    def __init__(self, db):
        self.db = db

    @staticmethod
    def set_local_timezone(datetime_obj):
        """Setting local time zone to naive datetime object
        Args:
            datetime_obj (Datetime): naive datetime object
        Returns:
            datetime object with time zone
        """
        tz = tzlocal.get_localzone()
        return tz.localize(datetime_obj)

    def create_indexes(self):
        pass

