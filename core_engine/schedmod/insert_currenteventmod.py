#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import logging
import requests
import schedmod
import setproctitle
import sys

class InsertCurrenteventClass(schedmod.SchedModClass):
	"Class to insert current_event in couch"

	def __init__(self, lockfile_path=None, lockfile_name=None, ConfObj=None):
		super(InsertCurrenteventClass, self).__init__(lockfile_path, lockfile_name, ConfObj)
		self.logger = logging.getLogger('core_scheduler.InsertCurrenteventClass')
		self.logger.info('INIT : InsertCurrenteventClass')

	def launch(self):
		try:
			headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

			db_name = 'currentevents'
			setproctitle.setproctitle(self.processname)

			l_id_current_events = []
			data = self.ConfObj.r.hgetall('events')
#			current_events = self.ConfObj.r.hgetall('current_events_change')
#			l_id_current_events = current_events.values()
			if data.keys() != []:
				self.ConfObj.r.hdel('events', *data.keys())
#				if current_events.keys() != []:
#					self.ConfObj.r.hdel('current_events_change', *current_events.keys())
			
			bulk_data = {'docs': []}
			events_rev = self.ConfObj.r.hgetall('events_rev')

			for key, value in data.items():
				value = json.loads(value)
				value['_id'] = key
				event_state_org = value.pop('event_state_org')
				if event_state_org == 'new':
					l_id_current_events.append(key)
				if key in events_rev:
					self.ConfObj.r.hdel('events_rev', key)
					value['_rev'] =  events_rev[key]
				bulk_data['docs'].append(value)

			if bulk_data['docs'] != []:
				ret = requests.post(self.ConfObj.database_address+"/big_sherif_"+db_name+"/_bulk_docs", data=json.dumps(bulk_data), headers=headers, proxies=self.ConfObj.proxies)

				print '***************************BEGIN**************************'

				for rrow in ret.json():
					if rrow['id'] in l_id_current_events and 'error' not in rrow:
						print '--->',rrow
						self.ConfObj.r.hset('events_rev', rrow['id'], rrow['rev'])
					elif 'error' in rrow:
						self.logger.warning(rrow)
						self.logger.warning(bulk_data)
						print '---',rrow,'---' 
						print bulk_data
					else:
						print '<<<---',rrow
				print '***************************END**************************'

		except Exception, e:
			self.logger.exception(e)
			self.logger.critical('Insert currentevents: %s', sys.exc_info())
			self.logger.critical(value)
			self.logger.critical(ret.json())
			self.logger.critical(bulk_data)
			self.logger.warning(self.ConfObj.database_address+"/big_sherif_"+db_name+"/_bulk_docs")
			self.logger.warning(type(self.ConfObj.database_address+"/big_sherif_"+db_name+"/_bulk_docs"))
#			print "Insert currentevents:", sys.exc_info()
#			print value
#			print ret.json()
#			raise