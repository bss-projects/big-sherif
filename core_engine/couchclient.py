#!/usr/bin/env python
import couchdb

null = None

couch = couchdb.Server('http://127.0.0.1:5984/')

db = couch['temp_test']

doc = {"event_type": "check", "timestamp": 1364403929, "component": "debian.softia-systems.net", "state_type": 1, "source_type": "resource", "perf_data_array": [{"min": "0", "max": null, "metric": "events_msg_in", "value": 123120, "type": "DERIVE", "unit": null}], "resource": "canopsis_rabbitmq", "connector": "collectd", "long_output": null, "state": 0, "connector_name": "collectd2event", "output": null}

db['ev3'] = doc

doc_id = db.get('ev3')

print doc_id['timestamp']
