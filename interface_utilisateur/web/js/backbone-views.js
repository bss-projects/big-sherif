// Events and Event Log Views

function delUnmanaged(id) {
 if (id)
 {
  //      // console.log(id + "alone");
  var group = new RowData({ _id: id ,type: "unmanaged"});
  group.destroy({success: function(model, response) {
    unmanagedList.scrollTop();
    }});
 }
}

var PoolView = Backbone.View.extend({
render: function() {
var id = this.model.toJSON()._id;
values = this.model.toJSON();
Today = new Date;
Heure = Today.getHours();
Min = Today.getMinutes();
values["now"] = Today.getHours() + ":" + Today.getMinutes();
var html = render("PoolView",
 {
id: id,
values: values,
valueslist: _.map(_.pairs(_.omit(this.model.toJSON(), "_rev", "rev", "ok", "id" )), function(pair){return {"key":pair[0] , "value":pair[1]};})
});
this.$el.html(html);
poolname = this.model.toJSON();
currentPoolLog = new CurrentEvents({type: "hosts",
 sorting: "hostname",
 filters: {"pool.pool_name" : this.model.toJSON()["_id"]},
 column_names: [
 {
label: " ",
field: "_id",
css_class: "column_fiche",
width: "32px",
format: function(data) {
// lien qui ouvre la fiche event
return new Handlebars.SafeString('<a href="/#host/'+data+'" target="_blank"><i title="Fiche Hote" class="icon-2x icon-hdd"></i></a>');
}
},
{
label: "Nom d'équipement",
field: "hostname",
css_class: "ui-widget",
width: "160px",
format: function(data) {
// lien qui ouvre la fiche host
 return new Handlebars.SafeString('<a href="/#host/'+data+'" target="_blank">'+data+'</a>');
}
},

{
label: "Etat des ressources",
       field: "resource",
       // css_class: "sorting",
       width: "100%",
       format: function(data) {
	mytmp = "";
	// toutes les keys sauf "Host status"
	for (var row in data) {
	 mytmp += row+ " : ";
	 if (data[row]["criticality"] == 0) {
	  mytmp +=  '<i title="OK" style="color:Green;" class="icon-2x icon-ok-circle"></i>';
	 }
	 if (data[row]["criticality"] == 1) {
	  mytmp +=  '<i title="WARNING" style="color:Gold;" class="icon-2x icon-warning-sign"></i>';
	 }
	 if (data[row]["criticality"] == 4) {
	  mytmp +=  '<i title="MINEUR" style="color:DarkOrange;" class="icon-2x icon-warning-sign"></i>';
	 }
	 if (data[row]["criticality"] == 5) {
	  mytmp +=  '<i title="MAJEUR" style="color:FireBrick;" class="icon-2x icon-warning-sign"></i>';
	 }
	 if (data[row]["criticality"] == 2) {
	  mytmp +=  '<i title="CRITIQUE" style="color:FireBrick;" class="icon-2x icon-remove-sign"></i>';
	 }
	 if (data[row]["criticality"] == 3) {
	  mytmp +=  '<i title="UNKNOWN" style="color:FireBrick;" class="icon-2x icon-question-sign"></i>';
	 }

	 mytmp += ", ";
	}
	return mytmp.substr(0,mytmp.length-2);
       }
}


] });
var currentPoolLogView = new dataGridView({collection: currentPoolLog, "tableId": "hostRessources", timeout: 3000});
currentPoolLogView.$el = $("#ohmhost");
currentPoolLogView.render();

currentEventLogHistory = new CurrentEvents({type: "currenteventshistory",
  sorting: "timestamp_start",
  filters: {"pool.pool_name" : this.model.toJSON()["_id"]},
  column_names: [
  {
label: " ",
field: "_id",
css_class: "column_fiche",
width: "32px",
format: function(data) {
// lien qui ouvre la fiche event
return new Handlebars.SafeString('<a href="/#event/'+data+'" target="_blank"><i title="Fiche événement" class="icon-2x icon-file-alt"></i></a>');
}
},
{
label: "",
field: "state",
css_class: "column_fiche",
width: "32px",
format: function(data) {
if (data == 0) {
 return '<i title="R&eacute;tabli" style="color:Green;" class="icon-2x icon-ok-circle"></i>'
}
if (data == 1) {
 return '<i title="Annul&eacute;" style="color:Green;" class="icon-2x icon-minus-sign"></i>'
}
if (data == 4) {
 return '<i title="Bagot" style="color:DarkOrange;" class="icon-2x icon-exchange"></i>'
}
if (data == 5) {
 return '<i title="En cours" style="color:FireBrick;" class="icon-2x icon-exclamation-sign"></i>'
}
if (data == 2) {
 return '<i title="Furtif" style="color:FireBrick;" class="icon-2x icon-fighter-jet"></i>'
}
if (data == 3) {
 return '<i title="Acquit&eacute;" style="color:FireBrick;" class="icon-2x icon-pushpin"></i>'
}
if (data == -1) {
 return '<i title="Info" style="color:Grey;" class="icon-2x icon-info-sign"></i>'
}

return (data);
}
},
{
label: "",
       field: "criticality",
       css_class: "column_fiche",
       width: "32px",
       format: function(data) {
	// kikou logo kouleur ki klake
	if (data == 0) {
	 return '<i title="OK" style="color:Green;" title="Fiche événement" class="icon-2x icon-ok-circle"></i>'
	}
	if (data == 1) {
	 return '<i title="WARNING" style="color:Gold;" title="Fiche événement" class="icon-2x icon-warning-sign"></i>'
	}
	if (data == 4) {
	 return '<i title="MINEUR" style="color:DarkOrange;" title="Fiche événement" class="icon-2x icon-warning-sign"></i>'
	}
	if (data == 5) {
	 return '<i title="MAJEUR" style="color:FireBrick;" title="Fiche événement" class="icon-2x icon-warning-sign"></i>'
	}
	if (data == 2) {
	 return '<i title="CRITIQUE" style="color:FireBrick;" title="Fiche événement" class="icon-2x icon-remove-sign"></i>'
	}
	if (data == 3) {
	 return '<i title="UNKNOWN" style="color:FireBrick;" title="Fiche événement" class="icon-2x icon-question-sign"></i>'
	}
	return data;
       }
},
{
label: "Date",
       field: "timestamp_start",
       width: "150px",
       format: function(data) {
	var event_time = new Date(parseInt(data) * 1000);
	return event_time.toLocaleString();
       }
},
{
label: "Equipement",
       field: "",
       width: "120px",
       format: function(data) {
	// 
	return data;
       }
},
{
label: "Ressource",
       field: "resource",
       width: "120px",
       format: function(data) {
	// 
	return data;
       }
},
{
label: "Description",
       width: "100%",
       field: "output",
       format: function(data) {
	return data;
       }
}
] });
var currentEventLogViewHistory = new dataGridView({collection: currentEventLogHistory, "tableId": "hostHistory", timeout: 3000});
currentEventLogViewHistory.$el = $("#history");
currentEventLogViewHistory.render();

currentEventLog = new CurrentEvents({type: "currentevents",
  sorting: "timestamp_start",
  filters: {"pool.pool_name" : this.model.toJSON()["_id"]},
  column_names: [
  {
label: " ",
field: "_id",
css_class: "column_fiche",
width: "32px",
format: function(data) {
// lien qui ouvre la fiche event
return new Handlebars.SafeString('<a href="/#event/'+data+'" target="_blank"><i title="Fiche événement" class="icon-2x icon-file-alt"></i></a>');
}
},
{
label: "",
field: "state",
css_class: "column_fiche",
width: "32px",
format: function(data) {
if (data == 0) {
 return '<i title="R&eacute;tabli" style="color:Green;" class="icon-2x icon-ok-circle"></i>'
}
if (data == 1) {
 return '<i title="Annul&eacute;" style="color:Green;" class="icon-2x icon-minus-sign"></i>'
}
if (data == 4) {
 return '<i title="Bagot" style="color:DarkOrange;" class="icon-2x icon-exchange"></i>'
}
if (data == 5) {
 return '<i title="En cours" style="color:FireBrick;" class="icon-2x icon-exclamation-sign"></i>'
}
if (data == 2) {
 return '<i title="Furtif" style="color:FireBrick;" class="icon-2x icon-fighter-jet"></i>'
}
if (data == 3) {
 return '<i title="Acquit&eacute;" style="color:FireBrick;" class="icon-2x icon-pushpin"></i>'
}
if (data == -1) {
 return '<i title="Info" style="color:Grey;" class="icon-2x icon-info-sign"></i>'
}

return (data);
}
},
{
label: "",
       field: "criticality",
       css_class: "column_fiche",
       width: "32px",
       format: function(data) {
	// kikou logo kouleur ki klake
	if (data == 0) {
	 return '<i title="OK" style="color:Green;" title="Fiche événement" class="icon-2x icon-ok-circle"></i>'
	}
	if (data == 1) {
	 return '<i title="WARNING" style="color:Gold;" title="Fiche événement" class="icon-2x icon-warning-sign"></i>'
	}
	if (data == 4) {
	 return '<i title="MINEUR" style="color:DarkOrange;" title="Fiche événement" class="icon-2x icon-warning-sign"></i>'
	}
	if (data == 5) {
	 return '<i title="MAJEUR" style="color:FireBrick;" title="Fiche événement" class="icon-2x icon-warning-sign"></i>'
	}
	if (data == 2) {
	 return '<i title="CRITIQUE" style="color:FireBrick;" title="Fiche événement" class="icon-2x icon-remove-sign"></i>'
	}
	if (data == 3) {
	 return '<i title="UNKNOWN" style="color:FireBrick;" title="Fiche événement" class="icon-2x icon-question-sign"></i>'
	}
	return data;
       }
},
{
label: "Date",
       field: "timestamp_start",
       width: "150px",
       format: function(data) {
	var event_time = new Date(parseInt(data) * 1000);
	return event_time.toLocaleString();
       }
},
{
label: "Equipement",
       field: "",
       width: "120px",
       format: function(data) {
	// 
	return data;
       }
},
{
label: "Ressource",
       field: "resource",
       width: "120px",
       format: function(data) {
	// 
	return data;
       }
},
{
label: "Description",
       width: "100%",
       field: "output",
       format: function(data) {
	return data;
       }
}
] });

var currentEventLogView = new dataGridView({collection: currentEventLog, "tableId": "PoolCurrentEvent", timeout: 3000});
currentEventLogView.$el = $("#alarms");
currentEventLogView.render();


var today = new Date();
var year = today.getFullYear();
var month = today.getMonth()+1;
var day = today.getDate();
var hour = today.getHours();
var min = today.getMinutes();
var current_date = year+'-'+month+'-'+day;
$('#date').DatePicker({
flat: true,
date: current_date.toString(),
current: current_date.toString(),
calendars: 3,
mode: 'range',
starts: 1
});
},
initialize: function(){
	     var view = this;
	     this.model.fetch({
success: function (model, response, options){
//console.log("Managed to retrieve event "+model.id);
},
error: function (model, response, options){
//console.log("Did not manage to fetch the event "+model.type + "/" + model.id);
}
});
this.listenTo(this.model, "change", this.render);
}
});

var HostView = Backbone.View.extend({
render: function() {
var id = this.model.toJSON()._id;
values = this.model.toJSON();
Today = new Date;
Heure = Today.getHours();
Min = Today.getMinutes();
values["now"] = Today.getHours() + ":" + Today.getMinutes();
var html = render("HostView",
 {
id: id,
values: values,
valueslist: _.map(_.pairs(_.omit(this.model.toJSON(), "_rev", "rev", "ok", "id" )), function(pair){return {"key":pair[0] , "value":pair[1]};})
});
this.$el.html(html);
$( "#addsystemdlg" ).dialog({
autoOpen: false,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
}
});
$( "#addsystembtn" ).click(function() {
  $( "#addsystemdlg" ).dialog( "open" );
  });

$( "#qrsdlg" ).dialog({
autoOpen: false,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
}
});
hostname = this.model.toJSON();
currentEventLog = new CurrentEvents({type: "currenteventshost",
  sorting: "timestamp_start",
  key: this.model.toJSON()["_id"],
  filters: {"component" : this.model.toJSON()["_id"]},
  column_names: [
  {
label: " ",
field: "_id",
css_class: "column_fiche",
width: "32px",
format: function(data) {
// lien qui ouvre la fiche event
return new Handlebars.SafeString('<a href="/#event/'+data+'" target="_blank"><i title="Fiche événement" class="icon-2x icon-file-alt"></i></a>');
}
},
{
label: "",
field: "state",
css_class: "column_fiche",
width: "32px",
format: function(data) {
 if (data == 0) {
  return '<i title="R&eacute;tabli" style="color:Green;" class="icon-2x icon-ok-circle"></i>'
 }
 if (data == 1) {
  return '<i title="Annul&eacute;" style="color:Green;" class="icon-2x icon-minus-sign"></i>'
 }
 if (data == 4) {
  return '<i title="Bagot" style="color:DarkOrange;" class="icon-2x icon-exchange"></i>'
 }
 if (data == 5) {
  return '<i title="En cours" style="color:FireBrick;" class="icon-2x icon-exclamation-sign"></i>'
 }
 if (data == 2) {
  return '<i title="Furtif" style="color:FireBrick;" class="icon-2x icon-fighter-jet"></i>'
 }
 if (data == 3) {
  return '<i title="Acquit&eacute;" style="color:FireBrick;" class="icon-2x icon-pushpin"></i>'
 }
 if (data == -1) {
  return '<i title="Info" style="color:Grey;" class="icon-2x icon-info-sign"></i>'
 }


 return (data);
}
},

{
label: "",
       field: "criticality",
       css_class: "column_fiche",
       width: "32px",
       format: function(data) {
	// kikou logo kouleur ki klake
	if (data == 0) {
	 return '<i title="OK" style="color:Green;" title="Fiche événement" class="icon-2x icon-ok-circle"></i>'
	}
	if (data == 1) {
	 return '<i title="WARNING" style="color:Gold;" title="Fiche événement" class="icon-2x icon-warning-sign"></i>'
	}
	if (data == 4) {
	 return '<i title="MINEUR" style="color:DarkOrange;" title="Fiche événement" class="icon-2x icon-warning-sign"></i>'
	}
	if (data == 5) {
	 return '<i title="MAJEUR" style="color:FireBrick;" title="Fiche événement" class="icon-2x icon-warning-sign"></i>'
	}
	if (data == 2) {
	 return '<i title="CRITIQUE" style="color:FireBrick;" title="Fiche événement" class="icon-2x icon-remove-sign"></i>'
	}
	if (data == 3) {
	 return '<i title="UNKNOWN" style="color:FireBrick;" title="Fiche événement" class="icon-2x icon-question-sign"></i>'
	}
	return data;
       }
},
{
label: "Date",
       field: "timestamp_start",
       width: "150px",
       format: function(data) {
	var event_time = new Date(parseInt(data) * 1000);
	return event_time.toLocaleString();
       }
},
{
label: "Ressource",
       field: "resource",
       width: "120px",
       format: function(data) {
	// 
	return data;
       }
},
{
label: "Description",
       width: "100%",
       field: "output",
       format: function(data) {
	return data;
       }
}


] });
var currentEventLogView = new dataGridView({collection: currentEventLog, "tableId": "hostRessources", timeout: 3000});
currentEventLogView.$el = $("#ohmhost");
currentEventLogView.render();

currentEventLogHistory = new CurrentEvents({type: "currenteventshistory",
  sorting: "timestamp_start",
  key: this.model.toJSON()["_id"],
  filters: {"component" : this.model.toJSON()["_id"]},
  column_names: [
  {
label: " ",
field: "_id",
css_class: "column_fiche",
width: "32px",
format: function(data) {
// lien qui ouvre la fiche event
return new Handlebars.SafeString('<a href="/#event/'+data+'" target="_blank"><i title="Fiche événement" class="icon-2x icon-file-alt"></i></a>');
}
},
{
label: "",
field: "state",
css_class: "column_fiche",
width: "32px",
format: function(data) {
 if (data == 0) {
  return '<i title="R&eacute;tabli" style="color:Green;" class="icon-2x icon-ok-circle"></i>'
 }
 if (data == 1) {
  return '<i title="Annul&eacute;" style="color:Green;" class="icon-2x icon-minus-sign"></i>'
 }
 if (data == 4) {
  return '<i title="Bagot" style="color:DarkOrange;" class="icon-2x icon-exchange"></i>'
 }
 if (data == 5) {
  return '<i title="En cours" style="color:FireBrick;" class="icon-2x icon-exclamation-sign"></i>'
 }
 if (data == 2) {
  return '<i title="Furtif" style="color:FireBrick;" class="icon-2x icon-fighter-jet"></i>'
 }
 if (data == 3) {
  return '<i title="Acquit&eacute;" style="color:FireBrick;" class="icon-2x icon-pushpin"></i>'
 }
 if (data == -1) {
  return '<i title="Info" style="color:Grey;" class="icon-2x icon-info-sign"></i>'
 }

 return (data);
}
},
{
label: "",
       field: "criticality",
       css_class: "column_fiche",
       width: "32px",
       format: function(data) {
	// kikou logo kouleur ki klake
	if (data == 0) {
	 return '<i title="OK" style="color:Green;" title="Fiche événement" class="icon-2x icon-ok-circle"></i>'
	}
	if (data == 1) {
	 return '<i title="WARNING" style="color:Gold;" title="Fiche événement" class="icon-2x icon-warning-sign"></i>'
	}
	if (data == 4) {
	 return '<i title="MINEUR" style="color:DarkOrange;" title="Fiche événement" class="icon-2x icon-warning-sign"></i>'
	}
	if (data == 5) {
	 return '<i title="MAJEUR" style="color:FireBrick;" title="Fiche événement" class="icon-2x icon-warning-sign"></i>'
	}
	if (data == 2) {
	 return '<i title="CRITIQUE" style="color:FireBrick;" title="Fiche événement" class="icon-2x icon-remove-sign"></i>'
	}
	if (data == 3) {
	 return '<i title="UNKNOWN" style="color:FireBrick;" title="Fiche événement" class="icon-2x icon-question-sign"></i>'
	}
	return data;
       }
},
{
label: "Date",
       field: "timestamp_start",
       width: "150px",
       format: function(data) {
	var event_time = new Date(parseInt(data) * 1000);
	return event_time.toLocaleString();
       }
},
{
label: "Ressource",
       field: "resource",
       width: "120px",
       format: function(data) {
	// 
	return data;
       }
},
{
label: "Description",
       width: "100%",
       field: "output",
       format: function(data) {
	return data;
       }
}
] });
var currentEventLogViewHistory = new dataGridView({collection: currentEventLogHistory, "tableId": "hostHistory", timeout: 3000});
currentEventLogViewHistory.$el = $("#history");
currentEventLogViewHistory.render();

var today = new Date();
var year = today.getFullYear();
var month = today.getMonth()+1;
var day = today.getDate();
var hour = today.getHours();
var min = today.getMinutes();
var current_date = year+'-'+month+'-'+day;
$('#date').DatePicker({
flat: true,
date: current_date.toString(),
current: current_date.toString(),
calendars: 3,
mode: 'range',
starts: 1
});

document.forms["unmanage_host"]["end_time"].value="23:59";

unmanagedList = new dataGrid({
type: "unmanaged",
key: hostname["_id"],
sorting: "start_date",
filters: {"component": hostname["_id"]},
column_names: [
{
label: "",
field: "_id",
width: "70px",
format: function(data) {
return '<i style="cursor: pointer;" class="icon-trash icon-large" onclick=\'delUnmanaged("'+data+'")\'></i>';
}}
,
{
label: "Debut",
field: "start_date",
width: "160px",
format: function(data) {
// 
var newDate = new Date()
 newDate.setTime(data*1000);
return newDate.toLocaleString();
}
},
{
label: "Fin",
       field: "end_date",
       width: "160px",
       format: function(data) {
	// 
	var newDate = new Date()
	 newDate.setTime(data*1000);
	return newDate.toLocaleString();
       }
},
{
label: "Commentaire",
       field: "comment",
       width: "100%",
       format: function(data) {
	// 
	return data;
       }
}


]});

unmanagedListView = new dataGridView({"collection": unmanagedList, "tableId":"unmanagedTableId", timeout: 20000});
unmanagedListView.$el = $("#unmanage_listing");
unmanagedListView.render();
$("#scrolling_area_unmanagedTableId").css({"height" : "300px"});
$("#form_recherche_unmanagedTableId").css({"visibility": "hidden"});
},
initialize: function(){
	     var view = this;
	     this.model.fetch({
success: function (model, response, options){
//console.log("Managed to retrieve event "+model.id);
},
error: function (model, response, options){
//console.log("Did not manage to fetch the event "+model.type + "/" + model.id);
}
});
this.listenTo(this.model, "change", this.render);
}
});

var EventView = Backbone.View.extend({
render: function() {
var id = this.model.toJSON()._id;
values =  this.model.toJSON();
//aller chercher dans la base si le ticket existe
var ticket = 0;
if (values["ticket"])
{
// Afficher le ticket

$.ajax({
type: "GET",
async : false,
url: "/api/get_ticket/"+values["ticket"],
dataType: "json",
success: function(data, status, jqXHR)
{
values["ticket_oss_id"] = data['depeche_id'];
values["ticket_component"] = data['depeche_component'];
values["ticket_open_date"] = data['depeche_open_date'];
values["ticket_close_date"] = data['depeche_close_date'];
values["ticket_status"] = data['depeche_status'];
values["ticket_code_cause"] = data['depeche_code_cause'];
values["ticket_assignment"] = data['depeche_assignment'];
values["ticket_brief_description"] = data['depeche_brief_description'];
values["ticket_resolution_comment"] = data['depeche_resolution_comment'];
values["ticket_action_comment"] = data['depeche_action_comment'];
values["ticket_affected_comment"] = data['depeche_affected_comment'];
values["ticket_update_action_comment"] = data['depeche_update_action_comment'];
values["ticket_closing_comments"] = data['depeche_closing_comments'];
}
});

// values["ticket_oss_id"] = '42';
// values["ticket_component"] = '1353sh';
// values["ticket_open_date"] = 'date';
// values["ticket_close_date"] = '';
// values["ticket_status"] = 'En cours';
// values["ticket_code_cause"] = 'Ca va pas bien';
// values["ticket_assignment"] = 'The A-Team';
// values["ticket_brief_description"] = 'Disque casser';
// values["ticket_resolution_comment"] = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam. Fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
// values["ticket_action_comment"] = ' Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam. Fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
// values["ticket_affected_comment"] = ' Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam. Fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
// values["ticket_update_action_comment"] = ' Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam. Fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
// values["ticket_closing_comments"] = '';
}
else
{
 // Afficher le formulaire de declaration prerempli
 var current_date = new Date();
 var year = current_date.getFullYear();
 var month = current_date.getMonth() + 1;
 var day = current_date.getDate();

 if (month < 10)
 {
  month = '0'+month
 }
 if (day < 10)
 {
  day = '0'+day
 }

 var hour = current_date.getHours();
 var min = current_date.getMinutes();
 var sec = current_date.getSeconds();

 if (hour < 10)
 {
  hour = '0'+hour
 }
 if (min < 10)
 {
  min = '0'+min
 }
 if (sec < 10)
 {
  sec = '0'+sec
 }

 var randomnumber = Math.floor ( Math.random() * 100)

  values["ticket_id"] = randomnumber+'/'+sec+year+hour+month+min;
 values["ticket_title"] = values["component"]+'-'+values["resource"]+'-'+values["criticality"];
 values["ticket_declare_date"] = year+'-'+month+'-'+day+' '+hour+':'+min+':'+sec;
 values["ticket_component"] = values["component"];
 values["ticket_comment"] = values["output"];
 values["ticket_component_criticality"] = values["criticality"];
 values["event_id"] = values["_id"];
}

if (values["timestamp_end"])
{
 values["duration"] = secondsToString(parseInt(values["timestamp_end"] - values["timestamp_start"]));
}
else
{
 if (parseInt(new Date().getTime() / 1000 - values["timestamp_start"]) >= 0)
 {
  values["duration"] = secondsToString(parseInt(new Date().getTime() / 1000 - values["timestamp_start"]));
 }
 else
  values["duration"] = "Veuillez régler l'heure de vos machines";
}
values["timestamp_start"] = new Date(values["timestamp_start"] * 1000).toLocaleString();

if (values["criticality"] == 0) {
 values["criticality"] =  new Handlebars.SafeString('<i title="OK" style="color:Green;" class="icon-2x icon-ok-circle"></i>');
}
if (values["criticality"] == 1) {
 values["criticality"] =  new Handlebars.SafeString('<i title="WARNING" style="color:Gold;" class="icon-2x icon-warning-sign"></i>');
}
if (values["criticality"] == 4) {
 values["criticality"] =  new Handlebars.SafeString('<i title="MINEUR" style="color:DarkOrange;" class="icon-2x icon-warning-sign"></i>');
}
if (values["criticality"] == 5) {
 values["criticality"] =  new Handlebars.SafeString('<i title="MAJEUR" style="color:FireBrick;" class="icon-2x icon-warning-sign"></i>');
}
if (values["criticality"] == 2) {
 values["criticality"] =  new Handlebars.SafeString('<i title="CRITIQUE" style="color:FireBrick;" class="icon-2x icon-remove-sign"></i>');
}
if (values["criticality"] == 3) {
 values["criticality"] =  new Handlebars.SafeString('<i title="UNKNOWN" style="color:FireBrick;" class="icon-2x icon-question-sign"></i>');
}
if (values["state"] != "3")
{
 values["ack"] = new Handlebars.SafeString('<span id="isacknowledge_span"><input type="checkbox" name="isacknowledge" /><label for="isacknowledge" class="inline">Acquitter l\'&eacute;v&egrave;nement</label></span>');
}
if (values["state"] == "0") {
 values["state"] = new Handlebars.SafeString('<i title="R&eacute;tabli" style="color:Green;" class="icon-2x icon-ok-circle"></i>');
}
if (values["state"] == "1") {
 values["state"] = new Handlebars.SafeString('<i title="Annul&eacute;" style="color:Green;" class="icon-2x icon-minus-sign"></i>');
}
if (values["state"] == "4") {
 values["state"] = new Handlebars.SafeString('<i title="Bagot" style="color:DarkOrange;" class="icon-2x icon-exchange"></i>');
}
if (values["state"] == "5") {
 values["state"] = new Handlebars.SafeString('<i title="En cours" style="color:FireBrick;" class="icon-2x icon-exclamation-sign"></i>');
}
if (values["state"] == "2") {
 values["state"] = new Handlebars.SafeString('<i title="Furtif" style="color:FireBrick;" class="icon-2x icon-fighter-jet"></i>');
}
if (values["state"] == "3") {
 values["state"] = new Handlebars.SafeString('<i title="Acquit&eacute;" style="color:FireBrick;" class="icon-2x icon-pushpin"></i>');
}
if (values["state"] == "-1") {
 values["state"] = new Handlebars.SafeString('<i title="Info" style="color:grey;" class="icon-2x icon-info-sign"></i>');
}


var event_view = this;
var html = render("EventView",
  {
id: id,
values: values,
valueslist: _.map(_.pairs(_.omit(this.model.toJSON(), "_rev", "rev", "ok", "id" )), function(pair){return {"key":pair[0] , "value":pair[1]};})
});
this.$el.html(html)

 $( "#addsystemdlg" ).dialog({
autoOpen: false,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
}
});
$( "#addsystembtn" ).click(function() {
  $( "#addsystemdlg" ).dialog( "open" );
  });

$( "#qrsdlg" ).dialog({
autoOpen: false,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
}
});

$("#addsystemdlg").submit($.proxy(this.addFonctionnel, this));
$("#acquitter_"+id).submit($.proxy(this.addComment, this));



/* 		$("#acquitter_"+ id).click(function() {
		$("#acquitter_"+ id + " span").text("click");
		if (event_view.model.get("state") == 0 || event_view.model.get("state") == 5 ) {
		event_view.model.save({"state": 3, "comments": ["acquittement"]},{wait: true, success: function (model, response, options){
//eventLog.refresh(0);
//currentEventLog.refresh(0);
event_view.render();
}});
} else {
event_view.model.save({"state": 5, "comments": ["en cours"]},{wait: true, success: function (model, response, options){	
//eventLog.refresh(0);
//currentEventLog.refresh(0);
event_view.render();
}});
}
}); */
},
addComment: function() {

	     var session = $.cookie("big_sherif_session");
	     var profile = session["profile"];
	     var now = new Date();
	     var comments = typeof this.model.get("comments") == 'undefined' ? [] : this.model.get("comments");
	     var new_state = $(document.forms["addacomment"]["isacknowledge"]).is(':checked') ? 3: this.model.get("state");

	     var new_comment = {
	      "username": session["username"],
	      "first_name": profile["first_name"],
	      "last_name": profile["last_name"],
	      "text": document.forms["addacomment"]["comment"].value,
	      "timestamp": now.getTime() / 1000,
	      "state_before": this.model.get("state"),
	      "state_after": new_state
	     };
	     comments.unshift(new_comment);

	     var view = this;

	     this.model.save({comments: comments, state: new_state, ihm:1},{success: function (model,response,options) {
	       var truc = $("#comment").html();
	       var troc = '<blockquote class="small"><p> '+document.forms["addacomment"]["comment"].value +'<span> Post&eacute; par '+profile["first_name"]+' '+profile["last_name"]+' ('+session["username"]+'), le '+[now.getDate(), now.getMonth() + 1, now.getFullYear()].join("/")+' &agrave; '+[now.getHours(), now.getMinutes()].join("h")+'</span></p> </blockquote>';
	       $("#comment").html(troc+truc);
	       if (new_comment["state_after"] == 3) {
	       $("#isacknowledge_span").remove();
	       $("#state_info ").empty().append("3");
	       }
	       document.forms["addacomment"]["comment"].value = "";
	       $("#acquitter_"+view.model.get("_id")).submit($.proxy(this.addComment, this));
	       }});
	     return false;

	    },
addFonctionnel: function() {
		 var new_systems = document.forms["addasystem"]["fname"].value;
		 var component = new RowData({_id: this.model.get("component"), type: "hosts"});
		 var view = this
		  component.fetch({wait: true, success: function (model,response,options) {

		    var poollist = model.attributes["pool"];

		    if (new_systems in _.map(poollist, function(pool) { if (pool["pool_type_name"] == "Fonctionnel") {return pool["pool_name"];} }))
		    {
		    $( "#addsystemdlg" ).dialog( "close" );
		    $( "#addsystembtn" ).click(function() {
		     $( "#addsystemdlg" ).dialog( "open" );
		     });
		    } else {
		    poollist.push({pool_name: new_systems, pool_type_name: "Fonctionnel"});
		    view.model.save("pool", poollist, {wait: true, success: function (model,response,options) {
		     component.save("pool", poollist, {wait: true, success: function (model,response,options) {
		      var truc = $("#systems_list").html();
		      if (_.indexOf(truc, "Aucun") >= 0){
		      var troc = truc.replace('Aucun', new_systems);
		      $("#systems_list").html(troc);
		      } else
		      {
		      //var troc = truc.replace(' <I', ', '+new_systems +' <I');
		      $("#systems_list").append(", "+new_systems);
		      }
		      $( "#addsystemdlg" ).dialog( "close" );
		      $( "#addsystembtn" ).click(function() {
		       $( "#addsystemdlg" ).dialog( "open" );
		       });

		      document.forms["addasystem"].reset();
		      }});
		     }});
		    }
		  }});
		 return false;
		},
initialize: function(){
	     var view = this;
	     this.model.fetch({
success: function (model, response, options){
// console.log(model);
view.render();
//console.log("Managed to retrieve event "+model.id);
},
error: function (model, response, options){
//console.log("Did not manage to fetch the event "+model.type + "/" + model.id);
}
});
}
});

var dataGridView = Backbone.View.extend({
timer: function(timeout) {
timeout = typeof timeout !== 'undefined' ? timeout : this.timeout;        
if (timeout != 0) {
var this_view = this;
this.nextTimeout = setTimeout(function(){
 if($("#scrolling_area_"+this_view.tableId).scrollTop() == 0) {
 if ($(this_view.$el.selector).length != 0) {
 this_view.collection.fresh();
 }
 }
 }, timeout);
}
},
onAdd: function(new_event) {
if ($("[id='"+this.tableId+"_"+new_event["id"]+"']").length) {
return
}
var formated_event = [];
for (var column in this.collection.column_names) {
var underscore_fields = ["pool_domaine", "pool_perimetre"];
if (_.indexOf(underscore_fields, this.collection.column_names[column]["field"]) >= 0) {
 var column_field = this.collection.column_names[column]["field"].split("_")[0];
} else {
 var column_field = this.collection.column_names[column]["field"];
}
if (_.has(this.collection.column_names[column], "format")) {
 formated_event[formated_event.length] = {
data: this.collection.column_names[column]["format"](new_event.attributes[column_field]),
      style: this.collection.column_names[column]["style"],
      css_class: this.collection.column_names[column]["css_class"]
 };
} else {
 formated_event[formated_event.length] = {
data: new_event.attributes[column_field],
      style: this.collection.column_names[column]["style"],
      css_class: this.collection.column_names[column]["css_class"] 
 };
}
}
var html = render("DatagridEventRow",
  {
rowId: this.tableId+"_"+new_event["id"],
css: "",
event: formated_event
});

var index = _.indexOf(_.pluck(this.collection.models, "id"), new_event.attributes["_id"]);
//$("#" + this.tableId +" tbody").append(html);
if ($("#" + this.tableId +" tbody tr").length == 0) {
 $("#" + this.tableId +" tbody").append(html);
} else if (index == 0) {
 $("#" + this.tableId +" tbody").prepend(html);
} else {
 $("#" + this.tableId +" tbody tr").eq(index - 1).after(html);
}

var collection = this.collection;

$("[id='"+this.tableId+"_"+new_event["id"]+"']"+" td").each(function(index) {
  $($(this)[0]).css("min-width", collection.column_names[index]["width"]);
  $($(this)[0]).css("max-width", collection.column_names[index]["width"]);
  $(this)[0].style["width"] = collection.column_names[index]["width"];
  });
$("#"+this.tableId+" > tbody > tr").removeClass("odd").removeClass("even");
$("#"+this.tableId+" > tbody > tr:odd").addClass("odd");
$("#"+this.tableId+" > tbody > tr:not(.odd)").addClass("even");
//To eventually animate?
//$(html).hide().insertAfter($(this).parent().parent()).slideDown('slow');
//
},
onRemove: function(model, collection,options) {
	   $("#"+this.tableId+"_"+model["id"]).remove();
	  },
onClear: function() {
	  $("#" + this.tableId +" tbody tr").remove();
	  clearTimeout(this.nextTimeout);
	  this.collection.fresh(true);
	 },
render: function() {
	 if ($($(this)[0].$el.selector).length != 0 &&$("#"+this.tableId).length == 0) {
	  var html = render("DataGrid",
	    {
tableId: this.tableId,
columns: this.collection.column_names
});
this.$el.html(html);
var collection = this.collection;
var view = this;

$("#load_filter_" + this.tableId).change(function() {
  tableId = $(this).attr("id").substr(12);
  var filters = new RowData({_id: $("#load_filter_" + tableId +" option:selected").val(), type: "saved_filters"});
  filters.fetch({success: function(model, response) {
   keys=Object.keys(response["filters"]);
   $('#' + tableId + " input").val("");
   collection.search({}, true);
   for (i= 0; i < keys.length; i++)
   {
     if (keys[i] == 'timestamp_start_gt' || keys[i] == 'timestamp_start_lt' )
     {
       d = new Date(response["filters"][keys[i]]*1000);
       md = d.getFullYear() + "/" + (d.getMonth() +1) + "/" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
       $("#"+tableId+"_filter_" + keys[i]).val(md);
       obj = {};
       obj[keys[i]] = response["filters"][keys[i]]*1000;
       collection.search(obj);
     }
     else
     {
       obj = {};
       obj[keys[i]] = response["filters"][keys[i]];
       collection.search(obj);
       $("#"+tableId+"_filter_" + keys[i]).val(response["filters"][keys[i]]);
     }
   }
   }});
  });

$("#delete_filter_" + this.tableId).click(function() {
  tableId = $(this).attr("id").substr(14);
  var group = new RowData({ _id:$("#load_filter_" + tableId +" option:selected").val(),type: "saved_filters"});
  group.destroy({success: function(model, response) {
   $("#load_filter_" + tableId + " option[value='"+response['id']+"']").remove();
   $('#' + tableId + " input").val("");
   collection.search({}, true);
   }});

  });

$("#save_filter_" + this.tableId).click(function() {
  tableId = $(this).attr("id").substr(12);
  if ($("#load_filter_" + tableId +" option:selected" ).val() == "")
  {
  name = prompt("Nom du filtre ?");
  if (name == false)
  {
  return;
  }
  aData = {"_id": undefined, "name" : name, "tableid" : tableId, "filters" : collection.filters}
  }
  else
  {
  aData = {"_id" : $("#load_filter_" + tableId +" option:selected" ).val(),
  "tableid" : tableId,
  "name" : $("#load_filter_" + tableId +" option:selected" ).text(),
  "filters" : collection.filters}
  }

  var filters = new RowData({_id: aData["_id"], type: "saved_filters"});
  filters.save(aData, {success: function(model, response) {
   if (model["attributes"]["name"])
   {
   var exists = false;
   $("#load_filter_" + model["attributes"]['tableid']).each(function (){
    if (this.value == response["id"])
    {
    exists = true;
    return;
    } 
    });
   if (exists == false)
   {
   $("#load_filter_" + model["attributes"]['tableid']).append('<option value="'+response["id"]+'">'+model["attributes"]["name"]+"</option>");
   $("#load_filter_" + model["attributes"]['tableid']).val(response["id"]);
   }
   }
   }});
});

var filters = new dataGrid({type: "saved_filters", filters: {tableid: this.tableId}});
filters.fetch({success: function(collection, response, options)
  {
  optionlist = "" 
  for (i = 0; i < response.length; i++)
  {
  optionlist = optionlist + '<option value="' + response[i]["_source"]["_id"] +'">' +response[i]["_source"]["name"] + "</option>";
  }
  $("#load_filter_" +collection["filters"]["tableid"]).append(optionlist);
  }});

$("#"+this.tableId+" th").each(function(index) {
  //$(this)[0].style["max-width"] = collection.column_names[index]["width"];
  $($(this)[0]).css("min-width", collection.column_names[index]["width"]);
  $($(this)[0]).css("max-width", collection.column_names[index]["width"]);
  $(this)[0].style["width"] = collection.column_names[index]["width"];
  if (collection.column_names[index]["width"] == "32px")
  {
  $(this).children('input').remove();
  }
  $(this).children('input').attr("id", $(this).parents("table").attr('id') + '_' + $(this).children('input').attr("id"));
  if ($(this).children('input').attr('id'))
  {
  if ($(this).children('input').attr("id").match(/.+?_.+?_(.+)/)[1] == 'timestamp_start')
  {
  $(this).children('input').attr('id', $(this).children('input').attr('id') + "_gt");
  $(this).children('input').datepicker({dateFormat : "yy/mm/dd 00:00"});
  $(this).append('<br /><input type="text" id="'+$(this).parents("table").attr('id')+'_filter_timestamp_start_lt" size="10" />');
  $("#"+$(this).parents("table").attr('id')+"_filter_timestamp_start_lt").datepicker({dateFormat : "yy/mm/dd 00:00"});
  }
  $(this).children('input').bind("enterKey",function(e){
   if ($(this).val() == "") {
     obj = {};
     obj[$(this).attr("id").match(/.+?_.+?_(.+)/)[1]] = "";
     collection.search(obj);
   } else {
     obj = {};
     obj[$(this).attr("id").match(/.+?_.+?_(.+)/)[1]] =  $(this).val().split(" ");
     collection.search(obj);
   }
   return false;
   });
  $(this).children('input').keyup(function(e){
  //  if(e.keyCode == 13)
  //  {
    $(this).trigger("enterKey");
  //  }
    return false;
    });
  }
});


$("#"+this.tableId+" th.sorting").on("click", function() {
  var classList = $(this).attr('class').split(/\s+/);
  var new_sorting = $(this).attr('id').replace("sort_header_", "");
  if (_.indexOf(classList, "sorting") >= 0) {
  $(this).removeClass("sorting").addClass("sorting_desc");
  collection.triggerSort(new_sorting, "desc");
  } else if (_.indexOf(classList, "sorting_desc") >= 0) {
  $(this).removeClass("sorting_desc").addClass("sorting_asc");
  collection.triggerSort(new_sorting, "asc");
  } else {
  $(this).removeClass("sorting_asc").addClass("sorting_desc");
  collection.triggerSort(new_sorting, "desc");
  }
  $("#"+view.tableId+" .sorting_asc:not(#"+$(this).attr('id')+")").removeClass("sorting_asc").addClass("sorting");
  $("#"+view.tableId+" .sorting_desc:not(#"+$(this).attr('id')+")").removeClass("sorting_desc").addClass("sorting");
  });

var prev_top = 0;
$("#scrolling_area_"+this.tableId).on("scroll", function() {                
  if ($(this).scrollTop() != prev_top) {
  prev_top = $(this).scrollTop();
  if($(this).scrollTop() + $(this).height() >= $(this)[0].scrollHeight) {
  collection.scrollDown();
  }
  if($(this).scrollTop() == 0) {
  collection.scrollTop();
  }
  }
  });
$('#form_recherche_'+this.tableId).submit(function(e) { return false;});
$('#recherche_'+this.tableId).bind("enterKey",function(e){
  if ($(this).val() == "") {
  collection.search({}, true);
  } else {
  collection.search({"": $(this).val().split(" ")});
  }
  return false;
  });
$('#recherche_'+this.tableId).keyup(function(e){
//  if(e.keyCode == 13)
//  {
  $(this).trigger("enterKey");
//  }
  return false;

  });
this.collection.refresh();
} else {
 this.timer();
}
},
initialize: function(props){
	     this.timeout = "timeout" in props ? props.timeout : 0;
	     this.tableId = props["tableId"];
	     this.collection.on('change', this.render, this);
	     this.collection.on('add', this.onAdd, this);
	     this.collection.on('remove', this.onRemove, this);
	     this.collection.on('clear', this.onClear, this);
	    }
});
