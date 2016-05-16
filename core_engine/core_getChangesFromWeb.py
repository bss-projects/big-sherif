#!/usr/bin/env python
# -*- coding: utf-8 -*-

from ContinuousChangesDBStreamClass import ContinuousChangesDBStreamClass


Hosts_changes = ContinuousChangesDBStreamClass('hosts', 'ch_hosts', 'hosts')
Hosts_changes.startProcess()

Connector_changes = ContinuousChangesDBStreamClass('config', 'ch_connector_doc', 'connector_doc')
Connector_changes.startProcess()

CurrentEvent_changes = ContinuousChangesDBStreamClass('currentevents', 'ch_current_events', 'current_events')
CurrentEvent_changes.startProcess()

'''
si le change contient le flag IHM

un objet par base à surveiller
comme ça on gère le change sur ajout de host pour dédup et autre possibilité

une méthode pour la surveillance du stream
une méthode pour lancer la surveillance dans un nouveau process
'''