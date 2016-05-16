import pika


def on_message(channel, method_frame, header_frame, body):
    print method_frame.delivery_tag
    print body
    print
    channel.basic_ack(delivery_tag=method_frame.delivery_tag)


connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', 5672, 'canopsis'))
channel = connection.channel()
channel.exchange_declare(exchange='canopsis.events', exchange_type='topic', durable=True, auto_delete=False)

result = channel.queue_declare(exclusive=False)
queue_name = result.method.queue

binding_keys = ["#"]

for binding_key in binding_keys:
    channel.queue_bind(exchange='canopsis.events',
                       queue=queue_name,
                       routing_key=binding_key)

channel.basic_consume(on_message, queue=queue_name)
try:
    channel.start_consuming()
except KeyboardInterrupt:
    channel.stop_consuming()
connection.close()
