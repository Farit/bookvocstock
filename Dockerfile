FROM python:3.8
RUN pip install pipenv
COPY . /bookvocstock
WORKDIR /bookvocstock
RUN pipenv install
RUN pipenv run python -m nltk.downloader punkt averaged_perceptron_tagger wordnet
ENV SHELL=/bin/bash
ENTRYPOINT ["pipenv", "run"]
CMD ["python", "app/run.py", "--port", "8003", "--debug-server-mode"]
