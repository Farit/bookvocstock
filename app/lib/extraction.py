import re
import json
import os
import zipfile
import subprocess
import base64
import motor
import tempfile
import logging

from lib.base import Base

logger = logging.getLogger(__name__)


class ExtractionService(Base):
    async def extract(self, uuid, tuid, file):
        gridin = None
        try:
            # fs = motor.MotorGridFSBucket(self.db)

            with tempfile.TemporaryDirectory() as tmpdirname:
                with tempfile.NamedTemporaryFile(dir=tmpdirname) as original_fh:
                    decoded_file = base64.b64decode(file.split('base64,')[-1])
                    original_fh.write(decoded_file)

                    # gridin, file_id = fs.open_upload_stream('test_file')
                    # await gridin.write(decoded_file)
                    # await gridin.set('uuid', uuid)
                    # await gridin.set('tuid', tuid)

                    raw_file_path = original_fh.name
                    file_type, charset = self._detect_file_type(raw_file_path)

                    if file_type == 'text/plain':
                        metadata = {}
                        text = decoded_file.decode(charset)
                    else:
                        extracted_file_path = os.path.join(tmpdirname, tuid)
                        text, metadata = self._get_data(
                            raw_file_path, extracted_file_path)

                    metadata['file_type'] = file_type
                    # await gridin.set('metadata', metadata)

            response = {
                'status_code': 200,
                'data': {
                    'tuid': tuid,
                    'title': metadata.get('dc:title', ''),
                    'text_type': 'book',
                    'text_attrs': {
                        'author': metadata.get('meta:author', '')
                    },
                    'text': text,
                }
            }

        except Exception as err:
            logger.critical(err, exc_info=True)
            return {'status_code': 500}

        else:
            return response

        finally:
            if gridin is not None:
                await gridin.close()

    def _detect_file_type(self, raw_file_path):
        try:
            command = 'curl -H "Accept:application/json" -T {}'
            command += ' http://localhost:9998/meta'

            p = subprocess.Popen(
                command.format(raw_file_path),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=True)
            output = p.communicate()

            meta = json.loads(output[0].decode('utf-8'))
            charset = meta.get('Content-Encoding', 'utf-8')
            file_type = meta.get('Content-Type', '').split(';')[0]
            return file_type, charset

        except Exception as err:
            logger.critical(err, exc_info=True)

    @staticmethod
    def _get_data(raw_file_path, extracted_file_path):
        command = 'curl -T {} http://localhost:9998/unpack/all > {}'
        p = subprocess.Popen(
            command.format(raw_file_path, extracted_file_path),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True)
        p.communicate()

        with zipfile.ZipFile(extracted_file_path) as zip_fh:
            text = zip_fh.read("__TEXT__").decode('utf-8')

            _metadata = zip_fh.read('__METADATA__').decode('utf-8')
            metadata = {}
            for line in _metadata.split('\n'):
                if line.strip():
                    try:
                        key, value = re.split(
                            r'''['"],['"]''', line, maxsplit=1)
                        key = key.strip('"''')
                        value = value.strip('"''')
                        metadata[key] = value
                    except Exception:
                        pass

        return text, metadata
