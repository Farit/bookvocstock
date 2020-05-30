import os
import site
import argparse
import logging
import logging.config

project_dir = os.path.dirname(os.path.abspath(__file__))
site.addsitedir(project_dir)

# Change the scripts working directory to the script's own directory,
# so that relative paths will work.
os.chdir(project_dir)

from log_config import log_config_as_dict

logging.config.dictConfig(log_config_as_dict)

from app import Application


def run(port, debug_server_mode):
    app = Application(port=port, debug_server_mode=debug_server_mode)
    app.start()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8003)
    parser.add_argument('--debug-server-mode', action='store_true')
    args = parser.parse_args()
    run(port=args.port, debug_server_mode=args.debug_server_mode)

