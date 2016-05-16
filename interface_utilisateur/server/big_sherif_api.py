#!/usr/bin/python
# -*- coding: utf-8 -*-

import math
import random
import hashlib
import time
import string
import os

from pprint import pprint

import simplejson
import requests
from urllib2 import quote, unquote

import smtplib
from email.mime.text import MIMEText
import datetime
# import cx_Oracle
import sys

import gen_cartography

#DATABASE INIT
import couchdb
elasticsearch_address = "http://127.0.0.1:9200"
database_address = "http://127.0.0.1:5984"
database_server = couchdb.Server(database_address)
db_users = database_server["big_sherif_userlist"]
db_groups = database_server["big_sherif_grouplist"]

# BOTTLE APP
from bottle import Bottle, route, run, static_file, request, response, abort

big_sherif_api = Bottle()

proxies = {
				"http": "",
				"https": "",}

# API EVENTS ROUTES
@big_sherif_api.get('/api/cartography/<id>.js')    
def cartography_js(id):
    blocks =  db_cartography[id]["blocks"]
    data = maps_list(id, blocks)
    return gen_cartography.generate_js(data)


@big_sherif_api.get('/api/currentevents/<id>')
@big_sherif_api.get('/api/saved_filters/<id>')
@big_sherif_api.get('/api/currenteventshistory/<id>')
@big_sherif_api.get('/api/events/<id>')
@big_sherif_api.get('/api/hosts/<id>')
@big_sherif_api.get('/api/whitelist/<id>')
@big_sherif_api.get('/api/blacklist/<id>')
@big_sherif_api.get('/api/component_pool/<id>')
@big_sherif_api.get('/api/component_deduplicate/<id>')
@big_sherif_api.get('/api/duplicate_entry/<id>')
@big_sherif_api.get('/api/criticality_requalify/<id>')
@big_sherif_api.get('/api/criticality_transcode/<id>')
@big_sherif_api.get('/api/userlist/<id>')
@big_sherif_api.get('/api/grouplist/<id>')
@big_sherif_api.get('/api/cartography/<id>')
def get_doc(id):
    # if request["auth"] == False:
        # abort(401, "Access denied")
    list_name = request.path.split("/")[-2]
    if list_name == "currenteventshistory":
        list_name = "currentevents"
    db_name = list_name
    base_query = database_address + "/big_sherif_" + db_name + "/" + id
#    print base_query
    doc_content = requests.get(base_query, proxies=proxies)
    doc = simplejson.loads(doc_content.text)
    return simplejson.dumps(doc)

@big_sherif_api.get('/api/criticalitylist/<id>')
@big_sherif_api.get('/api/connectorlist/<id>')
def get_doc_config(id):
    # if request["auth"] == False:
        # abort(401, "Access denied")
    list_name = request.path.split("/")[-2]
    db_name = "config"
    if list_name == "criticalitylist":
        base_query = database_address + "/big_sherif_config/criticality"
        list = simplejson.loads(requests.get(base_query, proxies=proxies).text)
        return simplejson.dumps(list[id])
    if list_name == "connectorlist":
        base_query = database_address + "/big_sherif_config/connector_list"
        list = simplejson.loads(requests.get(base_query, proxies=proxies).text)
        return simplejson.dumps(list["connector_list"][id])


def insert_in_db(db_address, db_name, doc_id, doc_data):
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    if doc_id == None:
        r = requests.post(db_address+"/big_sherif_"+db_name+"/", data=simplejson.dumps(doc_data), headers=headers, proxies=proxies)
    else:
        r = requests.put(db_address+"/big_sherif_"+db_name+"/"+doc_id+"/", data=simplejson.dumps(doc_data), headers=headers, proxies=proxies)
    return r.json()

def delete_from_db(db_address, db_name, doc_id, rev):
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    r = requests.delete(db_address+"/big_sherif_"+db_name+"/"+doc_id+"?rev="+rev, headers=headers, proxies=proxies)
    return r.json()

#url avec ID pour l'edit
@big_sherif_api.put('/api/currentevents/<id>')
@big_sherif_api.put('/api/saved_filters/<id>')
@big_sherif_api.put('/api/currenteventshistory/<id>')
@big_sherif_api.put('/api/events/<id>')
@big_sherif_api.put('/api/hosts/<id>')
@big_sherif_api.put('/api/whitelist/<id>')
@big_sherif_api.put('/api/blacklist/<id>')
@big_sherif_api.put('/api/component_pool/<id>')
@big_sherif_api.put('/api/component_deduplicate/<id>')
@big_sherif_api.put('/api/duplicate_entry/<id>')
@big_sherif_api.put('/api/criticality_requalify/<id>')
@big_sherif_api.put('/api/criticality_transcode/<id>')
@big_sherif_api.put('/api/userlist/<id>')
@big_sherif_api.put('/api/grouplist/<id>')
@big_sherif_api.put('/api/cartography/<id>')
#url sans ID pour l'ajout
@big_sherif_api.post('/api/currentevents')
@big_sherif_api.post('/api/saved_filters')
@big_sherif_api.post('/api/currenteventshistory')
@big_sherif_api.post('/api/events')
@big_sherif_api.post('/api/hosts')
@big_sherif_api.post('/api/whitelist')
@big_sherif_api.post('/api/blacklist')
@big_sherif_api.post('/api/component_pool')
@big_sherif_api.post('/api/component_deduplicate')
@big_sherif_api.post('/api/duplicate_entry')
@big_sherif_api.post('/api/criticality_requalify')
@big_sherif_api.post('/api/criticality_transcode')
@big_sherif_api.post('/api/userlist')
@big_sherif_api.post('/api/grouplist')
@big_sherif_api.post('/api/unmanaged')
@big_sherif_api.post('/api/cartography')
def put_doc(id=None):
    # if request["auth"] == False:
        # abort(401, "Access denied")
    #update event
    cookie = simplejson.loads(unquote(request.get_cookie("big_sherif_session")))
    if id is not None:
        list_name = request.path.split("/")[-2]
    else:
        list_name = request.path.split("/")[-1]
    new_doc = request.json
    #print "list_name = "+list_name
    #print "id = "+str(id)
    if list_name == "currenteventshistory":
        list_name = "currentevents"
    db_name = list_name
    if id is not None:
        #print "edition"
        base_query = database_address + "/big_sherif_" + db_name + "/" + id
        doc_content = requests.get(base_query, proxies=proxies)
        doc = simplejson.loads(doc_content.text)
        if "error" not in doc:
            new_doc["_rev"] = doc["_rev"]
    else:
        print "addition"
    if db_name == 'saved_filters':
        new_doc["username"] = cookie["username"]
    new_doc = insert_in_db(database_address, db_name, id, new_doc)
    #print new_doc
    return simplejson.dumps(new_doc)

@big_sherif_api.put('/api/criticalitylist/<id>')
@big_sherif_api.put('/api/connectorlist/<id>')
@big_sherif_api.post('/api/criticalitylist')
@big_sherif_api.post('/api/connectorlist')
def put_doc_config(id=None):
    # if request["auth"] == False:
        # abort(401, "Access denied")
    list_name = request.path.split("/")[-2]
    db_name = "config"
    new_doc = request.json
    if id is None:
        id = new_doc["_id"]
    if list_name == "criticalitylist":
        base_query = database_address + "/big_sherif_config/criticality"
        list = simplejson.loads(requests.get(base_query, proxies=proxies).text)
        list[id] = new_doc
        insert_in_db(database_address, db_name, "criticality", list)
        return simplejson.dumps(list[id])
    if list_name == "connectorlist":
        base_query = database_address + "/big_sherif_config/connector_list"
        list = simplejson.loads(requests.get(base_query, proxies=proxies).text)
        list["connector_list"][id] = new_doc
	list["ihm"] = 1
        insert_in_db(database_address, db_name, "connector_list", list)
        return simplejson.dumps(list["connector_list"][id])


#url avec ID pour l'edit
@big_sherif_api.delete('/api/currentevents/<id>')
@big_sherif_api.delete('/api/unmanaged/<id>')
@big_sherif_api.delete('/api/saved_filters/<id>')
@big_sherif_api.delete('/api/currenteventshistory/<id>')
@big_sherif_api.delete('/api/events/<id>')
@big_sherif_api.delete('/api/hosts/<id>')
@big_sherif_api.delete('/api/whitelist/<id>')
@big_sherif_api.delete('/api/blacklist/<id>')
@big_sherif_api.delete('/api/component_pool/<id>')
@big_sherif_api.delete('/api/component_deduplicate/<id>')
@big_sherif_api.delete('/api/duplicate_entry/<id>')
@big_sherif_api.delete('/api/criticality_requalify/<id>')
@big_sherif_api.delete('/api/criticality_transcode/<id>')
@big_sherif_api.delete('/api/userlist/<id>')
@big_sherif_api.delete('/api/grouplist/<id>')
@big_sherif_api.delete('/api/cartography/<id>')
def delete_doc(id):
    list_name = request.path.split("/")[-2]
    #print "list_name = "+list_name
    #print "id = "+str(id)
    if list_name == "currenteventshistory":
        list_name = "currentevents"
    db_name = list_name    
    base_query = database_address + "/big_sherif_" + db_name + "/" + id
    doc_content = requests.get(base_query, proxies=proxies)
    doc = simplejson.loads(doc_content.text)
    response = delete_from_db(database_address, db_name, id, doc["_rev"])
    #print response
    return simplejson.dumps(response)

@big_sherif_api.delete('/api/criticalitylist/<id>')
@big_sherif_api.delete('/api/connectorlist/<id>')
def delete_doc_config(id):
    # if request["auth"] == False:
        # abort(401, "Access denied")
    list_name = request.path.split("/")[-2]
    db_name = "config"
    if list_name == "criticalitylist":
        base_query = database_address + "/big_sherif_config/criticality"
        list = simplejson.loads(requests.get(base_query, proxies=proxies).text)
        del list[id]
        insert_in_db(database_address, db_name, "criticality", list)
    if list_name == "connectorlist":
        base_query = database_address + "/big_sherif_config/connector_list"
        list = simplejson.loads(requests.get(base_query, proxies=proxies).text)
        list["connector_list"].pop(id, None)
	list["ihm"] = 1
        insert_in_db(database_address, db_name, "connector_list", list)
    return simplejson.dumps({"id": id, "deleted": True })

@big_sherif_api.post('/api/declare_ticket')
def declare_ticket():

    intitule_incident = request.POST.get('intitule_incident')
    event_id = request.POST.get('event_id')

    type_action = request.POST.get('type_action')
    organisation_emettrice = request.POST.get('organisation_emettrice')
    nos_references = request.POST.get('nos_references')
    vos_references = request.POST.get('vos_references')
    date_heure_action = request.POST.get('date_heure_action')
    code_refpat = request.POST.get('code_refpat')
    nom_inventeur = request.POST.get('nom_inventeur')
    nom_signaleur = request.POST.get('nom_signaleur')
    telephone_inventeur = request.POST.get('telephone_inventeur')
    telephone_signaleur = request.POST.get('telephone_signaleur')
    pk_debut = request.POST.get('pk_debut')
    pk_fin = request.POST.get('pk_fin')
    libelle_lieu = request.POST.get('libelle_lieu')
    code_file = request.POST.get('code_file')
    description_equipement = request.POST.get('description_equipement')
    code_ees_sagai = request.POST.get('code_ees_sagai')
    num_ees_equipement = request.POST.get('num_ees_equipement')
    code_gmao = request.POST.get('code_gmao')
    description_anomalie = intitule_incident+' : '+request.POST.get('description_anomalie')
    code_anomalie = request.POST.get('code_anomalie')
    situation_inacceptable = request.POST.get('situation_inacceptable')
    critere_nettete = request.POST.get('critere_nettete')
    equipement_sensible = request.POST.get('equipement_sensible')
    zone_critique = request.POST.get('zone_critique')
    destinataire_depeche = request.POST.get('destinataire_depeche')
    num_equipe_dediee = request.POST.get('num_equipe_dediee')
    niveau_urgence = request.POST.get('niveau_urgence')
    etat_equipement = request.POST.get('etat_equipement')
    delai_resolution = request.POST.get('delai_resolution')
    commentaire = request.POST.get('commentaire')
    journal_supervision = request.POST.get('journal_supervision')
    url_document_associe = request.POST.get('url_document_associe')
    copie_pour_info = request.POST.get('copie_pour_info')
    commentaire_lieu = request.POST.get('commentaire_lieu')
    code_reparation = request.POST.get('code_reparation')
    version = request.POST.get('version')

    doc_content = requests.get(database_address+"/big_sherif_currentevents/"+event_id, proxies=proxies)

    doc_data = doc_content.json()

    doc_data['ticket'] = nos_references
    doc_data['comments'].append({
        "username": "admin",
        "first_name": "john",
        "last_name": "Doe",
        "text": "Declaration d'incident : "+description_anomalie+" Commentaire : "+commentaire,
        "timestamp": time.mktime(datetime.datetime.now().timetuple())*1000,
        })

    insert_in_db(database_address, 'currentevents', event_id, doc_data)

    msg = MIMEText(version+'|'+type_action+'|'+organisation_emettrice+'|'+nos_references+'|'+vos_references+'|'+date_heure_action+'|'+nom_inventeur+'|'+telephone_inventeur+'|'+nom_signaleur+'|'+telephone_signaleur+'|'+code_refpat+'|'+pk_debut+'|'+pk_fin+'|'+libelle_lieu+'|'+code_file+'|'+description_equipement+'|'+code_ees_sagai+'|'+num_ees_equipement+'|'+code_gmao+'|'+description_anomalie+'|'+code_anomalie+'|'+situation_inacceptable+'|'+critere_nettete+'|'+equipement_sensible+'|'+zone_critique+'|'+destinataire_depeche+'|'+num_equipe_dediee+'|'+niveau_urgence+'|'+etat_equipement+'|'+delai_resolution+'|'+commentaire+'|'+journal_supervision+'|'+url_document_associe+'|'+copie_pour_info+'|'+commentaire_lieu+'|'+code_reparation)

    msg['Subject'] = 'OHM Delcare Ticket'
    msg['From'] = 'cega@free.fr'
    msg['To'] = 'gatume.c@gmail.com'
    
    s = smtplib.SMTP('smtp.sfr.fr')
    s.sendmail('cega@free.fr', ['gatume.c@gmail.com'], msg.as_string())
    s.quit()

    return dict(succes=True, desc='Ticket correctly send to OSS')

@big_sherif_api.get('/api/get_ticket/<id:path>')
def get_ticket(id):
    depeche_content = {}

    depeche_content['depeche_id'] = 'rien'
    depeche_content['depeche_component'] = 42
    depeche_content['depeche_open_date'] = 'journal_supervision'
    depeche_content['depeche_close_date'] = 'you'
    return simplejson.dumps(depeche_content)

# @@big_sherif_api.post('/api/currentevents/<id>/comment')
# def post_currentevents_comment(id):
    # if request["auth"] == False:
        # abort(401, "Access denied")
    # list_name = request.path.split("/")[-2]
    # print list_name
    # print id
    # if list_name == "currenteventshistory":
        # list_name = "currentevents"
    # db_name = list_name
    # base_query = database_address + "/big_sherif_" + db_name + "/" + id
    # doc_content = requests.get(base_query, proxies=proxies)
    # doc = simplejson.loads(doc_content.text)
    # return simplejson.dumps(doc)
    
#API LISTS ROUTES

def do_filter(filter_list, row):
    for filter in filter_list:
        for value in row["doc"].values():
            if type(value) is unicode:
                if filter.upper() in value.upper():
                    return True
    return False

@big_sherif_api.get('/api/currentevents')
@big_sherif_api.get('/api/saved_filters')
@big_sherif_api.get('/api/currenteventshost')
@big_sherif_api.get('/api/currenteventshistory')
@big_sherif_api.get('/api/events')
@big_sherif_api.get('/api/unmanaged')
@big_sherif_api.get('/api/hosts')
@big_sherif_api.get('/api/whitelist')
@big_sherif_api.get('/api/blacklist')
@big_sherif_api.get('/api/component_pool')
@big_sherif_api.get('/api/component_deduplicate')
@big_sherif_api.get('/api/duplicate_entry')
@big_sherif_api.get('/api/criticality_requalify')
@big_sherif_api.get('/api/criticality_transcode')
@big_sherif_api.get('/api/userlist')
@big_sherif_api.get('/api/grouplist')
#@big_sherif_api.get('/api/cartography')
def get_lists():
    # if request["auth"] == False:
        # abort(401, "Access denied")
    db_name = request.path.split("/")[-1]
    cookie = simplejson.loads(unquote(request.get_cookie("big_sherif_session")))

    elastic_sort = []
    for el in request.query.get("sorting", "_id").split(','):
	elastic_sort.append({el: request.query.get("order")})
    elastic_query = {
        "query":
            {"bool":
                {"must":[{"match_all":{}}],
                "must_not":[],
                "should":[]}
            },
        "from":int(request.query.get("from", 0)),
        "size": int(request.query.get("limit", 20)),
        "sort": elastic_sort,
        "facets":{}
    }
    if request.query.get("sorting", "_id") == "pool_perimetre" or request.query.get("sorting", "_id") == "pool_domaine":
        print "redo sort"
        elastic_query["sort"][0] = {
            "pool.pool_name": {
                "order": request.query.get("order"),
                "nested_path": "pool",
                "nested_filter": {
                    "term": {
                        "pool.pool_type_name": "Domaine" if request.query.get("sorting").split("_")[-1] == "domaine" else "Périmètre".decode('cp1252')
                    }
                }
            }
        }
    
    must_not = []
    must = []
    daterange = {}
    if db_name == "currentevents":
       must.append({"term":{ "big_sherif_currentevents.in_whitelist": 1}})
       must.append({"term":{ "big_sherif_currentevents.is_history": 0}})
       must_not.append({"term":{"big_sherif_currentevents.criticality": 0}})
       if "admin" not in cookie["profile"]["groups"]:
           must.append({
               "query_string": {
                    "default_field": "big_sherif_"+db_name+".pool.pool_name",
                    "query": " ".join(cookie["profile"]["pools"])
                }
           })
       
    if db_name == "currenteventshost":
       db_name = "currentevents"
       must.append({"term":{ "big_sherif_currentevents.in_whitelist": 1}})
       must.append({"term":{ "big_sherif_currentevents.is_history": 0}})
       if "admin" not in cookie["profile"]["groups"]:
           must.append({
               "query_string": {
                    "default_field": "big_sherif_"+db_name+".pool.pool_name",
                    "query": " ".join(cookie["profile"]["pools"])
                }
           })

    if db_name == "cartography":
       if "admin" not in cookie["profile"]["groups"]:
           must.append({
               "query_string": {
                    "default_field": "big_sherif_"+db_name+".global.pool.pool_name",
                    "query": " ".join(cookie["profile"]["pools"])
                }
           })


    if db_name == "events":
       if "admin" not in cookie["profile"]["groups"]:
           must.append({
               "query_string": {
                    "default_field": "big_sherif_"+db_name+".pool.pool_name",
                    "query": " ".join(cookie["profile"]["pools"])
                }
           })



    if db_name == "currenteventshistory":
       must.append({"term":{ "big_sherif_currentevents.in_whitelist": 1}})
       db_name = "currentevents"
       if "admin" not in cookie["profile"]["groups"]:
           must.append({
               "query_string": {
                    "default_field": "big_sherif_"+db_name+".pool.pool_name",
                    "query": " ".join(cookie["profile"]["pools"])
                }
            })
 
    if db_name == "saved_filters":
        must.append({"term":{"big_sherif_saved_filters.username" : cookie["username"]}})

    if (request.query.get("filters")):
        query_filters =  simplejson.loads(request.query.get("filters"))
    else:
        query_filters = {}
   # print "filters:"
   # pprint(query_filters)
    if len(query_filters.keys()) > 0:
        for field in query_filters.keys():
            if field == "timestamp_start_gt":
                daterange['gt'] = query_filters[field]
            else:
                if field == "timestamp_start_lt":
                    daterange['lt'] = query_filters[field]
                else:
                    if type(query_filters[field]) is not list:
                        must.append({
                            "query_string": {
                            "default_field": "big_sherif_"+db_name+"."+field if field != "" else "_all",
                            "query": string.replace(query_filters[field], '-', " AND ")
#                            "query": query_filters[field]
                        }
                    })
                    else:
                        must.append({
                            "query_string": {
                                "default_field": "big_sherif_"+db_name+"."+field if field != "" else "_all",
                                "query": " AND ".join([string.replace(str(el), '-', " AND ") for el in query_filters[field]])
                #                "query": " AND ".join([str(el) for el in query_filters[field]])
                            }
                        })
#    pprint(must);
#    pprint(daterange);
    if daterange != {}:
        must.append({ "range" : { "timestamp_start" : 
            daterange  } })
    if must != []:
        elastic_query["query"]["bool"]["must"] = must
    if must_not != []:
        elastic_query["query"]["bool"]["must_not"] = must_not
#    print "dbname : " + db_name + " | eq : "
#    pprint(elastic_query)
    url = elasticsearch_address+"/big_sherif_"+db_name+"/_search"
    data = simplejson.dumps(elastic_query)
    #print "url:"
    #print url
    #print "data:"
    #print data
    view_content = requests.get(url, data=data, proxies=proxies)
    view_content_object = simplejson.loads(view_content.text)
    #print view_content.text
    if "hits" in view_content_object:
        return simplejson.dumps(view_content_object["hits"]["hits"])
    else:
        return simplejson.dumps([])

def old_get_lists():
    # if request["auth"] == False:
        # abort(401, "Access denied")
    query_string = ""
    temp = []
    for key, value in request.query.iteritems():
        temp.append(key+"="+value)
    query_string = "&".join(temp)
    print query_string
    list_name = request.path.split("/")[-1]
    view_name = request.query.get("sorting")
    if list_name == "currenteventshistory":
        list_name = "currentevents"
        view_name = view_name + "_history"
    db_name = list_name
    base_query = database_address+"/big_sherif_"+db_name+"/_design/"+list_name+"/_view/"+view_name+"?"+query_string
    print "base_query:"
    print base_query
    view_content = requests.get(base_query, proxies=proxies)
    view_content_object = simplejson.loads(view_content.text)
    if"rows" in view_content_object:
        return simplejson.dumps(view_content_object["rows"])
    else:
        return simplejson.dumps([])

@big_sherif_api.get('/api/criticalitylist')
@big_sherif_api.get('/api/connectorlist')
def get_config_lists():
    # if request["auth"] == False:
        # abort(401, "Access denied")
    query_string = ""
    temp = []
    for key, value in request.query.iteritems():
        temp.append(key+"="+value)
    query_string = "&".join(temp)
    list_name = request.path.split("/")[-1]
    view_name = request.query.get("sorting")
    base_query = database_address+"/big_sherif_config/_design/"+list_name+"/_view/"+view_name+"?"+query_string
    print "base_query:"
    print base_query
    view_content = requests.get(base_query, proxies=proxies)
    view_content_object = simplejson.loads(view_content.text)
    results = []
    if"rows" in view_content_object:
        for row in view_content_object["rows"]:
            results.append({"id": row["value"]["_id"], "key": row["key"], "doc":row["value"]})
        return simplejson.dumps(results)
    else:
        return simplejson.dumps([])

# AUTH

def validAuth(username,password, challenge):
    if not username or not password:
        return False
    if not db_users[username]:
        return False
    userPassword = db_users[username]["password"]
    if not password.lower() == hashlib.sha1(challenge + userPassword).hexdigest().lower():
        return False
    return True

@big_sherif_api.get('/api/auth')
def get_challenge():
    if not request.session.has_key("challenge"):
        request.session["challenge"] = ''.join(random.choice(string.ascii_uppercase + string.digits) for x in range(15))
        request.session.save()
    return simplejson.dumps({"challenge" : request.session.get("challenge"), "session_id" : request.session.id})

@big_sherif_api.post('/api/auth/login')
def do_login():
    username = request.forms.get('username')
    password = request.forms.get('password')
    cookie = simplejson.loads(unquote(request.get_cookie("big_sherif_session")))
    if "challenge" not in cookie:
        print "no session ?! WTF"
        abort(500, "how come you have no session?")
    if not validAuth(username,password, request.session["challenge"]):
        cookie["isLogedIn"] = False
        response.set_cookie("big_sherif_session", quote(simplejson.dumps(cookie)), path="/")
        return '{"isLogedIn" : false}'
    cookie["isLogedIn"] = True
    response.set_cookie("big_sherif_session", quote(simplejson.dumps(cookie)), path="/")
    profile = db_users[username]
    groups = []
    pools = []
    for group in profile["groups"]:
        groups.append(db_groups[group]["groupname"])
        for pool in db_groups[group]["pool"]:
          pools.append(database_server["big_sherif_component_pool"][pool]["pool_name"])
    return simplejson.dumps({
        "first_name": profile["first_name"],
        "last_name": profile["last_name"],
        "email": profile["email"],
        "groups": groups,
        "pools": pools
    })

@big_sherif_api.get('/api/hosts/<part>/list')
def get_hostslist(part):
    base_query = database_address+'/big_sherif_hosts/_design/hosts/_view/_id'
    doc_content = requests.get(base_query, proxies=proxies)
    view_results = simplejson.loads(doc_content.text)
    hostlist = view_results["rows"]
    toremove = []
    i = 0
    while i < len(hostlist):
	if hostlist[i]["id"].lower().find(part.lower()) == -1:
            toremove.append(i)
        else:
            hostlist[i]["value"] = hostlist[i]["id"]
            hostlist[i]["label"] = hostlist[i]["id"]
        i += 1
    for index in toremove[::-1]:
        hostlist.pop(index)
    return simplejson.dumps(hostlist)

@big_sherif_api.get('/api/pools/<part>/list')
def get_poollist(part):
    base_query = database_address+'/big_sherif_component_pool/_design/component_pool/_view/poollist'
    doc_content = requests.get(base_query, proxies=proxies)
    view_results = simplejson.loads(doc_content.text)
    poollist = view_results["rows"]
    toremove = []
    i = 0
    while i < len(poollist):
	if poollist[i]["key"].lower().find(part.lower()) == -1:
            toremove.append(i)
        else:
            poollist[i]["value"] = poollist[i]["key"]
            poollist[i]["label"] = poollist[i]["key"]
        i += 1
    for index in toremove[::-1]:
        poollist.pop(index)
    return simplejson.dumps(poollist)

@big_sherif_api.get('/api/maps/<part>/list')
def get_maplist(part):
    base_query = database_address+'/big_sherif_cartography/_all_docs'
    doc_content = requests.get(base_query, proxies=proxies)
    view_results = simplejson.loads(doc_content.text)
    cartographylist = view_results["rows"]
    toremove = []
    i = 0
    while i < len(cartographylist):
	if cartographylist[i]["id"].lower().find(part.lower()) == -1:
            toremove.append(i)
        else:
            cartographylist[i]["value"] = cartographylist[i]["id"]
            cartographylist[i]["label"] = cartographylist[i]["id"]
        i += 1
    for index in toremove[::-1]:
        cartographylist.pop(index)
    return simplejson.dumps(cartographylist)

@big_sherif_api.get('/api/connectors/<part>/list')
def get_connectorslist(part):
    base_query = database_address+'/big_sherif_config/connector_list'
    doc_content = requests.get(base_query, proxies=proxies)
    view_results = simplejson.loads(doc_content.text)
    connectorlist = view_results["connector_list"]
    toreturn = []
    i = 0
    clist = connectorlist.keys()
    while i < len(connectorlist):
	if clist[i].lower().find(part.lower()) != -1:
            toreturn.append({'id' : clist[i], "value": clist[i], "label": clist[i]})
        i += 1
    return simplejson.dumps(toreturn)

@big_sherif_api.get('/api/criticality/<part>/list')
def get_criticalitylist(part):
    base_query = database_address+'/big_sherif_config/_design/criticalitylist/_view/_id'
    doc_content = requests.get(base_query, proxies=proxies)
    view_results = simplejson.loads(doc_content.text)
    criticalitylist = view_results["rows"]
    toremove = []
    i = 0
    print criticalitylist
    while i < len(criticalitylist):
	if criticalitylist[i]["value"]["label"].lower().find(part.lower()) == -1:
            toremove.append(i)
        else:
            criticalitylist[i]["id"] = criticalitylist[i]["key"]
            criticalitylist[i]["label"] = criticalitylist[i]["value"]["label"]
            criticalitylist[i]["value"] = criticalitylist[i]["key"]
        i += 1
    for index in toremove[::-1]:
        criticalitylist.pop(index)
    return simplejson.dumps(criticalitylist)

@big_sherif_api.get('/api/resources/<host>/list/<part>')
def get_connectorslist(host, part=None):
    base_query = database_address+'/big_sherif_hosts/'+host
    doc_content = requests.get(base_query, proxies=proxies)
    view_results = simplejson.loads(doc_content.text)
    resourcelist = view_results["resource"]
    toreturn = []
    i = 0
    print resourcelist
    rlist = resourcelist.keys()
    while i < len(resourcelist):
	if (part == None) or (rlist[i].lower().find(part.lower()) != -1) :
            toreturn.append({'id' : rlist[i], "value": rlist[i], "label": rlist[i]})
        i += 1
    return simplejson.dumps(toreturn)

# STATUS CHECKS
@big_sherif_api.get('/api/hosts/<id>/status')
def host_status(id):
    db_name = "hosts"
    results = {
        "overallCriticality": 0,
        "overallWeight": 0,
        "hostname": id,
        "perResource": []
    }
    base_query = database_address + "/big_sherif_" + db_name + "/" + id
    doc_content = requests.get(base_query, proxies=proxies)
    doc = simplejson.loads(doc_content.text)
    if "error" in doc:
        print id
        print doc
        return doc
    for resource in doc["resource"]:
        base_query = database_address+'/big_sherif_currentevents/_design/currentevents/_view/current-hostname-resource?include_docs=true&key="'+id+'-'+resource+'"'
        doc_content = requests.get(base_query, proxies=proxies)
	print base_query
        view_results = simplejson.loads(doc_content.text)
        #print 'id : ', id
        #print 'view_results : ',view_results
        event = view_results["rows"][0]["doc"]
        if doc["resource"][resource]['weight'] > results["overallWeight"]:
                results["overallCriticality"] = doc["resource"][resource]['criticality']
                results["overallWeight"] = doc["resource"][resource]['weight']
#        if event["criticality"] > results["overallCriticality"]:
#            results["overallCriticality"] = event["criticality"]
        results["perResource"].append({
            "event": event["_id"],
            "criticality": event["criticality"],
            "state": event["state"],
            "resource": resource,
            "output": event["output"]
        })
    return results
    
@big_sherif_api.get('/api/component_pool/<id>/status')
def pool_status(id):
    db_name = "component_pool"
    results = {
        "overallCriticality": 0,
        "overallWeight": 0,
        "poolname": id,
        "perHost": []
    }
    base_query = database_address+'/big_sherif_hosts/_design/hosts/_view/pool?key="'+id+'"'
    doc_content = requests.get(base_query, proxies=proxies)
    view_results = simplejson.loads(doc_content.text)
    for row in view_results["rows"]:
        host_results = host_status(row["id"])
        if "error" in host_results:
            continue
        if host_results["overallWeight"] > results["overallWeight"]:
                results["overallWeight"] = host_results["overallWeight"]
                results["overallCriticality"] = host_results["overallCriticality"]
        results["perHost"].append(host_results)
    return results
    
    
    
# CARTOGRAPHY
db_cartography = database_server["big_sherif_cartography"]

@big_sherif_api.get('/api/cartography/<id>/status')
def cartography_status(id):
    carto = db_cartography[id]
    results = {
        "overallCriticality": 0,
        "cartographyname": id,
        "perHost": [],
        "perMap": []
    }
    for block in carto["blocks"]:
        if block[0] == "host":
            print "ici"
            host_results = host_status(block[1]["host_name"])
            if "error" in host_results:
                continue
            if host_results["overallCriticality"] > results["overallCriticality"]:
                results["overallCriticality"] = host_results["overallCriticality"]
            results["perHost"].append(host_results)
        if block[0] == "map":
            map_results = cartography_status(block[1]["map_name"])
            if map_results["overallCriticality"] > results["overallCriticality"]:
                results["overallCriticality"] = map_results["overallCriticality"]
            results["perMap"].append(map_results)
    return results
            

@big_sherif_api.get('/api/images/')
def get_image_list():
    matches = []
    for root, dirnames, filenames in os.walk('../web/images/cartography/'):
      for filename in filenames:
        matches.append({"value": os.path.join(root[6:], filename), "label": filename})
    return simplejson.dumps(matches)

@big_sherif_api.get('/api/images/<part>')
def get_image_list(part):
    matches = []
    for root, dirnames, filenames in os.walk('../web/images/cartography/'):
      for filename in filenames:
	if filename.find(part):
          matches.append({"value" : os.path.join(root[6:], filename), "label": filename})
    return simplejson.dumps(matches)

@big_sherif_api.get('/api/cartography')
def cartography_list():
    results = []
    for row in db_cartography.view('_all_docs'):
        results.append(row.id)
    return simplejson.dumps(results)

@big_sherif_api.post('/api/cartography/<id>.html')
@big_sherif_api.get('/api/cartography/<id>.html')
def cartography_html(id):
    return gen_cartography.generate_html(db_cartography[id]["blocks"])

def get_image_dimensions(image_filename):
    from PIL import Image
    im = Image.open(image_filename)
    width, height = im.size
    return {"width": width, "height": height}
    
def maps_list(map_name, blocks, parent=None, top=None, left=None):
    result = {}
    data = {}
    data["maps"] = []
    data["id"] = map_name
    data["data"] = "api/cartography/"+map_name+".html"
    for block in blocks:
        if block[0] == "global":
            data["id"] = map_name
            data["image"] = "images/cartography/"+block[1].get("map_image","faux")
            dimensions = get_image_dimensions("../web/images/cartography/"+block[1].get("map_image", "faux"))
#            dimensions = {'width': 1024, 'height': 768}
            if parent == None:
                result["id"] = data["id"]
                result["width"] = dimensions["width"]
                result["height"] = dimensions["height"]
            else:
                data["parent"] = parent
                data["width"] = dimensions["width"]
                data["height"] = dimensions["height"]
                data["top"] = top
                data["left"] = left
        if block[0] == "map":
            print "Going in a submap " + block[1]["map_name"]
            submap = db_cartography[block[1]["map_name"]]
            submap_object = maps_list(block[1]["map_name"], submap["blocks"], parent=map_name, top=block[1]["y"], left=block[1]["x"])
            data["maps"].append(submap_object)
    if parent == None:
        result["map"] = data
    else:
        result = data
    return result
    

# WEB PAGE HOSTING ROUTES
@big_sherif_api.get('/')
def web_app():
    return static_file("index.html", root="../web/")

@big_sherif_api.get('/<filepath:path>')
def web_app_statics(filepath):
    return static_file(filepath, root="../web/")

@big_sherif_api.hook('before_request')
def setup_request():
    print request.path+"?"+request.query_string
    request.session = request.environ['beaker.session']
    try:
        cookie = simplejson.loads(unquote(request.get_cookie("big_sherif_session")))
    except:
        return
    request["auth"] = False
    if "username" in cookie and "digest" in cookie and "challenge" in request.session:
        request["auth"] = validAuth(cookie["username"],cookie["digest"], request.session["challenge"])

from beaker.middleware import SessionMiddleware

session_opts = {
    'session.type': 'file',
    'session.cookie_expires': 30000000,
    'session.data_dir': './data',
    'session.auto': True
}

big_sherif_api_session = SessionMiddleware(big_sherif_api, session_opts)

run(app=big_sherif_api_session, host='0.0.0.0', port=8081, server='cherrypy')
