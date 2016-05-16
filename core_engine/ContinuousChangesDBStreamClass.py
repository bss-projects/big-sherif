#!/usr/bin/env python
# -*- coding: utf-8 -*-

###
# Specific for web (flag IHM) catch insert event which insert to engine
###

import configclass
import json
import requests
from multiprocessing import Process, Queue

class ContinuousChangesDBStreamClass(object):

	def __init__(self, dbname, channel=None, hname=None):
		self.dbname = dbname
		self.channel = channel
		self.hname = hname
		self.Conf = configclass.ConfObjClass('BigSherif.cfg', 'BigSherif_configcheck.cfg')
		r = requests.get(self.Conf.database_address+"/big_sherif_"+self.dbname+"/_changes", proxies=self.Conf.proxies)
		self.last_seq = r.json()['last_seq']
		self.stream = requests.get(self.Conf.database_address+"/big_sherif_"+self.dbname+"/_changes?feed=continuous&heartbeat=10&include_docs=true&since="+str(self.last_seq), stream=True)

	def readContinuous_stream(self):
		for line in self.stream.iter_lines():
			if line:
				change_info = json.loads(line)
				if 'ihm' in change_info['doc']:
					key = change_info['doc']['_id']
					rev = change_info['doc'].pop('_rev')
					change_info['doc'].pop('ihm')
					value = change_info['doc']
					message = {key: value}
					self.Conf.r.hset(self.hname+'_rev', key, rev)
					self.Conf.r.publish(self.channel, message)

	def startProcess(self):
		thirdProcess = Process(target=self.readContinuous_stream, args=())
		thirdProcess.start()