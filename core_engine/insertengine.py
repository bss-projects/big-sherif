#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pika
import sys
import couchdb
import json
import time
import requests
import redis
import ast
import argparse
import configclass
from initnupdatestreamclass import InitnUpdateClass
from initnupdatefromredisclass import InitnUpdateFromRedisClass
from uuid import uuid4
from multiprocessing import Process, Queue

parser = argparse.ArgumentParser(description='BigSherif Core insert engine')
parser.add_argument('-n', '--name', required=True, help='Insert engine name : a name to identify instance in different action')
args = parser.parse_args()

core_sender = args.name

Conf = configclass.ConfObjClass('BigSherif.cfg', 'BigSherif_configcheck.cfg')

proxies = Conf.proxies
database_address = Conf.database_address
amqp_address = Conf.amqp_address
amqp_port = Conf.amqp_port
redis_address = Conf.redis_address
redis_port = Conf.redis_port
couch = couchdb.Server(database_address)
rc = Conf.r

db_currentevents = couch['big_sherif_currentevents']
db_hosts = couch['big_sherif_hosts']

connection = pika.BlockingConnection(pika.ConnectionParameters(
               amqp_address, amqp_port, 'canopsis'))
channel = connection.channel()

channel.exchange_declare(exchange='canopsis.events', exchange_type='topic', durable=True, auto_delete=False)

result = channel.queue_declare(queue='event_queue', exclusive=False, auto_delete=True)
queue_name = result.method.queue

binding_keys = ["#"]

for binding_key in binding_keys:
    channel.queue_bind(exchange='canopsis.events',
                       queue=queue_name,
                       routing_key=binding_key)

print ' [*] Waiting for logs. To exit press CTRL+C'

def unmanaged_continuous_update(unmanaged_queue, unmanaged_changes_stream, database_address, db_name, view_name):
	
	for line in unmanaged_changes_stream.iter_lines():
		if line:
			unmanaged_component = {}

			query_string = "include_docs=true"

			view_content = requests.get(database_address+"/big_sherif_"+db_name+"/_design/"+db_name+"/_view/"+view_name+"?"+query_string)

			for row in view_content.json()['rows']:
				if row['key'] not in unmanaged_component:
					unmanaged_component[row['key']] = [{'start_date': row['doc']['start_date'],
												'end_date': row['doc']['end_date'],
												'is_activated': row['doc']['is_activated'],
												'is_over': row['doc']['is_over'],
												'component': row['doc']['component'],
												'_id': row['doc']['_id'],
												'_rev': row['doc']['_rev']}]
				else:
					unmanaged_component[row['key']].append({'start_date': row['doc']['start_date'],
												'end_date': row['doc']['end_date'],
												'is_activated': row['doc']['is_activated'],
												'is_over': row['doc']['is_over'],
												'component': row['doc']['component'],
												'_id': row['doc']['_id'],
												'_rev': row['doc']['_rev']})

			if unmanaged_component != {}:
				print unmanaged_component
				unmanaged_queue.put(unmanaged_component)

def restrictlist_continuous_update(restrictlist_queue, restrictlist_changes_stream, database_address, db_name, view_name):
	
	for line in restrictlist_changes_stream.iter_lines():
		if line:
			restrictlist_rules = {}

			query_string = "include_docs=true"

			view_content = requests.get(database_address+"/big_sherif_"+db_name+"/_design/"+db_name+"/_view/"+view_name+"?"+query_string, proxies=proxies)

			for row in view_content.json()['rows']:
				restrictlist_rules[row['key']] = {'label': row['doc']['label'],
												'criticality': row['doc']['criticality'],
												'hostname': row['doc']['hostname'],
												'connector_name': row['doc']['connector_name'],
												'resource': row['doc']['resource'],
												'desc' : row['doc']['desc'],
												'order' : row['doc']['order'],
												'balance' : row['doc']['balance'],
												'stop' : row['doc']['stop'],
												'_id': row['doc']['_id'],
												'_rev': row['doc']['_rev']}

			if restrictlist_rules != {}:
				restrictlist_queue.put(restrictlist_rules)

def current_event_continuous_update(current_event_queue, redis_channel_name):

	redis_channel = rc.pubsub()
	redis_channel.subscribe([redis_channel_name])

	for item in redis_channel.listen():
		if item['type'] == 'message':
			current_event_update = {}

			event = ast.literal_eval(item['data'])
			current_event_id, event_data = event.keys()[0], event.values()[0]

			current_event_update[current_event_id] = event_data

			if current_event_update != {} and event_data['core_sender'] != core_sender:
				current_event_queue.put(current_event_update)

def hosts_continuous_update(hosts_queue, redis_channel_name):

	redis_channel = rc.pubsub()
	redis_channel.subscribe([redis_channel_name])

	for item in redis_channel.listen():
		if item['type'] == 'message':
			hosts_update = {}

			event = ast.literal_eval(item['data'])
			hostname, host_values = event.keys()[0], event.values()[0]

			hosts_update[hostname] = host_values

			if hosts_update != {} and host_values['core_sender'] != core_sender:
				hosts_queue.put(hosts_update)

#def init_current_event_dict(db_currentevents):
#	d_db_current_events = {}

#	for row in db_currentevents.view('currentevents/current-hostname-resource', include_docs=True):
#		d_db_current_events[row.key] = row.doc
#	return d_db_current_events

def init_from_redis_dict(hash_name):
	d_dbr_data = {}

	temp_dic = rc.hgetall(hash_name)

	for key, value in temp_dic.items():
		d_dbr_data[key] = json.loads(value)
	return d_dbr_data

def init_unmanaged_component_dict(db_name, view_name):
	d_unmanaged_component = {}

	query_string = "include_docs=true"

	view_content = requests.get(database_address+"/big_sherif_"+db_name+"/_design/"+db_name+"/_view/"+view_name+"?"+query_string, proxies=proxies)

	for row in view_content.json()['rows']:
		if row['key'] not in d_unmanaged_component:
			d_unmanaged_component[row['key']] = [{'start_date': row['doc']['start_date'],
											'end_date': row['doc']['end_date'],
											'is_activated': row['doc']['is_activated'],
											'is_over': row['doc']['is_over'],
											'component': row['doc']['component'],
											'_id': row['doc']['_id'],
											'_rev': row['doc']['_rev']
											}]
		else:
			d_unmanaged_component[row['key']].append({'start_date': row['doc']['start_date'],
											'end_date': row['doc']['end_date'],
											'is_activated': row['doc']['is_activated'],
											'is_over': row['doc']['is_over'],
											'component': row['doc']['component'],
											'_id': row['doc']['_id'],
											'_rev': row['doc']['_rev']
											})


	r = requests.get(database_address+"/big_sherif_"+db_name+"/_changes", proxies=proxies)
	last_seq = r.json()['last_seq']

	unmanaged_changes_stream = requests.get(database_address+"/big_sherif_"+db_name+"/_changes?feed=continuous&heartbeat=10&since="+str(last_seq), stream=True)

	return d_unmanaged_component, unmanaged_changes_stream

def init_hostlist_dict(db_hosts):
	d_db_hostlist = {}

	for row in db_hosts.view('hosts/hostlist', include_docs=True) :
	        d_db_hostlist[row.key] = row.doc
	return d_db_hostlist

def init_restrictlist_dict(db_name, view_name):
	d_db_restrictlist = {}

	query_string = "include_docs=true"

	view_content = requests.get(database_address+"/big_sherif_"+db_name+"/_design/"+db_name+"/_view/"+view_name+"?"+query_string)

	for row in view_content.json()['rows']:
        	d_db_restrictlist[row['key']] = {'hostname': row['doc']['hostname'], 
						'resource': row['doc']['resource'], 
						'connector_name': row['doc']['connector_name'], 
						'criticality': row['doc']['criticality'],
						'balance': row['doc']['balance'],
						'stop': row['doc']['stop']}

	r = requests.get(database_address+"/big_sherif_"+db_name+"/_changes")
	last_seq = r.json()['last_seq']

	restrictlist_changes_stream = requests.get(database_address+"/big_sherif_"+db_name+"/_changes?feed=continuous&heartbeat=10&since="+str(last_seq), stream=True)

	return d_db_restrictlist, restrictlist_changes_stream

def init_criticality_dict(db_name, view_name):
	d_db_criticality = {}

	query_string = ""

	view_content = requests.get(database_address+"/big_sherif_"+db_name+"/_design/"+db_name+"/_view/"+view_name+"?"+query_string)

	for row in view_content.json()['rows']:
		d_db_criticality[row['key']] = {db_name: row['value'][db_name],
						'weight': row['value']['weight']}

	return d_db_criticality

def init_component_deduplicate_dict(db_name, view_name):
	d_db_component_deduplicate = {}

	query_string = "include_docs=true"

	view_content = requests.get(database_address+"/big_sherif_"+db_name+"/_design/"+db_name+"/_view/"+view_name+"?"+query_string)

	for row in view_content.json()['rows']:
		d_db_component_deduplicate[row['key']] = {'component_dest': row['doc']['component_dest'], 
												'address_dest': row['doc']['address_dest']
												}

	return d_db_component_deduplicate

def init_duplicate_component_dict(db_name, view_name):
	d_db_duplicate_component = {}

	query_string = ""

	view_content = requests.get(database_address+"/big_sherif_"+db_name+"/_design/"+db_name+"/_view/"+view_name+"?"+query_string)

        for row in view_content.json()['rows']:
                d_db_duplicate_component[row['key']] = row['value']

        return d_db_duplicate_component

def init_poolforcheck_dict(db_name, view_name):
	d_db_poolforcheck = {}

	query_string = ""

	view_content = requests.get(database_address+"/big_sherif_"+db_name+"/_design/"+db_name+"/_view/"+view_name+"?"+query_string)

	for row in view_content.json()['rows']:
		d_db_poolforcheck[row['key']] = row['value']

	return d_db_poolforcheck

def init_connectorlist_dict(db_name, view_name):
	d_db_connectorlist = {}

	query_string = ""

	view_content = requests.get(database_address+"/big_sherif_"+db_name+"/_design/"+db_name+"/_view/"+view_name+"?"+query_string)

        for row in view_content.json()['rows']:
                d_db_connectorlist[row['key']] = row['value']

        return d_db_connectorlist

def init_connectorlist_doc_dict(db_name, doc_name):
	d_db_connectorlist_doc = {}

	d_db_connectorlist_doc = requests.get(database_address+"/big_sherif_"+db_name+"/"+doc_name).json()
	
	return d_db_connectorlist_doc

def init_iplist_dict(db_hosts):
	d_db_iplist = {}

        for row in db_hosts.view('hosts/iplist') :
                d_db_iplist[row.key] = row.value
        return d_db_iplist

#def init_connector_list_doc(db_conf):

#	db_connector_list_doc = db_conf.get('connector_list')

#        return db_connector_list_doc

def init_doublon_doc(db_conf):
	db_doublon_doc = db_conf.get('doublon')
	
	if db_doublon_doc == None:
		db_conf['doublon'] =	{
								'doublon_by_hostname' :	{	
														},
								'doublon_by_ip' :     { 
                                                      }
								}
	return db_doublon_doc 

def is_not_in_list(l_data, data, field):

	for info in l_data :
		if info[field] == data:
			return False
	
	return True

def in_restrictlist(d_current_event, d_db_restrictlist, queue) :
	
	if queue.empty() == False:
		while not queue.empty():
			d_db_restrictlist = queue.get()

	l_current_event_info = {'hostname':d_current_event['component'],
                                'resource':d_current_event['resource'],
                                'connector_name':d_current_event['connector_name'],
                                'criticality':d_current_event['criticality']}
	
	ret = 0

	for key in sorted(d_db_restrictlist.iterkeys()):
		if d_db_restrictlist[key]['stop'] == 0:
			for info in d_db_restrictlist[key]:
				if info in l_current_event_info :
					if d_db_restrictlist[key][info] == str(l_current_event_info[info]) :
						ret += 1
			
			if ret == d_db_restrictlist[key]['balance'] :
				ret = 0
				return True, d_db_restrictlist
			else :
				ret = 0
	return False, d_db_restrictlist
				

### Fonc a supprimer c juste pour limiter le nombre devent sur 1sec
#def init_flag():
#	flag = {'flag': 0}
#	return flag
###

def insert_in_db(database_address, db_name, doc_id, doc_data, insert_mode='/'):

	try:
		headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
		r = requests.put(database_address+"/big_sherif_"+db_name+"/"+doc_id+insert_mode, data=json.dumps(doc_data), headers=headers)

		if insert_mode == '/' :
			return r.json()['rev']
	except:
		print "Insert error:", sys.exc_info()[0]
		print doc_data
		print r.json()
		raise

def sendTo_broker(channel, key, value):
	value['core_sender'] = core_sender
	message = {key: value}
	print 'Publish to Redis'
	rc.publish(channel, message)

def insert_in_currentevent_stack(new_event, old_event, d_db_current_events, database_address) :

	current_event_id = new_event.pop('current_event_id')
	new_event['_id'] = new_event.pop('event_id')

	print new_event['_id']
	print old_event['_id']

	d_db_current_events.pop(current_event_id)
	d_db_current_events[current_event_id] = new_event

	flap_timestamp = new_event.pop('flap_timestamp')
	flap_count = new_event.pop('flap_count')

	#rev = insert_in_db(database_address, 'currentevents', new_event['_id'], new_event)
	#insert_in_db(database_address, 'currentevents', old_event['_id'], old_event)
	new_event['event_state_org'] = 'new'
	old_event['event_state_org'] = 'old'
	sendTo_broker('ch_events', new_event['_id'], new_event)
	sendTo_broker('ch_events', old_event['_id'], old_event)

	new_event.pop('event_state_org')
	old_event.pop('event_state_org')

	sendTo_broker('ch_current_events', current_event_id, new_event)

	new_event['flap_timestamp'] = flap_timestamp
	new_event['flap_count'] = flap_count
	#new_event['_rev'] = rev # doit renseigner et mis à jour grâce au systeme insert du REDIS vers couch

	d_db_current_events[current_event_id] = new_event

def transcode_criticality(d_db_criticality_transcode, rb_content, d_current_event):
	global Criticality_trans
	current_event_criticality_code = rb_content['connector']+'-'+str(rb_content['criticality'])

	if Criticality_trans.queue.empty() == False:
		while not Criticality_trans.queue.empty():
			d_db_criticality_transcode = Criticality_trans.queue.get()
			Criticality_trans.d_db_ret = d_db_criticality_transcode

	rb_content['criticality_input'] = rb_content['criticality']
	rb_content['criticality'] = d_db_criticality_transcode[current_event_criticality_code]['criticality_transcode']
	rb_content['weight'] = d_db_criticality_transcode[current_event_criticality_code]['weight']

	d_current_event['criticality_input'] = d_current_event['criticality']
	d_current_event['criticality'] = d_db_criticality_transcode[current_event_criticality_code]['criticality_transcode']
	d_current_event['weight'] = d_db_criticality_transcode[current_event_criticality_code]['weight']

def requalify_criticality(d_db_criticality_requalify, rb_content, d_current_event):
	global Criticality_requ
	current_event_criticality_code = rb_content['component']+'-'+rb_content['connector']+'-'+str(rb_content['criticality'])

	if Criticality_requ.queue.empty() == False:
		while not Criticality_requ.queue.empty():
			d_db_criticality_requalify = Criticality_requ.queue.get()
			Criticality_requ.d_db_ret = d_db_criticality_requalify

	if current_event_criticality_code in d_db_criticality_requalify :
		rb_content['criticality_transcode'] = rb_content['criticality']
		rb_content['criticality'] = d_db_criticality_requalify[current_event_criticality_code]['criticality_requalify']
		rb_content['weight'] = d_db_criticality_requalify[current_event_criticality_code]['weight']

		d_current_event['criticality_transcode'] = d_current_event['criticality']
		d_current_event['criticality'] = d_db_criticality_requalify[current_event_criticality_code]['criticality_requalify']
		d_current_event['weight'] = d_db_criticality_requalify[current_event_criticality_code]['weight']

def component_deduplicate(d_db_component_deduplicate, hostname, address, d_current_event, rb_content, current_event_id):
	global Deduplicate
	current_event_component_info = unicode(hostname+'-'+address)

	if Deduplicate.queue.empty() == False:
		while not Deduplicate.queue.empty():
			d_db_component_deduplicate = Deduplicate.queue.get()
			Deduplicate.d_db_ret = d_db_component_deduplicate

	if current_event_component_info in d_db_component_deduplicate :
		hostname = d_db_component_deduplicate[current_event_component_info]['component_dest']
		address = d_db_component_deduplicate[current_event_component_info]['address_dest']
		current_event_id = hostname+'-'+d_current_event['resource']

		d_current_event['component_src'] = d_current_event['component']
		d_current_event['component'] = hostname
		d_current_event['address_src'] = d_current_event['address']
		d_current_event['address'] = address
		d_current_event['current_event_id'] = current_event_id

		rb_content['component_src'] = rb_content['component']
		rb_content['component'] = hostname
		rb_content['address_src'] = rb_content['address']
		rb_content['address'] = address

	return hostname, address, current_event_id

def related_pool_event(current_event_id, rb_content, d_current_event):
	global Pool
	global d_db_poolforcheck

	if Pool.queue.empty() == False:
		while not Pool.queue.empty():
			d_db_poolforcheck = Pool.queue.get()
			Pool.d_db_ret = d_db_poolforcheck

	if current_event_id in Pool.d_db_ret:
		rb_content['pool'] = Pool.d_db_ret[current_event_id]
		d_current_event['pool'] = Pool.d_db_ret[current_event_id]
	else:
		rb_content['pool'] = None
		d_current_event['pool'] = None

def is_unmanaged(d_db_unmanaged_component, hostname, unmanaged_queue):
	global Unmanaged

#	if Unmanaged.queue.empty() == False:
#		while not Unmanaged.queue.empty():
#			unmanaged_data = Unmanaged.queue.get()
#			print 'Unmanaged data stream :'
#			print unmanaged_data
#			print '----'
#			unmanaged_id, unmanaged_values = unmanaged_data.keys()[0], unmanaged_data.values()[0]
#			d_db_unmanaged_component[unmanaged_id] = unmanaged_values

	if unmanaged_queue.empty() == False:
		while not unmanaged_queue.empty():
			d_db_unmanaged_component = unmanaged_queue.get()

	if len(d_db_unmanaged_component) == 0 :
		return False, d_db_unmanaged_component
	
	if hostname in d_db_unmanaged_component:
		current_time = time.time()
		i = 0
		for i in range(len(d_db_unmanaged_component[hostname])):
			unmanaged_insert = d_db_unmanaged_component[hostname][i]
			if unmanaged_insert['start_date'] < current_time and unmanaged_insert['end_date'] > current_time:
				if unmanaged_insert['is_activated'] == 0:
					unmanaged_insert['is_activated'] = 1
#					sendTo_broker('ch_unmanaged', , d_db_unmanaged_component[hostname])
					rev = insert_in_db(database_address, 'unmanaged', unmanaged_insert['_id'], unmanaged_insert)
					unmanaged_insert['_rev'] = rev
					d_db_unmanaged_component[hostname][i] = unmanaged_insert
					####
					#### @ToDo Faire un insert dans currentevent pour donner l'information sous le format d'un event que la règle est active
					####
				return True, d_db_unmanaged_component
			elif unmanaged_insert['end_date'] < current_time and unmanaged_insert['is_over'] != 1:
				unmanaged_insert['is_over'] = 1

				rev = insert_in_db(database_address, 'unmanaged', unmanaged_insert['_id'], unmanaged_insert)
				unmanaged_insert['_rev'] = rev

				d_db_unmanaged_component.pop(hostname)

	return False, d_db_unmanaged_component

#		if d_db_unmanaged_component[hostname]['start_date'] < current_time and d_db_unmanaged_component[hostname]['end_date'] > current_time:
#			if d_db_unmanaged_component[hostname]['is_activated'] == 0:
#				d_db_unmanaged_component[hostname]['is_activated'] = 1
#				sendTo_broker('ch_unmanaged', , d_db_unmanaged_component[hostname])
#				rev = insert_in_db(database_address, 'unmanaged', d_db_unmanaged_component[hostname]['_id'], d_db_unmanaged_component[hostname])
#				d_db_unmanaged_component[hostname]['_rev'] = rev
				####
				#### @ToDo Faire un insert dans currentevent pour donner l'information sous le format d'un event que la règle est active
				####
				
#			return True, d_db_unmanaged_component
#		elif d_db_unmanaged_component[hostname]['end_date'] < current_time and d_db_unmanaged_component[hostname]['is_over'] != 1:
#			d_db_unmanaged_component[hostname]['is_over'] = 1

#			rev = insert_in_db(database_address, 'unmanaged', d_db_unmanaged_component[hostname]['_id'], d_db_unmanaged_component[hostname])
#			d_db_unmanaged_component[hostname]['_rev'] = rev

#			d_db_unmanaged_component.pop(hostname)
#			return False, d_db_unmanaged_component
#		else:
#			return False, d_db_unmanaged_component
	
#	else:
#		return False, d_db_unmanaged_component

def is_recover(old_event, new_event):
	if old_event['criticality'] != 0 and new_event['criticality'] == 0:
		return True
	return False

def is_flapping(old_event, new_event):
	if 'flap_count' in old_event:
		if new_event['timestamp_start'] - old_event['flap_timestamp'] <= 3600 and old_event['flap_count'] >= 3:
			return 1
		elif new_event['timestamp_start'] - old_event['flap_timestamp'] > 3600:
			return -1

	return 0

def is_furtive(old_event, new_event):
	if old_event['criticality'] != 0 and new_event['criticality'] == 0 and (new_event['timestamp_start'] - old_event['timestamp_start']) <= 300:
		return True
	else : 
		return False

def current_event(d_current_event, db_currentevents, d_db_current_events, database_address, d_db_hostlist, current_event_queue):
	d_current_event['state'] = 5
	d_current_event['is_history'] = 0
	flap_return = 0

	d_current_event_cpy4DB = d_current_event.copy()
	d_current_event_cpy4DB.pop('current_event_id')
	d_current_event_cpy4DB.pop('event_id')

	d_current_event_cpy4Dict = d_current_event.copy()
	d_current_event_cpy4Dict['_id'] = d_current_event_cpy4Dict.pop('event_id')
	d_current_event_cpy4Dict.pop('current_event_id')

	print 'Current event'

	## Je vérif dans le pipe d'échange entre le process de subscribe channel redis et le moteur qu'un changement 
	## à eu lieu et je met à jour le d_db_current_events
	####
	## Une boucle sera sans doute nécessaire pour mettre dans le d_db_current_events 
	## les infos de la queue vu qu'on ne récup pas tout le d_db_current_events en provenance de la DB
	####
	if current_event_queue.empty() == False:
		while not current_event_queue.empty():
			event_data = current_event_queue.get()
			print 'Current event stream :'
			print event_data
			print '----'
			event_data_id, event_data_values = event_data.keys()[0], event_data.values()[0]
			d_db_current_events[event_data_id] = event_data_values

	if d_current_event['current_event_id'] in d_db_current_events :
		if d_current_event['criticality'] != d_db_current_events[d_current_event['current_event_id']]['criticality'] :

			old_event = d_db_current_events[d_current_event['current_event_id']]
			new_event = d_current_event

			d_db_hostlist[new_event['component']]['resource'][new_event['resource']] = {'criticality': new_event['criticality'], 'weight': new_event['weight']}
			sendTo_broker('ch_hosts', new_event['component'], d_db_hostlist[new_event['component']])
			#rev = insert_in_db(database_address, 'hosts', new_event['component'], d_db_hostlist[new_event['component']])
			#d_db_hostlist[new_event['component']]['_rev'] = rev
            
			flap_return = is_flapping(old_event, new_event)

			if flap_return == 1:
				
				print 'Currently Flapping'

				new_event['flap_timestamp'] = new_event['timestamp_start']
				new_event['flap_count'] = old_event['flap_count']
				new_event['state'] = 4
				new_event['is_history'] = 0

				old_event['timestamp_end'] = new_event['timestamp_start']
				old_event['criticality_duration'] = old_event['timestamp_end'] - old_event['timestamp_start']
				old_event['is_history'] = 1

				insert_in_currentevent_stack(new_event, old_event, d_db_current_events, database_address)

			elif flap_return == -1:
				#####
				# Dans la detection du flap si on a depasser le temps et que pas de flap alors RAZ du count et timestamp de flap
				#####

				print 'Flap RAZ'

				old_event['timestamp_end'] = new_event['timestamp_start']
				old_event['criticality_duration'] = old_event['timestamp_end'] - old_event['timestamp_start']
				old_event['is_history'] = 1

				new_event['flap_timestamp'] = 0
				new_event['flap_count'] = 0

				insert_in_currentevent_stack(new_event, old_event, d_db_current_events, database_address)

			elif is_furtive(old_event, new_event) == True:
				print 'Furtive'

				if 'flap_count' in old_event:
					flap_count = old_event['flap_count']
					flap_count += 1
				else :
					flap_count = 1

				if 'flap_timestamp' in old_event:
					flap_timestamp = old_event['flap_timestamp']
				else:
					flap_timestamp = new_event['timestamp_start']

				old_event['state'] = 2
				old_event['timestamp_end'] = new_event['timestamp_start']
				old_event['criticality_duration'] = old_event['timestamp_end'] - old_event['timestamp_start']
				old_event['recover_event_id'] = new_event['event_id']
				old_event['is_history'] = 1

				new_event['flap_count'] = flap_count
				new_event['flap_timestamp'] = flap_timestamp
				new_event['state'] = -1
				new_event['is_history'] = 0

				insert_in_currentevent_stack(new_event, old_event, d_db_current_events, database_address)

			elif is_recover(old_event, new_event) == True:
				print 'Recover'	
			
				if 'flap_count' in old_event:
					flap_count = old_event['flap_count']
					flap_count += 1
				else :
					flap_count = 1

				if 'flap_timestamp' in old_event:
					flap_timestamp = old_event['flap_timestamp']
				else:
					flap_timestamp = new_event['timestamp_start']

				old_event['state'] = 0
				old_event['timestamp_end'] = new_event['timestamp_start']
				old_event['criticality_duration'] = old_event['timestamp_end'] - old_event['timestamp_start']
				old_event['recover_event_id'] = new_event['event_id']
				old_event['is_history'] = 1

				new_event['flap_count'] = flap_count # il faut trouver un moyen pour remettre a zero le compteur
				new_event['flap_timestamp'] = flap_timestamp # remise a zero du timestamp idem
				new_event['state'] = -1
				new_event['is_history'] = 0

				insert_in_currentevent_stack(new_event, old_event, d_db_current_events, database_address)

			else :
				#####
				# cas ou l event new est plus critique que le old dans ce cas le old disparait on revient un new en state 0
				#####
			
				print 'Change state'

				old_event['is_history'] = 1
				old_event['timestamp_end'] = new_event['timestamp_start']
				old_event['criticality_duration'] = old_event['timestamp_end'] - old_event['timestamp_start']

				new_event['state'] = 5
				new_event['is_history'] = 0

				if 'flap_count' in old_event:
					flap_count = old_event['flap_count']
					flap_count += 1
				else :
					flap_count = 1

				if 'flap_timestamp' in old_event:
					flap_timestamp = old_event['flap_timestamp']
				else:
					flap_timestamp = new_event['timestamp_start']

				new_event['flap_count'] = flap_count
				new_event['flap_timestamp'] = flap_timestamp
		
				insert_in_currentevent_stack(new_event, old_event, d_db_current_events, database_address)

	else:
		print 'Insert'
		d_current_event_cpy4Dict['event_state_org'] = 'new'
		sendTo_broker('ch_events', d_current_event['event_id'], d_current_event_cpy4Dict)

		d_current_event_cpy4Dict.pop('event_state_org')
		sendTo_broker('ch_current_events', d_current_event['current_event_id'], d_current_event_cpy4Dict)
		#rev = insert_in_db(database_address, 'currentevents', d_current_event['event_id'], d_current_event_cpy4DB)
		#d_current_event_cpy4Dict['_rev'] = rev
		d_db_current_events[d_current_event['current_event_id']] = d_current_event_cpy4Dict
        
		d_db_hostlist[d_current_event['component']]['resource'][d_current_event['resource']] = {'criticality': d_current_event['criticality'], 'weight': d_current_event['weight']}
		sendTo_broker('ch_hosts', d_current_event['component'], d_db_hostlist[d_current_event['component']])
		#rev = insert_in_db(database_address, 'hosts', d_current_event['component'], d_db_hostlist[d_current_event['component']])
		#d_db_hostlist[d_current_event['component']]['_rev'] = rev

def callback(ch, method, properties, body):
	update_doc = {}
	flag = 0
	doc_id_event = uuid4().hex
	rb_content = json.loads(body)
	global d_db_unmanaged
	global d_db_blacklist
	global d_db_whitelist
	global d_db_connector_list
	global d_db_duplicate_component_name
	global d_db_duplicate_component_ip
	global d_db_component_deduplicate
	global d_db_criticality_transcode
	global d_db_criticality_requalify
	global d_db_connector_list_doc
	global d_db_unmanaged

	if rb_content['connector'] == 'cengine' or 'address' not in rb_content:
		return


### Fonc a supprimer c juste pour limiter le nombre devent sur 1sec
#	if flag_insert_ok['flag'] != 0 :
#		flag_insert_ok['flag'] = flag_insert_ok['flag'] + 1
#		if flag_insert_ok['flag'] == 2 :
#			flag_insert_ok['flag'] = 0
#		return
#	else :
#		flag_insert_ok['flag'] = flag_insert_ok['flag'] + 1
###
	####
	## Dans certains cas impossible de renommer le champ en timestamp_start
	####
	if 'timestamp_start' not in rb_content :
		rb_content['timestamp_start'] = rb_content['timestamp']
		
	timestamp_start = rb_content['timestamp_start']
	rb_content['component'] = rb_content['component'].upper()
	if 'connector_hostname' in rb_content:
		rb_content['connector_hostname'] = rb_content['connector_hostname'].upper()
	else:
		rb_content['connector_hostname'] = None
		rb_content['connector_hostip'] = None

	hostname = rb_content['component']
	address = rb_content['address']
	connector = rb_content['connector']
	connector_name = rb_content['connector_name']
	connector_hostname = rb_content['connector_hostname']
	connector_hostip = rb_content['connector_hostip']
	if 'command_name' in rb_content:
		command_name = rb_content['command_name']
	output = rb_content['output']
	if 'criticality' not in rb_content:
		rb_content['criticality'] = rb_content['state']
	criticality = rb_content['criticality']
	if 'source_type' in rb_content:
		source_type = rb_content['source_type']
	if source_type == "component" :
		resource = "Host status"
		rb_content['resource'] = resource
	else :
		resource = rb_content['resource']

	current_event_id = hostname+'-'+resource
	current_event_component_info = unicode(hostname+'-'+address)

	d_current_event = rb_content.copy()
	d_current_event['current_event_id'] = current_event_id
	d_current_event['event_id'] = doc_id_event
	
	if Connector.queue.empty() == False:
		while not Connector.queue.empty():
			d_db_connector_list = Connector.queue.get()
			Connector.d_db_ret = d_db_connector_list

	if Connector_doc.queue.empty() == False:
		while not Connector_doc.queue.empty():
			connector_doc_data = Connector_doc.queue.get()
			print 'Connector data stream :'
			print connector_doc_data
			print '----'
			doc_id, doc_values = connector_doc_data.keys()[0], connector_doc_data.values()[0]
			d_db_connector_list_doc[doc_id] = doc_values

	if connector_name not in d_db_connector_list:
		d_db_connector_list[connector_name] = {'connector': connector, 'connector_hostname': connector_hostname, 'connector_hostip': connector_hostip, 'connector_status': 0}
		d_db_connector_list_doc['connector_list']['connector_list'][connector_name] = {'connector': connector, 'connector_hostname': connector_hostname, 'connector_hostip': connector_hostip, 'connector_status': 0}
		sendTo_broker('ch_connector_doc', 'connector_list', d_db_connector_list_doc['connector_list'])
#		rev = insert_in_db(database_address, 'config', 'connector_list', d_db_connector_list_doc)
#		d_db_connector_list_doc['_rev'] = rev
		return
	elif d_db_connector_list[connector_name]['connector_status'] != 2:
		return

	######
	## Avec la condition si dessous on peu gérer les doublons de connecteur qui ont le meme nom 
	## il faut par contre ne pas prendre le code tel quel et mettre un suffixe au nom pour eviter l'écrasement et flag
	######
	'''
	elif d_db_connector_list[connector_name]['connector_hostip'] != connector_hostip :
		d_db_connector_list[connector_name] = {'connector': connector, 'connector_hostname': connector_hostname, 'connector_hostip': connector_hostip, 'connector_status': 0}
                d_db_connector_list_doc['connector_list'][connector_name] = {'connector': connector, 'connector_hostname': connector_hostname, 'connector_hostip': connector_hostip, 'connector_status': 0}
                rev = insert_in_db(database_address, 'config', 'connector_list', d_db_connector_list_doc)
		d_db_connector_list_doc['_rev'] = rev
		return
	'''
	print 'Connector OK'

	hostname, address, current_event_id = component_deduplicate(d_db_component_deduplicate, hostname, address, d_current_event, rb_content, current_event_id)

	flag_unmanaged = False
	#flag_unmanaged, unmanaged_component = is_unmanaged(d_db_unmanaged, hostname, unmanaged_queue)
	flag_unmanaged, d_db_unmanaged = is_unmanaged(d_db_unmanaged, hostname, unmanaged_queue)
	#d_db_unmanaged = unmanaged_component

	if flag_unmanaged == True:
		print 'Unmanaged'
		return

	transcode_criticality(d_db_criticality_transcode, rb_content, d_current_event)
	requalify_criticality(d_db_criticality_requalify, rb_content, d_current_event)
	
	if hosts_queue.empty() == False:
		while not hosts_queue.empty():
			host_data = hosts_queue.get()
			print 'Hosts stream :'
			print host_data
			print '----'
			hostname, host_values = host_data.keys()[0], host_data.values()[0]
			d_db_hostlist[hostname] = host_values

	if hostname not in d_db_hostlist and address not in d_db_iplist:
		d_db_hostlist[hostname] = {'hostname': hostname, 'address': address, 'connector': [connector], 'connector_name': [connector_name], 'resource': {resource: {'criticality': criticality, 'weight': d_current_event['weight']}}}
		d_db_iplist[address] = {'hostname': hostname, 'connector': [connector], 'connector_name': [connector_name], 'resource': {resource: criticality}}
		sendTo_broker('ch_hosts', hostname, d_db_hostlist[hostname])
		#rev = insert_in_db(database_address, 'hosts', hostname, {'address': address, 'connector': [connector], 'connector_name': [connector_name], 'resource': {resource: criticality}})
		#d_db_hostlist[hostname]['_rev'] = rev
		

	elif hostname in d_db_hostlist and address != d_db_hostlist[hostname]['address']:

		if Duplicate_name.queue.empty() == False:
			while not Duplicate_name.queue.empty():
				d_db_duplicate_component_name = Duplicate_name.queue.get()
				Duplicate_name.d_db_ret = d_db_duplicate_component_name		

		if current_event_component_info not in d_db_duplicate_component_name:
			d_duplicate_entry = {
                                        'primary_entry': {'component': hostname, 'address': d_db_hostlist[hostname]['address'], 'connector': d_db_hostlist[hostname]['connector'], 'connector_name': d_db_hostlist[hostname]['connector_name']},
                                        'duplicate_entry': {'component': hostname, 'address': address, 'connector': [connector], 'connector_name': [connector_name]},
                                        'duplicate_reason': hostname,
                                        'duplicate_type': 'component_duplicate_by_component_name'
                                        }

			d_db_duplicate_component_name[current_event_component_info] = d_duplicate_entry
			insert_in_db(database_address, 'duplicate_entry', doc_id_event, d_duplicate_entry)
		return

	elif address in d_db_iplist and hostname != d_db_iplist[address]['hostname'] :

		if Duplicate_ip.queue.empty() == False:
			while not Duplicate_ip.queue.empty():
				d_db_duplicate_component_ip = Duplicate_ip.queue.get()
				Duplicate_ip.d_db_ret = d_db_duplicate_component_ip

		if current_event_component_info not in d_db_duplicate_component_ip:
			d_duplicate_entry = {
                                        'primary_entry': {'component': d_db_iplist[address]['hostname'], 'address': address, 'connector': d_db_iplist[address]['connector'], 'connector_name': d_db_iplist[address]['connector_name']},
                                        'duplicate_entry': {'component': hostname, 'address': address, 'connector': [connector], 'connector_name': [connector_name]},
                                        'duplicate_reason': address,
                                        'duplicate_type': 'component_duplicate_by_component_ip'
                                        }

			d_db_duplicate_component_ip[current_event_component_info] = d_duplicate_entry
			insert_in_db(database_address, 'duplicate_entry', doc_id_event, d_duplicate_entry)
		return
	else :
		if connector not in d_db_hostlist[hostname]['connector']:
			print 'New connector type'
			d_db_hostlist[hostname]['connector'].append(connector)
			sendTo_broker('ch_hosts', hostname, d_db_hostlist[hostname])
			#rev = insert_in_db(database_address, 'hosts', hostname, d_db_hostlist[hostname])
			#d_db_hostlist[hostname]['_rev'] = rev
			
		if connector_name not in d_db_hostlist[hostname]['connector_name']:
			print 'New connector name'
			d_db_hostlist[hostname]['connector_name'].append(connector_name)
			sendTo_broker('ch_hosts', hostname, d_db_hostlist[hostname])
			#rev = insert_in_db(database_address, 'hosts', hostname, d_db_hostlist[hostname])
			#d_db_hostlist[hostname]['_rev'] = rev
			
		if 'resource' not in d_db_hostlist[hostname]:
			print 'Insert resource'
			d_db_hostlist[hostname]['resource'] = {resource: criticality}
			sendTo_broker('ch_hosts', hostname, d_db_hostlist[hostname])
			#rev = insert_in_db(database_address, 'hosts', hostname, d_db_hostlist[hostname])
			#d_db_hostlist[hostname]['_rev'] = rev			
		elif resource not in d_db_hostlist[hostname]['resource']:
			print 'Add resource'
			d_db_hostlist[hostname]['resource'][resource] = {'criticality': criticality, 'weight': d_current_event['weight']}
			sendTo_broker('ch_hosts', hostname, d_db_hostlist[hostname])
			#rev = insert_in_db(database_address, 'hosts', hostname, d_db_hostlist[hostname])
			#d_db_hostlist[hostname]['_rev'] = rev

	print 'Host OK'

	###
	# Check if the event is in the blacklist
	###
	flag_in_blacklist, d_db_blacklist = in_restrictlist(d_current_event, d_db_blacklist, blacklist_queue)


	if  flag_in_blacklist == True :
		print 'In balcklist'
		return

	###
	# Check if the event is in the whitelist
	###
	flag_in_whitelist, d_db_whitelist = in_restrictlist(d_current_event, d_db_whitelist, whitelist_queue)

	if  flag_in_whitelist == True :
		print 'In whitelist'
		rb_content['in_whitelist'] = 1
		d_current_event['in_whitelist'] = 1

	related_pool_event(current_event_id, rb_content, d_current_event)

	#db_events[doc_id_event] = rb_content

	sendTo_broker('ch_event_log', str(doc_id_event), rb_content)
#	insert_in_db(database_address, 'events', str(doc_id_event), rb_content)

	current_event(d_current_event, db_currentevents, d_db_current_events, database_address, d_db_hostlist, current_event_queue)

        #print " [x] %r:%r" % (method.routing_key, body,)
        #print " [x] %r:%r" % (doc_id_event, body,)

#@Todo Attention creation de host qd host pas connu au moment de reception de event
# qd host connu on ne modifie que le tableau des event du host.
# donc si les infos de host on change dans event on ne les fait pas changer
# voir si on conserve en letat ou si on check les change des infos de l'host dans l'event
		
##	else :
##		Ici gestion des doublons et des mises a jour des  info suivant les hosts
##Si je trouve un hostname exist et que meme ip, cas possible :
#- Connecteur different, je rajoute au tableau des connecteurs dans le host

#hostname exist pas la meme ip
#- c un doublon il faut le signaler, enregistrement de toutes les infos dans un docs qui contient liste des doublons
'''
@ToDo
meme host meme ip si c des nouveaux champs pas de pb je add les informations en creant de new entree
si ancien champs mais avec donnee diff alors si connecteur je rajoute dans tab
si ca concerne pas connecteur alors je creer un champ identique mais avec _nom_du_connecteur en prefixe

Je connais le connecteur je peux donc lui faire porter le meme nom donc pas besoin de prefixe car jai fait la transformation directement dans le connecteur. Reste le probleme de l'information qui a raison la dernier entree du dernier connecteur ou la premierdu premier connecteur ou est ce que je fais un tableau pour dire cette information vient de tel connecteur et celle la de tel autre

La meilleur solution reste celle utiliser pour les systeme. C un tableau. Si la nouvelle info est dans le tableau alors pas besoin de l'enregistrer sinon je fait une nouvelle entree. Reste a tager chaque entre pour pouvoir dire d'ou vient l'info

'''

'''
''
''MAIN
''
'''

#d_db_unmanaged_component_tmp, unmanaged_changes_stream = init_unmanaged_component_dict('unmanaged', 'componentunmanagedlist')

if __name__ == '__main__':
	unmanaged_queue = Queue()
	whitelist_queue = Queue()
	blacklist_queue = Queue()
	current_event_queue = Queue()
	hosts_queue = Queue()

	Pool = InitnUpdateClass(database_address, 'hosts', 'poolforcheck', proxies)
	Pool.initStream()
	Pool.startContinuousUpdate()

	Connector = InitnUpdateClass(database_address, 'config', 'connectorlist', proxies)
	Connector.initStream()
	Connector.startContinuousUpdate()

	Connector_doc = InitnUpdateFromRedisClass(rc, 'connector_doc', 'ch_connector_doc', core_sender)
	Connector_doc.initRStream()
	Connector_doc.startRContinuousUpdate

	Duplicate_name = InitnUpdateClass(database_address, 'duplicate_entry', 'listcomponentnameduplicateentry', proxies)
	Duplicate_name.initStream()
	Duplicate_name.startContinuousUpdate()

	Duplicate_ip = InitnUpdateClass(database_address, 'duplicate_entry', 'listcomponentipduplicateentry', proxies)
	Duplicate_ip.initStream()
	Duplicate_ip.startContinuousUpdate()

	Deduplicate = InitnUpdateClass(database_address, 'component_deduplicate', 'deduplicatelist', proxies, query_string="include_docs=true")
	Deduplicate.initStream()
	Deduplicate.startContinuousUpdate()

	Criticality_trans = InitnUpdateClass(database_address, 'criticality_transcode', 'transcodelist', proxies)
	Criticality_trans.initStream()
	Criticality_trans.startContinuousUpdate()

	Criticality_requ = InitnUpdateClass(database_address, 'criticality_requalify', 'requalifylist', proxies)
	Criticality_requ.initStream()
	Criticality_requ.startContinuousUpdate()

#	Unmanaged = InitnUpdateFromRedisClass(rc, 'unmanaged', 'ch_unmanaged', core_sender)
#	Unmanaged.initRStream()
#	Unmanaged.startRContinuousUpdate

	#criticality_transcode = Queue()
	#criticality_requalify = Queue()
	#component_deduplicate = Queue()

	current_event_continuous_process = Process(target=current_event_continuous_update, args=(current_event_queue,'ch_current_events',))
	current_event_continuous_process.start()

	hosts_continuous_process = Process(target=hosts_continuous_update, args=(hosts_queue,'ch_hosts',))
	hosts_continuous_process.start()

	d_db_unmanaged_component_tmp, unmanaged_changes_stream = init_unmanaged_component_dict('unmanaged', 'componentunmanagedlist')	
	unmanaged_continuous_process = Process(target=unmanaged_continuous_update, args=(unmanaged_queue,unmanaged_changes_stream,database_address,'unmanaged', 'componentunmanagedlist',))
	unmanaged_continuous_process.start()

	d_db_whitelist, whitelist_changes_stream = init_restrictlist_dict('whitelist', 'restrictlist')
	whitelist_continuous_process = Process(target=restrictlist_continuous_update, args=(whitelist_queue,whitelist_changes_stream,database_address,'whitelist', 'listbyorder',))
	whitelist_continuous_process.start()	

	d_db_blacklist, blacklist_changes_stream = init_restrictlist_dict('blacklist', 'restrictlist')
	blacklist_continuous_process = Process(target=restrictlist_continuous_update, args=(blacklist_queue,blacklist_changes_stream,database_address,'blacklist', 'listbyorder',))
	blacklist_continuous_process.start()


d_db_current_events = init_from_redis_dict('current_events')
#d_db_current_events = init_current_event_dict(db_currentevents)

d_db_hostlist = init_from_redis_dict('hosts')
#d_db_hostlist = init_hostlist_dict(db_hosts)

d_db_iplist = init_iplist_dict(db_hosts)

d_db_poolforcheck = Pool.getDict()
d_db_connector_list = Connector.getDict()
d_db_duplicate_component_name = Duplicate_name.getDict()
d_db_duplicate_component_ip = Duplicate_ip.getDict()
d_db_component_deduplicate = Deduplicate.getDict()
d_db_criticality_transcode = Criticality_trans.getDict()
d_db_criticality_requalify = Criticality_requ.getDict()
d_db_connector_list_doc = Connector_doc.getRDict()
#d_db_unmanaged = Unmanaged.getRDict()

#d_db_whitelist = init_restrictlist_dict('whitelist', 'restrictlist')
#d_db_blacklist = init_restrictlist_dict('blacklist', 'restrictlist')
#d_db_criticality_transcode = init_criticality_dict('criticality_transcode', 'transcodelist')
#d_db_criticality_requalify = init_criticality_dict('criticality_requalify', 'requalifylist')
#d_db_component_deduplicate = init_component_deduplicate_dict('component_deduplicate', 'deduplicatelist')
#d_db_poolforcheck = init_poolforcheck_dict('hosts', 'poolforcheck')
#d_db_connector_list = init_connectorlist_dict('config', 'connectorlist')
#d_db_connector_list_doc = init_connectorlist_doc_dict('config', 'connector_list')
#d_db_duplicate_component_name = init_duplicate_component_dict('duplicate_entry', 'listcomponentnameduplicateentry')
#d_db_duplicate_component_ip = init_duplicate_component_dict('duplicate_entry', 'listcomponentipduplicateentry')

d_db_unmanaged = d_db_unmanaged_component_tmp.copy()

print d_db_unmanaged

#db_connector_list_doc = init_connector_list_doc(db_conf)
#db_doublon_doc = init_doublon_doc(db_conf)

### Fonc a supprimer c juste pour limiter le nombre devent sur 1sec
#flag_insert_ok = init_flag()
###

print '[Ready to receive]'

channel.basic_consume(callback,
                      queue=queue_name,
                      no_ack=True)

try :
	channel.start_consuming()
except KeyboardInterrupt:
	channel.stop_consuming()

connection.close()
