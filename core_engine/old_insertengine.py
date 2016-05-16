#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pika
import sys
import couchdb
import json
import time
from uuid import uuid4

#null = None

couch = couchdb.Server('http://127.0.0.1:5984/')

#db = couch['test']

db_events = couch['big_sherif_events']
db_currentevents = couch['big_sherif_currentevents']
db_hosts = couch['big_sherif_hosts']
db_conf = couch['big_sherif_config']

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

def currentevent(rb_content, doc_id_event):
	
	flag = 0
	event_info = {}
	timestamp = rb_content['timestamp']
	hostname = rb_content['component']
	address = rb_content['address']
	connector = rb_content['connector']
	connector_name = rb_content['connector_name']
	command_name = rb_content['command_name']
	output = rb_content['output']
	state = rb_content['state']
	source_type = rb_content['source_type']
	if source_type == "component" :
	  resource = "Host status"
	else :
	  resource = rb_content['resource']
	current_event_id = hostname+'-'+resource

	event_info = {current_event_id: {'hostname': hostname, 
								'resource': resource, 
								'state': state,
								'output': output,
								'timestamp': timestamp,
								'event_id': doc_id_event
								}
				}

	db_currentevent_doc = db.get('currentevent')

	if db_currentevent_doc == None :
		db['currentevent'] = {'events': event_info} 
	else :
		for (event_id_k, value) in db_currentevent_doc['events'].items() :
			if event_id_k == current_event_id:
				flag = 1
				if value['state'] != state :
					del db_currentevent_doc['events'][event_id_k]
					db_currentevent_doc['events'].update(event_info)
					db[db_currentevent_doc.id] = db_currentevent_doc
					break
					
		if flag == 0 :
			db_currentevent_doc['events'].update(event_info)
			db[db_currentevent_doc.id] = db_currentevent_doc

def eventlog(rb_content, doc_id_event):
	
	event_info = {}
	timestamp = rb_content['timestamp']
	hostname = rb_content['component']
	address = rb_content['address']
	connector = rb_content['connector']
	connector_name = rb_content['connector_name']
	command_name = rb_content['command_name']
	output = rb_content['output']
	state = rb_content['state']
	source_type = rb_content['source_type']
	if source_type == "component" :
	  resource = "Host status"
	else :
	  resource = rb_content['resource']

	event_info = {doc_id_event: {'hostname': hostname, 
								'resource': resource, 
								'state': state,
								'output': output,
								'timestamp': timestamp
								}
				}

	db_eventlog_doc = db.get('eventlog')
	if db_eventlog_doc == None :
		db['eventlog'] = {'events': event_info} 
	else :
		db_eventlog_doc['events'].update(event_info)
		db[db_eventlog_doc.id] = db_eventlog_doc



def callback(ch, method, properties, body):
#	time.sleep(1)
	update_doc = {}
	flag = 0
	doc_id_event = uuid4().hex
	rb_content = json.loads(body)
	
	timestamp = rb_content['timestamp']
	hostname = rb_content['component']
	address = rb_content['address']
	connector = rb_content['connector']
	connector_name = rb_content['connector_name']
	connector_hostname = rb_content['connector_hostname']
	connector_hostip = rb_content['connector_hostip']
	command_name = rb_content['command_name']
	output = rb_content['output']
	state = rb_content['state']
	source_type = rb_content['source_type']
	if source_type == "component" :
	  resource = "Host status"
	else :
	  resource = rb_content['resource']

	db_connector_list_doc = db.get('connector_list')

	if db_connector_list_doc == None :
		db['connector_list'] = {'connector_list': {}}
		return
	elif connector_name not in db_connector_list_doc['connector_list'] :
		db_connector_list_doc['connector_list'][connector_name] = {'connector': connector, 'connector_hostname': connector_hostname, 'connector_hostip': connector_hostip, 'connector_status': 0}
		db[db_connector_list_doc.id] = db_connector_list_doc
		return
	elif db_connector_list_doc['connector_list'][connector_name]['connector_hostip'] != connector_hostip :
		db_connector_list_doc['connector_list'][connector_name] = {'connector': connector, 'connector_hostname': connector_hostname, 'connector_hostip': connector_hostip, 'connector_status': 0}
		db[db_connector_list_doc.id] = db_connector_list_doc
		return
	elif db_connector_list_doc['connector_list'][connector_name]['connector_status'] != 2:
		return

	db[doc_id_event] = rb_content

	db_host_doc = db.get(hostname)

#@Todo Attention creation de host qd host pas connu au moment de reception de event
# qd host connu on ne modifie que le tableau des event du host.
# donc si les infos de host on change dans event on ne les fait pas changer
# voir si on conserve en letat ou si on check les change des infos de l'host dans l'event
	
	if db_host_doc == None :
	  db[hostname] = {'address': address, 'connector': connector, 'connector_name': connector_name, 'check': {resource: {'output': output, 'state': state, 'event_id': doc_id_event, 'command_name': command_name, 'timestamp': timestamp}}}
	else :
	  if 'check' not in db_host_doc:
		db_host_doc['check'] = {}
	  else :
	   for (resource_k, value) in db_host_doc['check'].items():
	    if resource_k == resource:
	      flag = 1
	      update_doc[resource_k] = {'output': output, 'state': state, 'event_id': doc_id_event, 'command_name': command_name, 'timestamp': timestamp}
	    else:
	      update_doc[resource_k] = value
	  
	  if flag == 0:
	    update_doc[resource] = {'output': output, 'state': state, 'event_id': doc_id_event, 'command_name': command_name, 'timestamp': timestamp}
	  
	  db_host_doc['check'] = update_doc
	  db[db_host_doc.id] = db_host_doc
	
	#eventlog(rb_content, doc_id_event)
	#currentevent(rb_content, doc_id_event)
	
	#print " [x] %r:%r" % (method.routing_key, body,)
	#print " [x] %r:%r" % (doc_id_event, body,)

channel.basic_consume(callback,
                      queue=queue_name,
                      no_ack=True)

channel.start_consuming()

