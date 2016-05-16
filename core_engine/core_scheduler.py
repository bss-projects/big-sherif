#!/usr/bin/python
# -*- coding: utf-8 -*-

import configclass
import datetime
import importlib
import json
import logging
import os
import sys
import time
from multiprocessing import Process, Queue

def list_fileconf(path):
	l_fileconf = []

	filenames = os.listdir(path)
	for filename in filenames:
		if filename.endswith('.conf') == True:
			l_fileconf.append(filename)

	return l_fileconf

def list_modconf(l_fileconf):
	l_modconf = []

	for fileconf in l_fileconf:
		json_conf_file = open('./schedmod/'+fileconf)

		conf_data = json.load(json_conf_file)
		l_modconf.append(conf_data)
		json_conf_file.close()

	return l_modconf

def delete_lockfile(path):
	filenames = os.listdir(path)
	for filename in filenames:
		if filename.endswith('.lock') == True:
			os.remove(path+filename)

Conf = configclass.ConfObjClass('BigSherif.cfg', 'BigSherif_configcheck.cfg')

logger = logging.getLogger('core_scheduler')
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s :: %(message)s')
file_handler = logging.FileHandler('CoreScheduler.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

logger.info('INIT')

#try:
iv = importlib.import_module('schedmod')
l_fileconf = list_fileconf('./schedmod/')
l_modconf = list_modconf(l_fileconf)
delete_lockfile('./schedmod/lock/')
d_schedule = {}

while True:
	
	for modconf in l_modconf:
		if modconf['SchedModName'] in d_schedule:
			ts_now = time.time()
			if ts_now - d_schedule[modconf['SchedModName']]['timestamp'] > modconf['Interval']:
				inter = ts_now - d_schedule[modconf['SchedModName']]['timestamp']
				d_schedule[modconf['SchedModName']]['timestamp'] = ts_now
				Class = eval('iv.'+modconf['SchedModName'])
				p = Process(target=Class(lockfile_path='/lock/', ConfObj=Conf).main, args=(inter,), name=modconf['SchedModName'])
				p.start()
		else:
			d_schedule[modconf['SchedModName']] = {'Interval': modconf['Interval'], 'timestamp': time.time()}
			Class = eval('iv.'+modconf['SchedModName'])
			p = Process(target=Class(lockfile_path='/lock/', ConfObj=Conf).main, args=(0,))
			p.start()

	time.sleep(1)
