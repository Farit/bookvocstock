import sys
import logging


class StreamStdOutHandler(logging.StreamHandler):
    def __init__(self):
        super().__init__(stream=sys.stdout)
        self.addFilter(lambda record: record.levelno < logging.WARN)


class StreamStdErrorHandler(logging.StreamHandler):
    def __init__(self):
        super().__init__(stream=sys.stderr)
        self.addFilter(lambda record: record.levelno >= logging.WARN)


# The dictionary of base configuration information.
# Clients may add additional information or overwrite existing one before
# passing it to the logging.config.dictConfig() function
# https://docs.python.org/3/library/logging.config.html#logging.config.dictConfig
log_config_as_dict = {
    'version': 1,
    'disable_existing_loggers': False,
    # root logger
    'root': {
        'level': 'DEBUG',
        'handlers': ['console_stdout_default', 'console_stderr_default', 'file'],
    },
    'formatters': {
        'default': {
            'format': (
                '[%(asctime)s] (%(pathname)s:%(lineno)d) '
                '%(levelname)s# %(name)s:: %(message)s'
            ),
        },
        'simple': {
            'format': (
                '[%(asctime)s] %(levelname)s# %(message)s'
            ),
        },
        'precise': {
            'format': (
                '[%(asctime)s] [%(process)d:%(threadName)s] [%(levelname)s] '
                '[%(name)s] {%(pathname)s:%(lineno)d} %(message)s'
            )

        }
    },
    'handlers': {
        'console_stdout_default': {
            '()': StreamStdOutHandler,
            'formatter': 'default',
            'level': 'DEBUG'
        },
        'console_stderr_default': {
            '()': StreamStdErrorHandler,
            'formatter': 'default',
        },
        'console_stdout_simple': {
            '()': StreamStdOutHandler,
            'formatter': 'simple',
            'level': 'DEBUG'
        },
        'console_stderr_simple': {
            '()': StreamStdErrorHandler,
            'formatter': 'simple',
        },
        'file': {
            'class': 'logging.FileHandler',
            'level': 'DEBUG',
            'formatter': 'precise',
            'filename': '/tmp/bookvocstock.log',
        }
    },
    # Add here you custom loggers or specify logging for third-party modules.
    'loggers': {
        # Example of configuration of the python "tornado" module logging
        # 'tornado': {
        #     'handlers': ['file'],
        #     'level': 'INFO'
        # },
    }
}
