#!/usr/bin/python
# -*- coding: utf-8 -*-

import ast
import json
from multiprocessing import Process, Queue

class InitnUpdateFromRedisClass():

	def __init__(self, redis_instance, hname, channel_name, core_sender):
		self.hname = hname
		self.channelName = channel_name
		self.rc = redis_instance
		self.core_sender = core_sender
		self.d_dbr_ret = {}
		self.queue = Queue()

	def getRDict(self):
		d_dbr_ret = {}

		temp_dic = self.rc.hgetall(self.hname)

		for key, value in temp_dic.items():
			d_dbr_ret[key] = json.loads(value)

		if d_dbr_ret != {}:
			self.d_dbr_ret = d_dbr_ret

		return self.d_dbr_ret

	def initRStream(self):
		self.redisChannel = self.rc.pubsub()
		self.redisChannel.subscribe([self.channelName])

	def continuousRUpdate(self):

		for item in self.redisChannel.listen():
			if item['type'] == 'message':
				d_data_update = {}

				event = ast.literal_eval(item['data'])
				key, value = event.keys()[0], event.values()[0]

				d_data_update[key] = value

				if d_data_update != {} and value['core_sender'] != self.core_sender:
					self.queue.put(d_data_update)

	def startRContinuousUpdate(self):
		self.process = Process(target=self.continuousRUpdate, args=())
		self.process.start()