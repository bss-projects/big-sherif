#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import couchdb
import time
import sched
import commands
import redis
import requests
import json
from datetime import datetime
from apscheduler.scheduler import Scheduler
from configobj import ConfigObj
from validate import Validator
import logging

LOG_FILENAME = 'sche_view_couch.log'
logging.basicConfig(filename=LOG_FILENAME)

config_file = './BigSherif.cfg'

configspec = ConfigObj('./BigSherif_configcheck.cfg', encoding='UTF8', stringify=False, list_values=False, _inspec=True)
config = ConfigObj(config_file, configspec='./BigSherif_configcheck.cfg')

validator = Validator()
result = config.validate(validator)

if result != True:
	print 'Config file validation failed!'
	sys.exit(1)

couchdb_config = config['CouchDB Config']
amqp_config = config['AMQP Config']
redis_config = config['REDIS Config']
proxy_config = config['Proxy Config']

database_address = couchdb_config['server']
amqp_address = amqp_config['server']
amqp_port = amqp_config['port']
redis_address = redis_config['server']
redis_port = redis_config['port']
proxy_http = proxy_config['proxy_http']
proxy_https = proxy_config['proxy_https']


proxies = {
				"http": proxy_http,
				"https": proxy_http,}

r = redis.Redis(redis_address, redis_port)

#couch = couchdb.Server('http://127.0.0.1:5984/')

#db_events = couch['big_sherif_events']
#db_currentevents = couch['big_sherif_currentevents']
#db_hosts = couch['big_sherif_hosts']
#db_conf = couch['big_sherif_config']

# Start the scheduler
sched = Scheduler()
sched.daemonic = False
sched.start()

@sched.interval_schedule(seconds=3)
def insert_in_db_events():
	try:
		headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

		db_name = 'events'

		data = r.hgetall('event_log')
		if data.keys() != []:
			r.hdel('event_log', *data.keys())
		bulk_data = {'docs': []}
		for key, value in data.items():
			value = json.loads(value)
			value['_id'] = key
			bulk_data['docs'].append(value)

		if bulk_data['docs'] != []:
			ret = requests.post(database_address+"/big_sherif_"+db_name+"/_bulk_docs", data=json.dumps(bulk_data), headers=headers, proxies=proxies)

	except:
		print "Insert events:", sys.exc_info()
		print ret.json()
		raise

@sched.interval_schedule(seconds=3)
def insert_in_db_hosts():
	try:
		headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

		db_name = 'hosts'

		d_change = r.hgetall(db_name+'_change')
		bulk_data = {'docs': []}
		hosts_rev = r.hgetall('hosts_rev')

		for id in d_change.iterkeys():
			r.hdel(db_name+'_change', id)
			value = r.hget(db_name, id)
			value = json.loads(value)
			value['_id'] = id
			if id in hosts_rev:
				value['_rev'] =  hosts_rev[id]
			bulk_data['docs'].append(value)

		if bulk_data['docs'] != []:
			ret = requests.post(database_address+"/big_sherif_"+db_name+"/_bulk_docs", data=json.dumps(bulk_data), headers=headers, proxies=proxies)

			for rrow in ret.json():
				r.hset(db_name+'_rev', rrow['id'], rrow['rev'])
	except:
		print "Insert hosts:", sys.exc_info()
		print ret.json()
		raise

@sched.interval_schedule(seconds=1)
def insert_in_db_currentevents():
	try:
		headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

		db_name = 'currentevents'

		data = r.hgetall('events')
		current_events = r.hgetall('current_events')
		if data.keys() != []:
			r.hdel('events', *data.keys())
		
		bulk_data = {'docs': []}
		events_rev = r.hgetall('events_rev')

		for key, value in data.items():
			value = json.loads(value)
			value['_id'] = key
			if key in events_rev:
				r.hdel('events_rev', key)
				value['_rev'] =  events_rev[key]
			bulk_data['docs'].append(value)

		if bulk_data['docs'] != []:
			ret = requests.post(database_address+"/big_sherif_"+db_name+"/_bulk_docs", data=json.dumps(bulk_data), headers=headers, proxies=proxies)

			for rrow in ret.json():
				for current_events_id, value in current_events.items():
					value = json.loads(value)
					if rrow['id'] == value['_id']:
						r.hset('events_rev', rrow['id'], rrow['rev'])
						break
	except:
		print "Insert currentevents:", sys.exc_info()
		print ret.json()
		raise


#@sched.interval_schedule(seconds=3)
def insert_in_db():
	d_db = {'currentevents': insert_in_db_currentevents, 'hosts': insert_in_db_hosts, 'events': insert_in_db_events}

	try:
		for db_name in d_db.iterkeys():
			d_db[db_name]()
	except:
		print "Insert error:", sys.exc_info()
		raise

'''
@sched.interval_schedule(seconds=600)
def compact_db():
	#--> query_string = ""
	#http://localhost:5984/my_db/_compact
	#http://localhost:5984/dbname/_compact/designname
	#http://localhost:5984/dbname/_view_cleanup
	#--> requests.get(database_address+"/big_sherif_"+db_name+"/_design/"+db_name+"/_view/"+view_name+"?"+query_string)
#	db_currentevents.compact()
#	db_events.compact()
#	db_hosts.compact()
#	db_conf.compact()
#	db_currentevents.compact('currentevents')
#	db_events.compact('events')

@sched.interval_schedule(seconds=60)
def refresh_view():
	#--> query_string = "limit=0"
	#--> requests.get(database_address+"/big_sherif_"+db_name+"/_design/"+db_name+"/_view/"+view_name+"?"+query_string)
#	db_currentevents.view('currentevents/hostname-resource', limit=0)
#	db_currentevents.view('currentevents/SortByTimestamp', limit=0)
#	db_events.view('events/hostname-resource', limit=0)
#	db_events.view('events/SortByTimestamp', limit=0)
'''

'''
print 'Current :'
print r.hgetall('current_events')
print '-----'
print 'Events :'
print r.hgetall('events')
print '-----'
print 'Event log :'
print r.hgetall('event_log')
print '-----'
print 'Hosts :'
print r.hgetall('hosts')
'''