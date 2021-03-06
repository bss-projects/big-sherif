#!/usr/bin/env python
import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters(
               'localhost', 5672, 'canopsis'))
channel = connection.channel()

channel.exchange_declare(exchange='canopsis.events', exchange_type='topic', durable=True, auto_delete=False)

result = channel.queue_declare(exclusive=True)
queue_name = result.method.queue

binding_keys = ["#"]

for binding_key in binding_keys:
    channel.queue_bind(exchange='canopsis.events',
                       queue=queue_name,
                       routing_key=binding_key)

print ' [*] Waiting for logs. To exit press CTRL+C'

def callback(ch, method, properties, body):
    print " [x] %r:%r" % (method.routing_key, body,)

channel.basic_consume(callback,
                      queue=queue_name,
                      no_ack=True)

channel.start_consuming()

