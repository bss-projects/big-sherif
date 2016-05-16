#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import requests
from multiprocessing import Process, Queue

class InitnUpdateClass():

	def __init__(self, database_address, db_name, view_name, proxies, query_string=""):
		self.query_string = query_string
		self.database_address = database_address
		self.proxies = proxies
		self.db_name = db_name
		self.view_name = view_name
		self.d_db_ret = {}
		self.queue = Queue()

	def getView(self):
		self.viewContent = requests.get(self.database_address+"/big_sherif_"+self.db_name+"/_design/"+self.db_name+"/_view/"+self.view_name+"?"+self.query_string, proxies=self.proxies)
		return self.viewContent

	def getLastseq(self):
		return self.lastSeq

	def initStream(self):
		r = requests.get(self.database_address+"/big_sherif_"+self.db_name+"/_changes", proxies=self.proxies)
		self.lastSeq = r.json()['last_seq']

		self.stream = requests.get(self.database_address+"/big_sherif_"+self.db_name+"/_changes?feed=continuous&heartbeat=10&since="+str(self.lastSeq), stream=True, proxies=self.proxies)
		return self.stream

	def getDict(self):
		d_db_ret = {}

		self.getView()

		for row in self.viewContent.json()['rows']:
			if self.query_string != "":
				d_db_ret[row['key']] = row['doc']
			else:
				if self.db_name == 'criticality_transcode' or self.db_name == 'criticality_requalify':
					d_db_ret[row['key']] = {self.db_name: row['value'][self.db_name],
													'weight': row['value']['weight']}
				else:
					d_db_ret[row['key']] = row['value']

		if d_db_ret != {}:
			self.d_db_ret = d_db_ret

		return self.d_db_ret

	def continuousUpdate(self):
		for line in self.stream.iter_lines():
			if line:
				d_db_update = {}

				d_db_update = self.getDict()

				if d_db_update != {}:
					self.queue.put(d_db_update)

	def startContinuousUpdate(self):
		self.process = Process(target=self.continuousUpdate, args=())
		self.process.start()

'''
init_poolforcheck_dict
query string vide
récup de la view ok
les infos sont reprise de la view telles quelles

init_connectorlist_dict
query string vide
récup de la view ok
les infos sont reprise de la view telles quelles

init_duplicate_component_dict
query string vide
récup de la view ok
les infos sont reprise de la view telles quelles

init_component_deduplicate_dict
query_string = "include_docs=true"
récup de la view ok
les infos viennent du doc et ne sont pas toutes reprises

init_criticality_dict
query string vide
recup de la view ok
tableau spécial car les clés ne sont pas identiques à ce qu'il y a en base
db_name
weight

==> Pas besoin de mettre en update continu, mais il faut que l'insert passe par le REDIS (cf. plus bas)
init_connectorlist_doc_dict
pas de query string
récup view non conforme
récup juste d'un doc


Mettre en redis les unmanage et le connectorlist_doc_dict
'''