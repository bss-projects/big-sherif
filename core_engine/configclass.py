#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import redis
from configobj import ConfigObj
from validate import Validator

class ConfObjClass():

	def __init__(self, configfile, configspec):
		self.configfile = configfile
		config = ConfigObj(configfile, configspec=configspec)

		validator = Validator()
		result = config.validate(validator)

		if result != True:
			print 'Config file validation failed!'
			sys.exit(1)

		couchdb_config = config['CouchDB Config']
		amqp_config = config['AMQP Config']
		redis_config = config['REDIS Config']
		proxy_config = config['Proxy Config']

		self.database_address = couchdb_config['server']
		self.amqp_address = amqp_config['server']
		self.amqp_port = amqp_config['port']
		self.redis_address = redis_config['server']
		self.redis_port = redis_config['port']
		self.proxy_http = proxy_config['proxy_http']
		self.proxy_https = proxy_config['proxy_https']


		self.proxies = {
						"http": self.proxy_http,
						"https": self.proxy_http,}

		self.r = redis.Redis(self.redis_address, self.redis_port)

