#!/usr/bin/python
# -*- coding: utf-8 -*-
import sys
import json
import requests
from uuid import uuid4

database_address = 'http://localhost:5984/'

headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

l_connector_type = ['nagios', 'shinken', 'icinga']
d_criticality = {0: [0, 0], 1: [1, 1], 2: [2, 3], 3: [3, 2]}

for connector_type in l_connector_type:
	for criticality_input, value in d_criticality.items():
		doc_id = uuid4().hex

		doc = {
		   "_id": doc_id,
		   "connector": connector_type,
		   "criticality_input": criticality_input,
		   "criticality_transcode": value[0],
		   "weight": value[1]
		}

		r = requests.put(database_address+"/big_sherif_criticality_transcode/"+doc_id, data=json.dumps(doc), headers=headers)
		print r.json();