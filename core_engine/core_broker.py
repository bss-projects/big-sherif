#!/usr/bin/python
# -*- coding: utf-8 -*-

import ast
import configclass
import json
import redis
import requests
import sys
import time

Conf = configclass.ConfObjClass('BigSherif.cfg', 'BigSherif_configcheck.cfg')

database_address = Conf.database_address
redis_address = Conf.redis_address
redis_port = Conf.redis_port

def channel_event(hname, event, r, type=None):
	id, id_data = event.keys()[0], event.values()[0]

	if 'core_sender' in id_data:
		id_data.pop('core_sender')

	r.hset(hname, id, json.dumps(id_data))

	if type == None:
		r.hset(hname+'_change', id, 1)
	elif type == 'current_events':
		r.hset(hname+'_change', id, id_data['_id'])
	elif type == 'event_log':
		pass
	elif type == 'events':
		pass

def push_pipeline(hname, d_data, pipeline, spec_hname=""):
	
	for key, value in d_data.items():
		rev = value.pop('_rev')

		if spec_hname == "":
			pipeline.hset(hname+'_rev', key, rev)
		else:
			pipeline.hset(spec_hname, value['_id'], rev)

		pipeline.hset(hname, key, json.dumps(value))

def init_dict_from_couch(db_name, view_name):
	d_db_data = {}

	query_string = "include_docs=true"

	view_content = requests.get(database_address+"/big_sherif_"+db_name+"/_design/"+db_name+"/_view/"+view_name+"?"+query_string)

	for row in view_content.json()['rows']:
		d_db_data[row['key']] = row['doc']

	return d_db_data

def get_doc_from_couch(db_name, doc_name):
	d_db_doc = {}

	d_db_doc[doc_name] = requests.get(database_address+"/big_sherif_"+db_name+"/"+doc_name).json()
	
	return d_db_doc

d_db_current_events = init_dict_from_couch('currentevents','current-hostname-resource')
d_db_hostlist = init_dict_from_couch('hosts','hostlist')
d_db_unmanaged = init_dict_from_couch('unmanaged', 'componentunmanagedlist')

d_db_connectorlist_doc = get_doc_from_couch('config', 'connector_list')


r = redis.Redis(redis_address, redis_port)
r.flushall()
pipeline = r.pipeline()

push_pipeline('current_events', d_db_current_events, pipeline, 'events_rev')
push_pipeline('hosts', d_db_hostlist, pipeline)
push_pipeline('unmanaged', d_db_unmanaged, pipeline)
push_pipeline('connector_doc', d_db_connectorlist_doc, pipeline)


#for key, value in d_db_current_events.items():
#	pipeline.hset('current_events', key, json.dumps(value))

pipeline.execute()

#temp_dic = r.hgetall('current_events')

channel = r.pubsub()
channel.subscribe(['ch_current_events', 'ch_events', 'ch_event_log', 'ch_hosts', 'ch_connector_doc', 'ch_unmanaged'])

#print temp_dic

print '[Broker ready]'

#try:
for item in channel.listen():
	if item['type'] == 'message':
		print '-*****************-'
		print item
		if item['data'] != '':
			event = ast.literal_eval(item['data'])
			if item['channel'] == 'ch_current_events':
				print 'Current Event :'
				channel_event('current_events', event, r, 'current_events')
			elif item['channel'] == 'ch_events':
				print 'Event :'
				channel_event('events', event, r, 'events')
			elif item['channel'] == 'ch_hosts':
				print 'Host :'
				channel_event('hosts', event, r)
			elif item['channel'] == 'ch_unmanaged':
				print 'Host :'
				channel_event('unmanaged', event, r)
			elif item['channel'] == 'ch_event_log':
				print 'Event log :'
				channel_event('event_log', event, r, 'event_log')
			elif item['channel'] == 'ch_connector_doc':
				print 'Connector doc event :'
				channel_event('connector_doc', event, r)

			print event
			print '+----------------+'
#except:
#	pass