#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import requests
import schedmod
import setproctitle
import sys

class InsertEventClass(schedmod.SchedModClass):
	"Class to insert event in couch"

	def __init__(self, lockfile_path=None, lockfile_name=None, ConfObj=None):
		super(InsertEventClass, self).__init__(lockfile_path, lockfile_name, ConfObj)

	def launch(self):
		try:
			headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

			db_name = 'events'
			setproctitle.setproctitle(self.processname)

			data = self.ConfObj.r.hgetall('event_log')
			if data.keys() != []:
				self.ConfObj.r.hdel('event_log', *data.keys())
			bulk_data = {'docs': []}
			for key, value in data.items():
				value = json.loads(value)
				value['_id'] = key
				bulk_data['docs'].append(value)

			if bulk_data['docs'] != []:
				ret = requests.post(self.ConfObj.database_address+"/big_sherif_"+db_name+"/_bulk_docs", data=json.dumps(bulk_data), headers=headers, proxies=self.ConfObj.proxies)

		except:
			print "Insert events:", sys.exc_info()
			print ret.json()
			raise