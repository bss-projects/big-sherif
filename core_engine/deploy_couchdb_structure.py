#!/usr/bin/python
# -*- coding: utf-8 -*-
import sys
import json
import requests

database_address = 'http://127.0.0.1:5984/'

headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

l_db_name = []
d_view_name = {}
d_doc_view = {}

#l_db_name.append('auth')
l_db_name.append('grouplist')
l_db_name.append('blacklist')
l_db_name.append('component_deduplicate')
l_db_name.append('component_pool')
l_db_name.append('config')
l_db_name.append('criticality_requalify')
l_db_name.append('criticality_transcode')
l_db_name.append('currentevents')
l_db_name.append('duplicate_entry')
l_db_name.append('events')
l_db_name.append('hosts')
l_db_name.append('unmanaged')
l_db_name.append('whitelist')
l_db_name.append('cartography')
l_db_name.append('saved_filters')
l_db_name.append('userlist')

#d_view_name[l_db_name[0]] = ['grouplist', 'userlist']
d_view_name[l_db_name[0]] = ['grouplist']
d_view_name[l_db_name[1]] = ['blacklist']
d_view_name[l_db_name[2]] = ['component_deduplicate']
d_view_name[l_db_name[3]] = ['component_pool']
d_view_name[l_db_name[4]] = ['config', 'connectorlist', 'criticalitylist']
d_view_name[l_db_name[5]] = ['criticality_requalify']
d_view_name[l_db_name[6]] = ['criticality_transcode']
d_view_name[l_db_name[7]] = ['currentevents']
d_view_name[l_db_name[8]] = ['duplicate_entry']
d_view_name[l_db_name[9]] = ['events']
d_view_name[l_db_name[10]] = ['hosts']
d_view_name[l_db_name[11]] = ['unmanaged']
d_view_name[l_db_name[12]] = ['whitelist']
d_view_name[l_db_name[14]] = ['userlist']



d_doc_view[d_view_name[l_db_name[0]][0]] = [
{
   "_id": "_design/grouplist",
   "language": "javascript",
   "views": {
       "_id": {
           "map": "function(doc) { if(doc.type == 'group'){emit(doc._id, null);} }"
       },
       "groupname": {
           "map": "function(doc) { if(doc.type == 'group'){emit(doc.groupname, null);} }"
       },
       "desc": {
           "map": "function(doc) { if(doc.type == 'group'){emit(doc.desc, null);} }"
       },
       "permissions": {
           "map": "function(doc) { if(doc.type == 'group'){emit(doc.permissions, null);} }"
       }
   }
}
]

d_doc_view[d_view_name[l_db_name[14]][0]] = [
	{
   "_id": "_design/userlist",
   "language": "javascript",
   "views": {
       "_id": {
           "map": "function(doc) { if(doc.type == 'user'){emit(doc._id, null);} }"
       },
       "last_name": {
           "map": "function(doc) { if(doc.type == 'user'){emit(doc.last_name, null);} }"
       },
       "first_name": {
           "map": "function(doc) { if(doc.type == 'user'){emit(doc.first_name, null);} }"
       }
       ,
       "groups": {
           "map": "function(doc) { if(doc.type == 'user'){emit(doc.groups, null);} }"
       }
   }
}]

d_doc_view[d_view_name[l_db_name[1]][0]] = [
{
   "_id": "_design/blacklist",
   "language": "javascript",
   "views": {
       "restrictlist": {
           "map": "function(doc) { if (doc.stop == 0) {emit(doc.order, null)};}"
       },
       "listbyorder": {
           "map": "function(doc) { emit(doc.order, null);}"
       },
       "listbylabel": {
           "map": "function(doc) { emit(doc.label, null);}"
       },
       "label": {
           "map": "function(doc) { emit(doc.label, null);}"
       },
       "stop": {
           "map": "function(doc) { emit(doc.stop, null);}"
       },
       "order": {
           "map": "function(doc) { emit(doc.order, null);}"
       },
       "hostname": {
           "map": "function(doc) { emit(doc.hostname, null);}"
       },
       "resource": {
           "map": "function(doc) { emit(doc.resource, null);}"
       },
       "connector_name": {
           "map": "function(doc) { emit(doc.connector_name, null);}"
       },
       "criticality": {
           "map": "function(doc) { emit(doc.criticality, null);}"
       },
       "desc": {
           "map": "function(doc) { emit(doc.desc, null);}"
       }
   }
}
]

d_doc_view[d_view_name[l_db_name[2]][0]] = [
{
   "_id": "_design/component_deduplicate",
   "language": "javascript",
   "views": {
       "deduplicatelist": {
           "map": "function(doc) { emit(doc.component_src+'-'+doc.address_src, null);}"
       },
       "listbycomponent_src": {
           "map": "function(doc) { emit(doc.component_src, null);}"
       },
       "listbycomponent_dest": {
           "map": "function(doc) { emit(doc.component_dest, null);}"
       },
       "component_src": {
           "map": "function(doc) { emit(doc.component_dest, null);}"
       },
       "listbyaddress_dest": {
           "map": "function(doc) { emit(doc.address_dest, null);}"
       },
       "listbyaddress_src": {
           "map": "function(doc) { emit(doc.address_src, null);}"
       },
       "_id": {
           "map": "function(doc) { emit(doc._id, null);}"
       },
       "stop": {
           "map": "function(doc) { emit(doc.stop, null);}"
       },
       "component_src": {
           "map": "function(doc) { emit(doc.component_src, null);}"
       },
       "address_src": {
           "map": "function(doc) { emit(doc.address_src, null);}"
       },
       "component_dest": {
           "map": "function(doc) { emit(doc.component_dest, null);}"
       },
       "address_dest": {
           "map": "function(doc) { emit(doc.address_dest, null);}"
       },
       "desc": {
           "map": "function(doc) { emit(doc.desc, null);}"
       }
   }
}
]

d_doc_view[d_view_name[l_db_name[3]][0]] = [
{
   "_id": "_design/component_pool",
   "language": "javascript",
   "views": {
       "pooltypelist": {
           "map": "function(doc) { if (doc.pool_type_list == 1) {emit(doc.pool_type_name, null)};}"
       },
       "poollist": {
           "map": "function(doc) { if (!doc.pool_type_list) {emit(doc.pool_name, null)};}"
       },
       "domainepoollist": {
           "map": "function(doc) { if (doc.pool_type_name == 'Domaine' && !doc.pool_type_list) {emit(doc.pool_name, null)};}"
       },
       "perimetrepoollist": {
           "map": "function(doc) { if (doc.pool_type_name == 'Périmètre' && !doc.pool_type_list) {emit(doc.pool_name, null)};}"
       },
       "fonctionnelpoollist": {
           "map": "function(doc) { if (doc.pool_type_name == 'Fonctionnel' && !doc.pool_type_list) {emit(doc.pool_name, null)};}"
       },
       "servicepoollist": {
           "map": "function(doc) { if (doc.pool_type_name == 'Service' && !doc.pool_type_list) {emit(doc.pool_name, null)};}"
       },
       "pool_name": {
           "map": "function(doc) { if (!doc.pool_type_list) {emit(doc.pool_name, null)};}"
       },
       "pool_type_name": {
           "map": "function(doc) { if (!doc.pool_type_list) {emit(doc.pool_type_name, null)};}"
       },
       "desc": {
           "map": "function(doc) { if (!doc.pool_type_list) {emit(doc.desc, null)};}"
       }
   }
}
]

d_doc_view[d_view_name[l_db_name[4]][0]] = [
{
   "_id": "_design/config",
   "language": "javascript",
   "views": {
       "connectorlist": {
           "map": "function(doc) {if (doc._id == 'connector_list'){for (var key in doc.connector_list){emit(key, {'connector': doc.connector_list[key]['connector'], 'connector_hostname': doc.connector_list[key]['connector_hostname'], 'connector_status': doc.connector_list[key]['connector_status'],'connector_hostip': doc.connector_list[key]['connector_hostip']});}}}"
       },
       "cphconnectorlist": {
           "map": "function(doc) {if (doc._id == 'connector_list'){for (var key in doc.connector_list){if (doc.connector_list[key]['connector_family'] == 'CPH'){emit(key, {'connector': doc.connector_list[key]['connector'], 'connector_hostname': doc.connector_list[key]['connector_hostname'],'connector_hostip': doc.connector_list[key]['connector_hostip'], 'connector_command': doc.connector_list[key]['connector_command'], 'connector_command_agrs': doc.connector_list[key]['connector_command_agrs']});}}}}"
       },
       "typeconnectorlist": {
           "map": "function (doc){if (doc._id == 'connector_list'){for (var key in doc.connector_list){emit(doc.connector_list[key]['connector'], {'connector': doc.connector_list[key]['connector'], 'connector_hostname': doc.connector_list[key]['connector_hostname'],'connector_hostip': doc.connector_list[key]['connector_hostip']});}}}"
       }
   }
}
]

d_doc_view[d_view_name[l_db_name[4]][1]] = [
{
   "_id": "_design/connectorlist",
   "language": "javascript",
   "views": {
       "_id": {
           "map": "function(doc) {if (doc._id == 'connector_list'){for (var key in doc.connector_list){emit(key, {'_id': key, 'connector': doc.connector_list[key]['connector'], 'connector_hostname': doc.connector_list[key]['connector_hostname'], 'connector_family': doc.connector_list[key]['connector_family'], 'connector_status': doc.connector_list[key]['connector_status'],'connector_hostip': doc.connector_list[key]['connector_hostip']});}}}"
       },
       "connector_status": {
           "map": "function(doc) {if (doc._id == 'connector_list'){for (var key in doc.connector_list){emit(doc.connector_list[key]['connector_status'], {'_id': key, 'connector': doc.connector_list[key]['connector'], 'connector_hostname': doc.connector_list[key]['connector_hostname'], 'connector_family': doc.connector_list[key]['connector_family'], 'connector_status': doc.connector_list[key]['connector_status'],'connector_hostip': doc.connector_list[key]['connector_hostip']});}}}"
       },
       "connector": {
           "map": "function(doc) {if (doc._id == 'connector_list'){for (var key in doc.connector_list){emit(doc.connector_list[key]['connector'], {'_id': key, 'connector': doc.connector_list[key]['connector'], 'connector_hostname': doc.connector_list[key]['connector_hostname'], 'connector_family': doc.connector_list[key]['connector_family'], 'connector_status': doc.connector_list[key]['connector_status'],'connector_hostip': doc.connector_list[key]['connector_hostip']});}}}"
       },
       "connector_family": {
           "map": "function(doc) {if (doc._id == 'connector_list'){for (var key in doc.connector_list){emit(doc.connector_list[key]['connector_family'], {'_id': key, 'connector': doc.connector_list[key]['connector'], 'connector_hostname': doc.connector_list[key]['connector_hostname'], 'connector_family': doc.connector_list[key]['connector_family'], 'connector_status': doc.connector_list[key]['connector_status'],'connector_hostip': doc.connector_list[key]['connector_hostip']});}}}"
       },
       "connector_hostname": {
           "map": "function(doc) {if (doc._id == 'connector_list'){for (var key in doc.connector_list){emit(doc.connector_list[key]['connector_hostname'], {'_id': key, 'connector': doc.connector_list[key]['connector'], 'connector_hostname': doc.connector_list[key]['connector_hostname'], 'connector_family': doc.connector_list[key]['connector_family'], 'connector_status': doc.connector_list[key]['connector_status'],'connector_hostip': doc.connector_list[key]['connector_hostip']});}}}"
       },
       "connector_hostip": {
           "map": "function(doc) {if (doc._id == 'connector_list'){for (var key in doc.connector_list){emit(doc.connector_list[key]['connector_hostip'], {'_id': key, 'connector': doc.connector_list[key]['connector'], 'connector_hostname': doc.connector_list[key]['connector_hostname'], 'connector_family': doc.connector_list[key]['connector_family'], 'connector_status': doc.connector_list[key]['connector_status'],'connector_hostip': doc.connector_list[key]['connector_hostip']});}}}"
       }
   }
}
]

d_doc_view[d_view_name[l_db_name[4]][2]] = [
{
   "_id": "_design/criticalitylist",
   "language": "javascript",
   "views": {
       "_id": {
           "map": "function(doc) {if (doc._id == 'criticality'){for (var key in doc){if (key != '_id' && key != '_rev') {emit(key, {'_id': key, 'label': doc[key]['label'],'weight': doc[key]['weight'],'desc': doc[key]['desc']});}}}}"
       },
       "label": {
           "map": "function(doc) {if (doc._id == 'criticality'){for (var key in doc){if (key != '_id' && key != '_rev') {emit(doc[key]['label'] || '', {'_id': key, 'label': doc[key]['label'],'weight': doc[key]['weight'],'desc': doc[key]['desc']});}}}}"
       },
       "weight": {
           "map": "function(doc) {if (doc._id == 'criticality'){for (var key in doc){if (key != '_id' && key != '_rev') {emit(doc[key]['weight'], {'_id': key, 'label': doc[key]['label'],'weight': doc[key]['weight'],'desc': doc[key]['desc']});}}}}"
       },
       "desc": {
           "map": "function(doc) {if (doc._id == 'criticality'){for (var key in doc){if (key != '_id' && key != '_rev') {emit(doc[key]['desc'] || '', {'_id': key, 'label': doc[key]['label'],'weight': doc[key]['weight'],'desc': doc[key]['desc']});}}}}"
       }
   }
}
]

d_doc_view[d_view_name[l_db_name[5]][0]] = [
{
   "_id": "_design/criticality_requalify",
   "language": "javascript",
   "views": {
       "requalifylist": {
           "map": "function(doc) { emit(doc.component+'-'+doc.connector+'-'+doc.criticality_transcode, {'criticality_requalify': doc.criticality_requalify, 'weight': doc.weight});}"
       },
       "listbyconnector": {
           "map": "function(doc) { emit(doc.connector, null);}"
       },
       "listbycriticality_requalify": {
           "map": "function(doc) { emit(doc.criticality_requalify, null);}"
       },
       "listbycomponent": {
           "map": "function(doc) { emit(doc.component, null);}"
       },
       "_id": {
           "map": "function(doc) { emit(doc._id, null);}"
       },
       "component": {
           "map": "function(doc) { emit(doc.component, null);}"
       },
       "resource": {
           "map": "function(doc) { emit(doc.resource, null);}"
       },
       "connector": {
           "map": "function(doc) { emit(doc.connector, null);}"
       },
       "criticality_transcode": {
           "map": "function(doc) { emit(doc.criticality_transcode, null);}"
       },
       "criticality_requalify": {
           "map": "function(doc) { emit(doc.criticality_requalify, null);}"
       }
   }
}
]

d_doc_view[d_view_name[l_db_name[6]][0]] = [
{
   "_id": "_design/criticality_transcode",
   "language": "javascript",
   "views": {
       "transcodelist": {
           "map": "function(doc) { emit(doc.connector+'-'+doc.criticality_input, {'criticality_transcode': doc.criticality_transcode, 'weight': doc.weight});}"
       },
       "listbyconnector": {
           "map": "function(doc) { emit(doc.connector, null);}"
       },
       "listbycriticality_transcode": {
           "map": "function(doc) { emit(doc.criticality_transcode, null);}"
       }
   }
}
]

d_doc_view[d_view_name[l_db_name[7]][0]] = [
{
   "_id": "_design/currentevents",
   "language": "javascript",
   "views": {
       "current-hostname-resource": {
           "map": "function(doc) { if (doc.is_history == 0) {emit(doc.component+'-'+doc.resource, null)}; }"
       },
       "hostname-resource": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {emit(doc.component+'-'+doc.resource, null); }}"
       },
       "timestamp_start": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {if ('is_history' in doc && doc.is_history == 0) {emit(doc.timestamp_start, null); }}}"
       },
       "component": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {if ('is_history' in doc && doc.is_history == 0) {emit(doc.component, null); }}}"
       },
       "resource": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {if ('is_history' in doc && doc.is_history == 0) {emit(doc.resource, null); }}}"
       },
       "state": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {if ('is_history' in doc && doc.is_history == 0) {emit(doc.state, null); }}}"
       },
       "output": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {if ('is_history' in doc && doc.is_history == 0) {emit(doc.output, null); }}}"
       },
       "criticality": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {if ('is_history' in doc && doc.is_history == 0) {emit(doc.criticality, null); }}}"
       },
       "timestamp_start_history": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {emit(doc.timestamp_start, null); }}"
       },
       "component_history": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {emit(doc.component, null); }}"
       },
       "resource_history": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {emit(doc.resource, null); }}"
       },
       "state_history": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {emit(doc.state, null); }}"
       },
       "output_history": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {emit(doc.output, null); }}"
       },
       "criticality_history": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {emit(doc.criticality, null); }}"
       },
       "eventbypool": {
           "map": "function (doc) {if (doc.is_history == 0){for (var len_pool = doc.pool.length - 1; len_pool >= 0; len_pool--){emit(doc.pool[len_pool]['pool_name'], null);emit(doc.pool[len_pool]['pool_type_name'], null);}}}"
       },
       "alarm": {
           "map": "function(doc){ if ('in_whitelist' in doc && doc.in_whitelist == 1) {if ('is_history' in doc && doc.is_history == 0) { var alarm_value = ''; alarm_value+=doc.state; alarm_value+=doc.criticality; alarm_value+=doc.timestamp_start; emit(parseInt(alarm_value), null); }}}"
       },
       "pool_domaine" : {
            "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {if ('is_history' in doc && doc.is_history == 0) {var results = [];if ('pool' in doc && doc.pool != null){for (var i = 0; i < doc.pool.length; i++) {if (doc.pool[i]['pool_type_name'] == 'Domaine') {results[results.length] = doc.pool[i]['pool_name'];}}}var result = '';if (results.length) {result = results.join();}emit(result, null);}}}"
       },
       "pool_perimetre" : {
            "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {if ('is_history' in doc && doc.is_history == 0) {var results = [];if ('pool' in doc && doc.pool != null){for (var i = 0; i < doc.pool.length; i++) {if (doc.pool[i]['pool_type_name'] == 'Périmètre') {results[results.length] = doc.pool[i]['pool_name'];}}}var result = '';if (results.length) {result = results.join();}emit(result, null);}}}"
       },
       "pool_domaine_history" : {
            "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {var results = [];if ('pool' in doc && doc.pool != null){for (var i = 0; i < doc.pool.length; i++) {if (doc.pool[i]['pool_type_name'] == 'Domaine') {results[results.length] = doc.pool[i]['pool_name'];}}}var result = '';if (results.length) {result = results.join();}emit(result, null);}}"
       },
       "pool_perimetre_history" : {
            "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {var results = [];if ('pool' in doc && doc.pool != null){for (var i = 0; i < doc.pool.length; i++) {if (doc.pool[i]['pool_type_name'] == 'Périmètre') {results[results.length] = doc.pool[i]['pool_name'];}}}var result = '';if (results.length) {result = results.join();}emit(result, null);}}"
       },
       "recover_not_history":{
			"map" : "function(doc) { if (doc.is_history == 0 && doc.state == 0) { emit(doc._id, null); }}"
	   }
   }
}
]

d_doc_view[d_view_name[l_db_name[8]][0]] = [
{
   "_id": "_design/duplicate_entry",
   "language": "javascript",
   "views": {
       "listcomponentipduplicateentry": {
           "map": "function(doc) { if (doc.duplicate_type == 'component_duplicate_by_component_ip') {emit(doc.duplicate_entry['component']+'-'+doc.duplicate_entry['address'], null);}}"
       },
       "listcomponentnameduplicateentry": {
           "map": "function(doc) { if (doc.duplicate_type == 'component_duplicate_by_component_name') {emit(doc.duplicate_entry['component']+'-'+doc.duplicate_entry['address'], null);}}"
       },
       "duplicatecomponentip": {
           "map": "function(doc) { if (doc.duplicate_type == 'component_duplicate_by_component_ip') {emit(doc.duplicate_reason, null);}}"
       },
       "duplicatecomponentname": {
           "map": "function(doc) { if (doc.duplicate_type == 'component_duplicate_by_component_name') {emit(doc.duplicate_reason, null);}}"
       },
       "_id": {
           "map": "function(doc) {emit(doc._id, null);}"
       },
       "duplicate_type": {
           "map": "function(doc) {emit(doc.duplicate_type, null);}"
       },
       "duplicate_reason": {
           "map": "function(doc) {emit(doc.duplicate_reason, null);}"
       },
       "duplicate_entry": {
           "map": "function(doc) {emit(doc.duplicate_entry, null);}"
       },
       "primary_entry": {
           "map": "function(doc) {emit(doc.primary_entry, null);}"
       }
   }
}
]

d_doc_view[d_view_name[l_db_name[9]][0]] = [
{
   "_id": "_design/events",
   "language": "javascript",
   "views": {
       "hostname-resource": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {emit(doc.component+'-'+doc.resource, null); }}"
       },
       "timestamp_start": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {emit(doc.timestamp_start, null); }}"
       },
       "component": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {emit(doc.component, null); }}"
       },
       "resource": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {emit(doc.resource, null); }}"
       },
       "output": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {emit(doc.output, null); }}"
       },
       "criticality": {
           "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {emit(doc.criticality, null); }}"
       },
       "eventbypool": {
           "map": "function (doc) {if (doc.is_history == 0){for (var len_pool = doc.pool.length - 1; len_pool >= 0; len_pool--){emit(doc.pool[len_pool]['pool_name'], null);emit(doc.pool[len_pool]['pool_type_name'], null);}}}"
       },
       "pool_domaine" : {
            "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {var results = [];if ('pool' in doc && doc.pool != null){for (var i = 0; i < doc.pool.length; i++) {if (doc.pool[i]['pool_type_name'] == 'Domaine') {results[results.length] = doc.pool[i]['pool_name'];}}}var result = '';if (results.length) {result = results.join();}emit(result, null);}}"
       },
       "pool_perimetre" : {
            "map": "function(doc) { if ('in_whitelist' in doc && doc.in_whitelist == 1) {var results = [];if ('pool' in doc && doc.pool != null){for (var i = 0; i < doc.pool.length; i++) {if (doc.pool[i]['pool_type_name'] == 'Périmètre') {results[results.length] = doc.pool[i]['pool_name'];}}}var result = '';if (results.length) {result = results.join();}emit(result, null);}}"
       }
   }
}
]

d_doc_view[d_view_name[l_db_name[10]][0]] = [
{
   "_id": "_design/hosts",
   "language": "javascript",
   "views": {
       "hostlist": {
           "map": "function(doc) { emit(doc._id, null);}"
       },
       "_id": {
           "map": "function(doc) { emit(doc._id, null);}"
       },
       "address": {
           "map": "function(doc) { emit(doc.address, null);}"
       },
       "pool_domaine" : {
            "map": "function(doc) { var results = [];if ('pool' in doc && doc.pool != null){for (var i = 0; i < doc.pool.length; i++) {if (doc.pool[i]['pool_type_name'] == 'Domaine') {results[results.length] = doc.pool[i]['pool_name'];}}}var result = '';if (results.length) {result = results.join();}emit(result, null);}"
       },
       "pool_perimetre" : {
            "map": "function(doc) { var results = [];if ('pool' in doc && doc.pool != null){for (var i = 0; i < doc.pool.length; i++) {if (doc.pool[i]['pool_type_name'] == 'Périmètre') {results[results.length] = doc.pool[i]['pool_name'];}}}var result = '';if (results.length) {result = results.join();}emit(result, null);}"
       },
       "iplist": {
           "map": "function(doc) { emit(doc.address, {'hostname' : doc._id, 'connector' : doc.connector, 'connector_name': doc.connector_name});}"
       },
	"poolforcheck": {
           "map": "function(doc) { if (doc.resource) { for (var resource in doc.resource) {emit(doc._id+'-'+resource, doc.pool);}}}"
       },
       "checkforpool": {
           "map": "function(doc) { if (doc.resource) {for (var len_pool = doc.pool.length - 1; len_pool >= 0; len_pool--){for (var resource in doc.resource){emit(doc.pool[len_pool]['pool_name'], {'component': doc._id, 'resource': resource});}}}}"
       },
       "pool": {
           "map": "function(doc) {for (i = 0; i < doc.pool.length; i++) {emit(doc.pool[i]['pool_name'], null);}}"
       }
   }
}
]

d_doc_view[d_view_name[l_db_name[11]][0]] = [
{
   "_id": "_design/unmanaged",
   "language": "javascript",
   "views": {
       "componentunmanagedlist": {
           "map": "function(doc) { if (doc.is_over == 0) {emit(doc.component, null); }}"
       }
   }
}
]

d_doc_view[d_view_name[l_db_name[12]][0]] = [
{
   "_id": "_design/whitelist",
   "language": "javascript",
   "views": {
       "restrictlist": {
           "map": "function(doc) { if (doc.stop == 0) {emit(doc.order, null)};}"
       },
       "listbyorder": {
           "map": "function(doc) { emit(doc.order, null);}"
       },
       "listbylabel": {
           "map": "function(doc) { emit(doc.label, null);}"
       },
       "label": {
           "map": "function(doc) { emit(doc.label, null);}"
       },
       "stop": {
           "map": "function(doc) { emit(doc.stop, null);}"
       },
       "order": {
           "map": "function(doc) { emit(doc.order, null);}"
       },
       "hostname": {
           "map": "function(doc) { emit(doc.hostname, null);}"
       },
       "resource": {
           "map": "function(doc) { emit(doc.resource, null);}"
       },
       "connector_name": {
           "map": "function(doc) { emit(doc.connector_name, null);}"
       },
       "criticality": {
           "map": "function(doc) { emit(doc.criticality, null);}"
       },
       "desc": {
           "map": "function(doc) { emit(doc.desc, null);}"
       }
   }
}
]

for db_name in l_db_name:
	r = requests.put(database_address+"/big_sherif_"+db_name, headers=headers)
	print r.json();
	r = requests.put(database_address+"/big_sherif_"+db_name+'/_revs_limit', data=json.dumps(3), headers=headers)
	print r.json();
	if db_name in d_view_name:
		for view_name in d_view_name[db_name]:
			for doc_view in d_doc_view[view_name]:
				r = requests.put(database_address+"/big_sherif_"+db_name+"/_design/"+view_name, data=json.dumps(doc_view), headers=headers)
				print r.json();

doc_connector_list = {
   "_id": "connector_list",
   "connector_list": {}
}

r = requests.put(database_address+"/big_sherif_config/connector_list", data=json.dumps(doc_connector_list), headers=headers)
print r.json();

doc_criticality = {
   "_id": "criticality",
   "0": {
       "label": "Ok",
       "weight": 0
   },
   "1": {
       "label": "Warning",
       "weight": 1
   },
   "2": {
       "label": "Critical",
       "weight": 5
   },
   "3": {
       "label": "Unknown",
       "weight": 2
   },
   "4": {
       "label": "Minor",
       "weight": 3
   },
   "5": {
       "label": "Major",
       "weight": 4
   }
}

r = requests.put(database_address+"/big_sherif_config/criticality", data=json.dumps(doc_criticality), headers=headers)
print r.json()

doc_default_whitelist = {
   "_id": "default_whitelist",
   "resource": "*",
   "connector_name": "*",
   "hostname": "*",
   "criticality": "*",
   "label": "Allow all",
   "desc": "Allow access for all event in whitelist",
   "order": 1,
   "balance": 0,
   "stop": 0
}

r = requests.put(database_address+"/big_sherif_whitelist/default_whitelist", data=json.dumps(doc_default_whitelist), headers=headers)
print r.json()

doc_default_useradmin = {
   "_id": "admin",
   "username": "admin",
   "first_name": "Administrateur",
   "last_name": "Administrateur",
   "password": "21232f297a57a5a743894a0e4a801fc3",
   "groups": ["admin"],
   "type": "user",
   "email": "admin@admin.com"
}

r = requests.put(database_address+"/big_sherif_userlist/admin", data=json.dumps(doc_default_useradmin), headers=headers)
print r.json()

doc_default_groupadmin = {
   "_id": "admin",
   "groupname": "admin",
   "type": "group",
   "pool": [],
   "desc": "Groupe Administrateur"
}

r = requests.put(database_address+"/big_sherif_grouplist/admin", data=json.dumps(doc_default_groupadmin), headers=headers)
print r.json()
