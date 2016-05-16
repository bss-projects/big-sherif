#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import requests
import schedmod
import setproctitle
import sys

class InsertConnectorClass(schedmod.SchedModClass):
	"Class to insert change for connector doc info in couch"

	def __init__(self, lockfile_path=None, lockfile_name=None, ConfObj=None):
		super(InsertConnectorClass, self).__init__(lockfile_path, lockfile_name, ConfObj)

	def launch(self):
		try:
			headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

			db_name = 'config'
			setproctitle.setproctitle(self.processname)

			d_change = self.ConfObj.r.hgetall('connector_doc_change')
			bulk_data = {'docs': []}
			connector_doc_rev = self.ConfObj.r.hgetall('connector_doc_rev')

			for id in d_change.iterkeys():
				self.ConfObj.r.hdel('connector_doc_change', id)
				value = self.ConfObj.r.hget('connector_doc', id)
				value = json.loads(value)
				value['_id'] = id
				if id in connector_doc_rev:
					value['_rev'] =  connector_doc_rev[id]
				bulk_data['docs'].append(value)

			if bulk_data['docs'] != []:
				ret = requests.post(self.ConfObj.database_address+"/big_sherif_"+db_name+"/_bulk_docs", data=json.dumps(bulk_data), headers=headers, proxies=self.ConfObj.proxies)

				for rrow in ret.json():
					self.ConfObj.r.hset('connector_doc_rev', rrow['id'], rrow['rev'])
		except:
			print "Insert connector_doc:", sys.exc_info()
			print bulk_data
			print ret.json()
#			raise