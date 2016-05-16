#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import couchdb
import json
import time
import socket
from uuid import uuid4

#null = None

couch = couchdb.Server('http://127.0.0.1:5984/')

db_hosts = couch['big_sherif_hosts']
db_conf = couch['big_sherif_config']

def diffDict(d_tocompare, value):
        c_tocompare = set(d_tocompare)
        c_value = set(value)

        toadd = [ k for k in d_tocompare if k not in value ]
        todel = [ k for k in value if k not in d_tocompare ]
        tochange = [ k for k in d_tocompare if k not in toadd and d_tocompare[k] != value[k] ]

        return { "toadd" : toadd,
                 "todel": todel,
                 "tochange": tochange }


def addslashes(s):
    d = {'"':'\\"', "'":"\\'", "\0":"\\\0", "\\":"\\\\"}
    return ''.join(d.get(c, c) for c in s)

def getHostShinkenDict(result):
        l_type_hostinfo = ['address', 'groups', 'accept_passive_checks', 'action_url', 'action_url_expanded', 'active_checks_enabled', 'alias', 'check_command', 'check_flapping_recovery_notification', 'check_freshness', 'check_interval', 'check_options', 'check_period', 'check_type', 'checks_enabled', 'display_name', 'event_handler_enabled', 'initial_state', 'is_executing', 'is_flapping', 'is_impact', 'is_problem', 'max_check_attempts', 'name', 'notes', 'notes_expanded', 'notes_url', 'notes_url_expanded', 'notification_period', 'notification_interval', 'notifications_enabled']

        flag = 0
        infos = []
        for row in eval(result):
                if flag == 0:
                        fields = row
                        flag = 1
                else:  
                        items = zip(fields, row)
                        item = {}
                        for (name, value) in items:
                                item[name] = value
                        infos.append(item)

        d_gethost = {}
        d_tempValue = {}
        for item in infos:
                d_gethost[item['name']] = {}
                for type_hostinfo in l_type_hostinfo:
                        if type_hostinfo == 'groups' or type_hostinfo == 'address':
                                d_tempValue[type_hostinfo] = item[type_hostinfo]
                        else:  
                                d_tempValue[type_hostinfo] = addslashes(str(item[type_hostinfo]))
                d_gethost[item['name']] = d_tempValue
                d_tempValue = {}

        return d_gethost

def getHostgroupShinkenList(result):
        l_hostgroup = []

        for row in eval(result):
                l_hostgroup.append(row[0])

        return l_hostgroup

def queryToShinken(host, port, query):
        s = None

        for res in socket.getaddrinfo(host, port, socket.AF_UNSPEC, socket.SOCK_STREAM):
                af, socktype, proto, canonname, sa = res
                try:
                        s = socket.socket(af, socktype, proto)
                except socket.error, msg:
                        s = None
                        continue
                try:
                        s.connect(sa)
                except socket.error, msg:
                        s.close()
                        s = None
                        continue
                break

        if s is None:
                print 'could not open socket'
                sys.exit(1)

        s.sendall(query)
        data = s.recv(16)
        size = int(data[4:])

        result = ''
        total_recv = 0
        while total_recv < size:
                data = s.recv(size)
                total_recv = len(data) + total_recv
                result += data

        s.close()

        return result

def managehostgroup(hostname, systems):

	db_systems_doc = db_conf.get('systems')
	
	d_systems = {'systemlist':[]}
	flag_update_systems = 0
	flag_systems_doc_noexist = 0

	if db_systems_doc == None :
		flag_systems_doc_noexist = 1
	else :
		d_systems['systemlist'] = db_systems_doc['systemlist']

	for system in systems:
		if system not in d_systems['systemlist'] :
                        flag_update_systems = 1
                        d_systems['systemlist'].append(system)

	if flag_systems_doc_noexist == 1 :
                db_conf['systems'] = d_systems
	elif flag_update_systems == 1 :
		db_systems_doc['systemlist'] = d_systems['systemlist']
		db_conf[db_systems_doc.id] = db_systems_doc

'''
''
''MAIN
''
'''


result_host = queryToShinken('127.0.0.1', 50000, 'GET hosts\nResponseHeader: fixed16\nOutputFormat: python\nColumnHeaders: on\n\n')
result_hostgroup = queryToShinken('127.0.0.1', 50000, 'GET hostgroups\nColumns: name\nResponseHeader: fixed16\nOutputFormat: python\nColumnHeaders: off\n\n')

d_gethost = getHostShinkenDict(result_host)
l_gethostgroup = getHostgroupShinkenList(result_hostgroup)
d_hostlist = {}
flag_update_hostdoc = 0

for row in db_hosts.view('hosts/hostlist') :
	d_hostlist[row.key] = row.doc

for (hostname, value) in d_gethost.items():
	is_impact = value['is_impact']
	action_url = value['action_url']
	notes_url = value['notes_url']
	display_name = value['display_name']
	is_problem = value['is_problem']
	notifications_enabled = value['notifications_enabled']
	action_url_expanded = value['action_url_expanded']
	systems = value['groups']
	address = value['address']
	notes_url_expanded = value['notes_url_expanded']
	notes = value['notes']
	is_flapping = value['is_flapping']
	notes_expanded = value['notes_expanded']

	d_hostinfo = {'address': address, 'is_impact': is_impact, 'action_url': action_url, 'notes_url': notes_url, 'display_name': display_name, 'is_problem': is_problem, 'notifications_enabled': notifications_enabled, 'action_url_expanded': action_url_expanded, 'systems': systems, 'notes_url_expanded': notes_url_expanded, 'notes': notes, 'is_flapping': is_flapping, 'notes_expanded': notes_expanded}

	managehostgroup(hostname, systems)

	if hostname not in d_hostlist:
		db_hosts[hostname] = d_hostinfo
		d_hostlist[hostname] = d_hostinfo
	else :
##@ToDo il faut faire la verif du doublon si ip change et faire la declaration dans le doc qui liste les doublons
		compare = diffDict(d_hostinfo, d_hostlist[hostname])
		for action, l_key in compare.items():
			if action == "tochange" and l_key != [] :
				print 'tochange '+ hostname
				for key in l_key:
					flag_update_hostdoc = 1
                                       	vartype = type(d_hostlist[hostname][key])
                                       	print vartype
                                        if vartype is tuple or vartype is list or vartype is dict:
                                                print d_hostlist[hostname][key]
                                                for value in d_hostinfo[key]:
							if value not in d_hostlist[hostname][key] :
	                                                        d_hostlist[hostname][key].append(value)
                                                print d_hostlist[hostname][key]
                                        else :
                                                print d_hostlist[hostname][key]
                                                d_hostlist[hostname][key] = d_hostinfo[key]
                                                print d_hostlist[hostname][key]
                        elif action == "toadd" and l_key != [] :
                                flag_update_hostdoc = 1
                                for key in l_key:
                                        d_hostlist[hostname].update({key: d_hostinfo[key]})

                if flag_update_hostdoc == 1:
			flag_update_hostdoc = 0
                        db_hosts[d_hostlist[hostname]['_id']] = d_hostlist[hostname]


#@ToDo faire le systeme de conflit pour faire le dedoublonnage meme ip mais pas meme hostname et inverse
# Faire en sorte de bien mettre à jour les hostgroup. il ne faut jamais ecraser car des hostgroup peuvent arriver de plusieurs
# superviseur donc qd on a un nouveau hostgroup on ne fait jamais que du add sur le tableau hostgroup
# Il faut aussi prevoir la suppression des hosts par exemple a la fin de la recuperation de toute la liste
# prevenir que tel ou tel host non pas ete trouver et faire valider la suppression
# Faire la verification du type de variable dans le doc du host pour savoir comment je met a jour pour eviter ecrasement dans le cas
# des list ou des tableau (groups par exemple)

# Qd on fait la comparaison dans le cas de la comparaison de group si les groups provenant shinken et hpov par ex ne sont pas les meme ce qui sera le cas a chaque mise a jour qd on fait le diff il va toujours trouver quil faut faire une change
# a chaque passage et rajoutera a linfini les groups. 

# Faire aussi attention lajout dans une list un tuple ou dict ne se fait pas via un append dans tous les cas

# Il faut gerer la modification des groups (system) tant au niveau de la suppression que de l'ajout dans la fonction managehostgroup
# Si je suppr un group ou que je renomme un group dans le superviseur l'ancien enregistrement reste. Idem qd j'enleve un host d'un hostgroup pour le moment il n'est pas suppr du hostgroup ni dans sa fiche ni dans les docs systems et nom_du_host_group
					
