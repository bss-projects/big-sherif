#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import logging
import requests
import schedmod
import setproctitle
import sys

class InsertHostClass(schedmod.SchedModClass):
	"Class to insert host change in couch"

	def __init__(self, lockfile_path=None, lockfile_name=None, ConfObj=None):
		super(InsertHostClass, self).__init__(lockfile_path, lockfile_name, ConfObj)
		self.logger = logging.getLogger('core_scheduler.InsertHostClass')
		self.logger.info('INIT : InsertHostClass')

	def launch(self):
		try:
			headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

			db_name = 'hosts'
			setproctitle.setproctitle(self.processname)

			d_change = self.ConfObj.r.hgetall(db_name+'_change')
			bulk_data = {'docs': []}
			hosts_rev = self.ConfObj.r.hgetall('hosts_rev')

			for id in d_change.iterkeys():
				self.ConfObj.r.hdel(db_name+'_change', id)
				value = self.ConfObj.r.hget(db_name, id)
				value = json.loads(value)
				value['_id'] = id
				if id in hosts_rev:
					value['_rev'] =  hosts_rev[id]
				bulk_data['docs'].append(value)

			if bulk_data['docs'] != []:
				ret = requests.post(self.ConfObj.database_address+"/big_sherif_"+db_name+"/_bulk_docs", data=json.dumps(bulk_data), headers=headers, proxies=self.ConfObj.proxies)

				for rrow in ret.json():
					self.ConfObj.r.hset(db_name+'_rev', rrow['id'], rrow['rev'])
		except Exception, e:
			self.logger.exception(e)
			self.logger.critical('Insert hosts: %s', sys.exc_info())
			self.logger.critical(value)
			self.logger.critical(ret.json())
			self.logger.critical(bulk_data)
			self.logger.warning(self.ConfObj.database_address+"/big_sherif_"+db_name+"/_bulk_docs")
			self.logger.warning(type(self.ConfObj.database_address+"/big_sherif_"+db_name+"/_bulk_docs"))

#			print "Insert hosts:", sys.exc_info()
#			print ret.json()
#			raise