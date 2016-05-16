#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import logging
import requests
import schedmod
import setproctitle
import sys

class HistoryRecoverClass(schedmod.SchedModClass):
	"Class for garbage collector Recover to put it in history"

	def __init__(self, lockfile_path=None, lockfile_name=None, ConfObj=None):
		super(HistoryRecoverClass, self).__init__(lockfile_path, lockfile_name, ConfObj)
		self.logger = logging.getLogger('core_scheduler.HistoryRecoverClass')
		self.logger.info('INIT : HistoryRecoverClass')

	def init_dict_from_couch(self):
		d_db_data = {}

		query_string = "include_docs=true"

		view_content = requests.get(self.ConfObj.database_address+"/big_sherif_"+self.db_name+"/_design/"+self.db_name+"/_view/"+self.view_name+"?"+query_string, proxies=self.ConfObj.proxies)

		for row in view_content.json()['rows']:
			d_db_data[row['key']] = row['doc']

		return d_db_data

	def launch(self):
		try:
			headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

			self.db_name = 'currentevents'
			self.view_name = 'recover_not_history'
			d_db_data = self.init_dict_from_couch()
			setproctitle.setproctitle(self.processname)

			bulk_data = {'docs': []}

			for key, value in d_db_data.items():
				value['is_history'] = 1
				bulk_data['docs'].append(value)

			if bulk_data['docs'] != []:
				ret = requests.post(self.ConfObj.database_address+"/big_sherif_"+self.db_name+"/_bulk_docs", data=json.dumps(bulk_data), headers=headers, proxies=self.ConfObj.proxies)

		except Exception, e:
			self.logger.exception(e)
			self.logger.critical('Insert connector_doc: %s', sys.exc_info())
			self.logger.critical(ret.json())
			self.logger.critical(bulk_data)