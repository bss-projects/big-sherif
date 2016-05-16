#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pika
import sys
import couchdb
import json
import time
from uuid import uuid4


couch = couchdb.Server('http://127.0.0.1:5984/')

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

def init_current_event_dict(db_currentevents):
	d_db_current_events = {}

	for row in db_currentevents.view('currentevents/hostname-resource', include_docs=True):
		d_db_current_events[row.key] = row.doc
	return d_db_current_events

def init_hostlist_dict(db_hosts):
	d_db_hostlist = {}

	for row in db_hosts.view('hosts/hostlist', include_docs=True) :
	        d_db_hostlist[row.key] = row.doc
	return d_db_hostlist

def init_iplist_dict(db_hosts):
	d_db_iplist = {}

        for row in db_hosts.view('hosts/iplist') :
                d_db_iplist[row.key] = row.value
        return d_db_iplist

def init_connector_list_doc(db_conf):

	db_connector_list_doc = db_conf.get('connector_list')

        return db_connector_list_doc

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

### Fonc a supprimer c juste pour limiter le nombre devent sur 1sec
def init_flag():
	flag = {'flag': 0}
	return flag
###

def current_event(d_current_event, db_currentevents, d_db_current_events):
	d_current_event_cpy4DB = d_current_event.copy()
	d_current_event_cpy4DB.pop('current_event_id')
	d_current_event_cpy4DB.pop('event_id')

	d_current_event_cpy4Dict = d_current_event.copy()
	d_current_event_cpy4Dict['_id'] = d_current_event_cpy4Dict.pop('event_id')
	d_current_event_cpy4Dict.pop('current_event_id')

	if d_current_event['current_event_id'] in d_db_current_events :
		if d_current_event['state'] != d_db_current_events[d_current_event['current_event_id']]['state'] :
			try :
				db_currentevents.delete(d_db_current_events[d_current_event['current_event_id']])
				print 'Change currentevent'
			except couchdb.http.ResourceConflict:
				try: 
					d_current_event_doc = db_currentevents.get(d_db_current_events[d_current_event['current_event_id']]['_id'])
					db_currentevents.delete(d_current_event_doc)
					print 'Retry delete after get doc'
				except :
					None			

			d_db_current_events.pop(d_current_event['current_event_id'])

			d_db_current_events[d_current_event['current_event_id']] = d_current_event_cpy4Dict
			db_currentevents[d_current_event['event_id']] = d_current_event_cpy4DB
	else:
		db_currentevents[d_current_event['event_id']] = d_current_event_cpy4DB
		d_db_current_events[d_current_event['current_event_id']] = d_current_event_cpy4Dict

def callback(ch, method, properties, body):
	update_doc = {}
	flag = 0
	doc_id_event = uuid4().hex
	rb_content = json.loads(body)
	
### Fonc a supprimer c juste pour limiter le nombre devent sur 1sec
	if flag_insert_ok['flag'] != 0 :
		flag_insert_ok['flag'] = flag_insert_ok['flag'] + 1
		if flag_insert_ok['flag'] == 240 :
			flag_insert_ok['flag'] = 0
		return
	else :
		flag_insert_ok['flag'] = flag_insert_ok['flag'] + 1
###
	
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
	  rb_content['resource'] = resource
	else :
	  resource = rb_content['resource']

	current_event_id = hostname+'-'+resource

	d_current_event = rb_content
	d_current_event['current_event_id'] = current_event_id
	d_current_event['event_id'] = doc_id_event

	if db_connector_list_doc == None :
		db_conf['connector_list'] = {'connector_list': {}}
		return
	elif connector_name not in db_connector_list_doc['connector_list'] :
		db_connector_list_doc['connector_list'][connector_name] = {'connector': connector, 'connector_hostname': connector_hostname, 'connector_hostip': connector_hostip, 'connector_status': 0}
		db_conf[db_connector_list_doc.id] = db_connector_list_doc
		return
	elif db_connector_list_doc['connector_list'][connector_name]['connector_hostip'] != connector_hostip :
		db_connector_list_doc['connector_list'][connector_name] = {'connector': connector, 'connector_hostname': connector_hostname, 'connector_hostip': connector_hostip, 'connector_status': 0}
		db_conf[db_connector_list_doc.id] = db_connector_list_doc
		return
	elif db_connector_list_doc['connector_list'][connector_name]['connector_status'] != 2:
		return

	if hostname not in d_db_hostlist and address not in d_db_iplist:
                db_hosts[hostname] = {'address': address, 'connector': [connector], 'connector_name': [connector_name]}
                d_db_hostlist[hostname] = {'address': address, 'connector': [connector], 'connector_name': [connector_name]}
                d_db_iplist[address] = {'hostname': hostname, 'connector': [connector], 'connector_name': [connector_name]}
	elif hostname in d_db_hostlist and address != d_db_hostlist[hostname]['address']:
		if hostname not in db_doublon_doc['doublon_by_hostname'] :

			db_doublon_doc['doublon_by_hostname'][hostname] = {'primary': {'hostname': hostname, 'address': d_db_hostlist[hostname]['address'], 'connector': d_db_hostlist[hostname]['connector'], 'connector_name': d_db_hostlist[hostname]['connector_name']}, 'doublon': [{'hostname': hostname, 'address': address, 'connector': [connector], 'connector_name': [connector_name]}]}

		else :
			db_doublon_doc['doublon_by_hostname'][hostname]['doublon'].append({'hostname': hostname, 'address': address, 'connector': [connector], 'connector_name': [connector_name]})
			
		db_conf[db_doublon_doc.id] = db_doublon_doc

                return
	elif address in d_db_iplist and hostname != d_db_iplist[address]['hostname'] :
		if address not in db_doublon_doc['doublon_by_ip'] :

			db_doublon_doc['doublon_by_ip'][address]= {'primary': {'hostname': d_db_iplist[address]['hostname'], 'address': address, 'connector': d_db_iplist[address]['connector'], 'connector_name': d_db_iplist[address]['connector_name']}, 'doublon': [{'hostname': hostname, 'address': address, 'connector': [connector], 'connector_name': [connector_name]}]}
			
		else :
			db_doublon_doc['doublon_by_ip'][address]['doublon'].append({'hostname': hostname, 'address': address, 'connector': [connector], 'connector_name': [connector_name]})

		db_conf[db_doublon_doc.id] = db_doublon_doc

		return
	else :
		if connector not in d_db_hostlist[hostname]['connector']:
			print 'New connector type'
                        d_db_hostlist[hostname]['connector'].append(connector)
                        db_hosts[hostname] = d_db_hostlist[hostname]
                if connector_name not in d_db_hostlist[hostname]['connector_name']:
			print 'New connector name'
                        d_db_hostlist[hostname]['connector_name'].append(connector_name)
                        db_hosts[hostname] = d_db_hostlist[hostname]

	db_events[doc_id_event] = rb_content

	current_event(d_current_event, db_currentevents, d_db_current_events)

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
d_db_current_events = init_current_event_dict(db_currentevents)
d_db_hostlist = init_hostlist_dict(db_hosts)
d_db_iplist = init_iplist_dict(db_hosts)
db_connector_list_doc = init_connector_list_doc(db_conf)
db_doublon_doc = init_doublon_doc(db_conf)
### Fonc a supprimer c juste pour limiter le nombre devent sur 1sec
flag_insert_ok = init_flag()
###

channel.basic_consume(callback,
                      queue=queue_name,
                      no_ack=True)

channel.start_consuming()

