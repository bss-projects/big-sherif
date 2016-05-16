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

def init_host_dict(db_name, view_name):
	d_db_host = {}
	headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
	insert_mode = '/'

	query_string = "include_docs=true"

	view_content = requests.get(database_address+"/big_sherif_"+db_name+"/_design/"+db_name+"/_view/"+view_name+"?"+query_string)

	for row in view_content.json()['rows']:
		doc_id = row['key']
		d_db_host[row['key']] = {'_id': row['doc']['_id'],
						'_rev': row['doc']['_rev'],
						'resource': row['doc']['resource'],
						'connector': row['doc']['connector'],
						'connector_name': row['doc']['connector_name'],
						'address': row['doc']['address'],
						'hostname': row['doc']['_id']}

		r = requests.put(database_address+"/big_sherif_"+db_name+"/"+doc_id+insert_mode, data=json.dumps(d_db_host[row['key']]), headers=headers)

init_host_dict('hosts', 'hostlist')