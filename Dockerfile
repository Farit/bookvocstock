FROM myvocstock_core

COPY . /home/myvocstock/web_interface
WORKDIR /home/myvocstock/web_interface


RUN python3.5 -m pip install -vr requirements/prod.txt

RUN chown -R myvocstock:myvocstock /home/myvocstock
USER myvocstock


CMD sh /home/myvocstock/core/wait_for_rabbitmq.sh && python3.5 app/run.py --config=etc/prod.conf
