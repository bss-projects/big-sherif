#!/usr/bin/env python
# -*- coding: utf-8 -*-

import abc
import os
import time



#*************************
# Abstract Class to define schedule module
#*************************

'''
main qui lance la fonction exec
exec contient tout ce qui est spécifique au module

Dans main :
- verif si pas de lock
- si pas lock je lock, si lock stop
- launch
- retour main fin launch, de-lock
'''

class SchedModClass(object):
	"Abstract Class to define schedule module"
	__metaclass__ = abc.ABCMeta

	def __init__(self, lockfile_path=None, lockfile_name=None, ConfObj=None):
		
#		print '----------'
#		print self.__class__.__name__
#		print lockfile_path
#		print '----------'

		#si path specifie on en met pas os.path.dirname
		self.lockfile_path = os.path.dirname(os.path.abspath(__file__))+lockfile_path
		#si name specifie on ne met pas self.__class__.__name__
		self.lockfile_name = self.__class__.__name__
		self.processname = self.__class__.__name__
		self.lockfile = self.lockfile_path+self.lockfile_name+'.lock'
		self.pid = 0
		self.ConfObj = ConfObj

	@abc.abstractmethod
	def launch(self):
		"""Specific method to implement in each module"""

	def main(self, t_time):
		self.pid = os.getpid()
		if os.path.isfile(self.lockfile) == True:
			return
		else:
			print self.processname
			print t_time
			file = open(self.lockfile, 'w')
			file.write(str(self.pid))
			file.close()
		self.launch()
		os.remove(self.lockfile)
		return



