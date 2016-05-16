function saveMap()
{
	map = new Array(); 
	map["blocks"] = new Array();
	if (document.forms["map"]["mapname"].value != "")
	{
		map["_id"] = document.forms["map"]["mapname"].value;
		map["blocks"].push([ "global", {map_name: document.forms["map"]["mapname"].value}]);
	}
	else
	{
		mapname = window.prompt("Nom de la carte ?", "Carte2");
		if (mapname == null)
		{
			return false;
		}
		map["_id"] = mapname;
		map["blocks"].push(["global", {map_name: mapname}]);
	}
	var cartography = new RowData({_id : map["_id"], type : "cartography"});
	maps = $("#map").find('.map');
	hosts = $("#map").find('.host');
	pictures = $("#map").find('.picture');
	pools = $("#map").find('.pool');
	texts = $("#map").find('.text');
	links = jsPlumb.getConnections();

	$.each(maps, function (i) {
		map["blocks"].push(["map", {x: $(maps[i]).css("left").replace("px",""), y: $(maps[i]).css("top").replace("px",""), map_name: $(maps[i]).children("i").attr("title").split(":").pop().trim()}]);
	});
	$.each(hosts, function (i) {
		map["blocks"].push(["host", {x: $(hosts[i]).css("left").replace("px",""), y: $(hosts[i]).css("top").replace("px",""), host_name: $(hosts[i]).attr("href").split("/").pop()}]);
	});
	$.each(pictures, function (i) {
		map["blocks"].push(["shape", {x: $(pictures[i]).css("left").replace("px",""), y: $(pictures[i]).css("top").replace("px",""), icon: $(pictures[i]).children("img").attr("src")}]);
	});
	$.each(pools, function (i) {
		map["blocks"].push(["pool", {x: $(pools[i]).css("left").replace("px",""), y: $(pools[i]).css("top").replace("px",""), pool_name: $(pools[i]).attr("href").split("/").pop()}]);
	});
	$.each(texts, function (i) {
		map["blocks"].push(["textbox", {x: $(texts[i]).css("left").replace("px",""), y: $(texts[i]).css("top").replace("px",""), w: $(texts[i]).css("width").replace("px",""), h: $(texts[i]).css("height").replace("px",""), text: $(texts[i]).children("span").html()}]);
	});
	$.each(links, function (i) {
		map["blocks"].push(["link", {"e0": $(links[i]["source"]).attr("id").split('_').slice(0, -1).join('_') + '_' + $(links[i]["source"]).css("top") + $(links[i]["source"]).css("left"), "e1" :  $(links[i]["target"]).attr("id").split('_').slice(0, -1).join('_') + '_' + $(links[i]["target"]).css("top") + $(links[i]["target"]).css("left")}]);
	});


	cartography.save(map, {success: function(model, response) { alert ("Enregistrement de "+map["_id"]+" terminé"); }});
}


function removeelement(element, ep) {
console.log(ep);
console.log(element);
console.log(ep[$(element).attr("id")]);
jsPlumb.detachAllConnections(element);
jsPlumb.deleteEndpoint(ep[$(element).attr("id")]);
element.remove();
}

function placehostonmap(hosttop, hostleft, hostname, activate = 0)
{
	$('#map').append('<a id="host_'+hostname+'_'+hosttop+hostleft+'" target="_blank" href="#host/'+hostname+'" class="host" style="left: '+hostleft+'; top: '+hosttop+'; position:absolute;" class="draggable"> <i class="icon-2x icon-question-sign" style="color: grey" title="Host : '+hostname+'"> </i></a></div>');
  jsPlumb.addEndpoint("host_"+hostname+'_'+hosttop+hostleft, endpointOptions );

	if (activate == 1) {
		$('#map').append('<div class="popup" id="' + hostname + '-box" ><h3>' + hostname + '</h3><div id="' + hostname + '-inbox"></div></div>');
		$("#host_"+hostname+'_'+hosttop+hostleft).hover(function(){showPopup(hostname);}, function(){hidePopup(hostname);});
		host_status_popup(hostname, hosttop+hostleft);
	}
	else {
		var menu1 = [ {'Supprimer':function(menuItem,menu) { removeelement(menu["target"], ep);}} ];
		$("#host_"+ hostname +'_'+hosttop+hostleft).contextMenu(menu1,{theme:'vista'});
		jsPlumb.draggable("host_"+hostname+'_'+hosttop+hostleft);
	}
}

function addhostonmap(input)
{
	hosttop = $(input).parent().css("top");
	hostleft = $(input).parent().css("left");
	hostname = $(input).parent().children("input").val();
	$(input).parent().remove();
	placehostonmap(hosttop, hostleft,hostname);
}

function placepoolonmap(pooltop, poolleft, poolname, activate = 0)
{
	$('#map').append('<a id="pool_'+poolname+'_'+pooltop+poolleft+'" target="_blank" href="#pool/'+poolname+'" class="pool" style="left: '+poolleft+'; top: '+pooltop+'; position:absolute;" class="draggable"> <i class="icon-2x icon-question-sign" style="color: grey" title="Pool : '+poolname+'"> </i></a></div>');

  jsPlumb.addEndpoint("pool_"+poolname+'_'+pooltop+poolleft, endpointOptions );
	
	if (activate == 1) {
		$('#map').append('<div class="popup" id="' + poolname + '-box" ><h3>' + poolname + '</h3><div id="' + poolname + '-inbox"></div></div>');
		$("#map_"+ poolname +'_'+pooltop+poolleft).hover(function(){showPopup(poolname, suffix);}, function(){hidePopup(poolname, suffix);});
		pool_status_popup(poolname, pooltop+poolleft);
	}
	else {
		var menu1 = [ {'Supprimer':function(menuItem,menu) { removeelement(menu["target"], ep);}} ];
		$("#pool_"+ poolname +'_'+pooltop+poolleft).contextMenu(menu1,{theme:'vista'});
		jsPlumb.draggable("pool_"+poolname+'_'+pooltop+poolleft);
	}

}

function addpoolonmap(input)
{
	pooltop = $(input).parent().css("top");
	poolleft = $(input).parent().css("left");
	poolname = $(input).parent().children("input").val();
	$(input).parent().remove();
	placepoolonmap(pooltop, poolleft,poolname);
}

function placemaponmap(maptop, mapleft,mapname, activate = 0)
{
	$('#map').append('<a id="map_'+mapname+'_'+maptop+mapleft+'" href="javascript:void(0);" class="map" style="left: '+mapleft+'; top: '+maptop+'; position:absolute;" class="draggable"> <i class="icon-2x icon-question-sign" style="color: grey" title="map : '+mapname+'"> </i></a></div>');

	jsPlumb.addEndpoint("map_"+mapname+'_'+maptop+mapleft, endpointOptions );
	if (activate == 1) {
		$("#map_" +mapname + '_' + maptop + mapleft).click(function(event) {
		console.log('truc');
		console.log(maphistory);
		console.log(mapname);
		maphistory.push(document.forms["map"]["mapname"].value);
		showmapcontent(mapname);
	});
	

		$('#map').append('<div class="popup" id="' + mapname + '-box" ><h3>' + mapname+ '</h3><div id="' + mapname+ '-inbox"></div></div>');
//		$("#map_"+ mapname+'_'+maptop+mapleft).hover(function(){showPopup(mapname, suffix);}, function(){hidePopup(mapname, suffix);});
		map_status_popup(mapname, maptop+mapleft);
	}
	else {
		var menu1 = [ {'Supprimer':function(menuItem,menu) { removeelement(menu["target"], ep);}} ];
		$("#map_"+mapname+'_'+maptop+mapleft ).contextMenu(menu1,{theme:'vista'});
		jsPlumb.draggable("map_"+mapname+'_'+maptop+mapleft);
	}
}

function addmaponmap(input)
{
	maptop = $(input).parent().css("top");
	mapleft = $(input).parent().css("left");
	mapname = $(input).parent().children("input").val();
	$(input).parent().remove();
	placemaponmap(maptop, mapleft, mapname);
}

function placetextonmap(texttop, textleft,text, activate = 0)
{
	$("#map").append('<div id="text_'+texttop+textleft+'" class="text" style="left: '+textleft+'; top: '+texttop+'; position:absolute;"> <span>'+text+'</span></a></div>');

  jsPlumb.addEndpoint('text_'+texttop+textleft, endpointOptions );
  if (activate == 0) {
		var menu1 = [ {'Supprimer':function(menuItem,menu) { removeelement(menu["target"], ep);}} ];
		$("#text_"+texttop+textleft ).contextMenu(menu1,{theme:'vista'});
		jsPlumb.draggable('text_'+texttop+textleft);
	}
}

function addtextonmap(input)
{
	texttop = $(input).parent().css("top");
	textleft = $(input).parent().css("left");
	text = $(input).parent().children("input").val();
	$(input).parent().remove();
	placetextonmap(texttop, textleft, text);
}

function placepictureonmap(picturetop, pictureleft,picture, activate = 0)
{
	$("#map").append('<div id="picture_'+picturetop+pictureleft+'" class="picture" style="left: '+pictureleft+'; top: '+picturetop+'; position:absolute;"> <img src="'+picture+'"/></div>');


  jsPlumb.addEndpoint('picture_'+picturetop+pictureleft, endpointOptions );
	if (activate == 0) {
		var menu1 = [ {'Supprimer':function(menuItem,menu) { removeelement(menu["target"], ep);}} ];
		$("#picture_"+picturetop+pictureleft).contextMenu(menu1,{theme:'vista'});
	  jsPlumb.draggable('picture_'+picturetop+pictureleft);
	}
	else {
	}
}

function addpictureonmap(input)
{
	console.log(input);
	picturetop = $(input).parent().css("top");
	pictureleft = $(input).parent().css("left");
	picture = $(input).parent().children("input").val();
	$(input).parent().remove();
	if (picture == "")
		return;
	placepictureonmap(picturetop, pictureleft, picture);
}

function putatext(that)
{
	$('#map').append('<form action="javascript:void(0)" style="top: '+that.css("top")+';left: '+that.css("left")+';position: absolute;">T <input type="text" name="newtext" id="newtext_'+that.css("top")+'_'+that.css("left")+'" /><input type="submit" value="Ajouter" onclick="addtextonmap(this);"/></form>');
}

function putapicture(that)
{
	$('#map').append('<form action="javascript:void(0)" style="top: '+that.css("top")+';left: '+that.css("left")+';position: absolute;"><i title="New picture" class="icon-2x icon-picture"></i><input type="text" name="newpict" id="newpict_'+that.css("top")+'_'+that.css("left")+'" /><input type="submit" value="Ajouter" onclick="addpictureonmap(this);"/></form>');

	function split( val ) {
		return val.split( /,\s*/ );
	}
	function extractLast( term ) {
		return split( term ).pop();
	}

	$( "#newpict_"+that.css("top")+'_'+that.css("left") )
		// don't navigate away from the field on tab when selecting an item
		.bind( "keydown", function( event ) {
				if ( event.keyCode === $.ui.keyCode.TAB &&
					$( this ).data( "ui-autocomplete" ).menu.active ) {
				event.preventDefault();
				}
				})
	.autocomplete({
source: function( request, response ) {
$.getJSON( "/api/images/" + extractLast( request.term ) , {
term: extractLast( request.term )
}, response );
},
search: function() {
// custom minLength
var term = extractLast( this.value);
if ( term.length < 2 ) {
return false;
}
},
focus: function() {
// prevent value inserted on focus
return false;
},
select: function( event, ui ) {
var terms = split( this.value );
// remove the current input
terms.pop();
// add the selected item
terms.push( ui.item.value );
// add placeholder to get the comma-and-space at the end
terms.push( "" );
this.value = terms.join( "" );
return false;
	}
});

}

function putahost(that)
{
	$("#map").append('<form action="javascript:void(0)" style="top: '+that.css("top")+';left: '+that.css("left")+';position: absolute;"><i title="New host" class="icon-2x icon-hdd"></i> <input type="text" name="newhost" id="newhost_'+that.css("top")+'_'+that.css("left")+'" /><input type="submit" value="Ajouter" onclick="addhostonmap(this);"/></form>');
 $(that).remove();


	function split( val ) {
		return val.split( /,\s*/ );
	}
	function extractLast( term ) {
		return split( term ).pop();
	}

	$( "#newhost_"+newelem.css("top")+'_'+newelem.css("left") )
		// don't navigate away from the field on tab when selecting an item
		.bind( "keydown", function( event ) {
				if ( event.keyCode === $.ui.keyCode.TAB &&
					$( this ).data( "ui-autocomplete" ).menu.active ) {
				event.preventDefault();
				}
				})
	.autocomplete({
source: function( request, response ) {
$.getJSON( "/api/hosts/" + extractLast( request.term ) + "/list", {
term: extractLast( request.term )
}, response );
},
search: function() {
// custom minLength
var term = extractLast( this.value);
if ( term.length < 2 ) {
return false;
}
},
focus: function() {
// prevent value inserted on focus
return false;
},
select: function( event, ui ) {
var terms = split( this.value );
// remove the current input
terms.pop();
// add the selected item
terms.push( ui.item.value );
// add placeholder to get the comma-and-space at the end
terms.push( "" );
this.value = terms.join( "" );
return false;
	}
});
}

function putapool(that)
{
	$("#map").append('<form action="javascript:void(0)" style="top: '+that.css("top")+';left: '+that.css("left")+';position: absolute;"><i title="New pool" class="icon-2x icon-th"></i> <input type="text" name="newpool" id="newpool_'+that.css("top")+'_'+that.css("left")+'" /><input type="submit" value="Ajouter" onclick="addpoolonmap(this);"/></form>');
 $(that).remove();


	function split( val ) {
		return val.split( /,\s*/ );
	}
	function extractLast( term ) {
		return split( term ).pop();
	}

	$( "#newpool_"+newelem.css("top")+'_'+newelem.css("left") )
		// don't navigate away from the field on tab when selecting an item
		.bind( "keydown", function( event ) {
				if ( event.keyCode === $.ui.keyCode.TAB &&
					$( this ).data( "ui-autocomplete" ).menu.active ) {
				event.preventDefault();
				}
				})
	.autocomplete({
source: function( request, response ) {
$.getJSON( "/api/pools/" + extractLast( request.term ) + "/list", {
term: extractLast( request.term )
}, response );
},
search: function() {
// custom minLength
var term = extractLast( this.value);
if ( term.length < 2 ) {
return false;
}
},
focus: function() {
// prevent value inserted on focus
return false;
},
select: function( event, ui ) {
var terms = split( this.value );
// remove the current input
terms.pop();
// add the selected item
terms.push( ui.item.value );
// add placeholder to get the comma-and-space at the end
terms.push( "" );
this.value = terms.join( "" );
return false;
	}
});
}

function putamap(that)
{
	$("#map").append('<form action="javascript:void(0)" style="top: '+that.css("top")+';left: '+that.css("left")+';position: absolute;"><i title="New map" class="icon-2x icon-sitemap"></i> <input type="text" name="newmap" id="newmap_'+that.css("top")+'_'+that.css("left")+'" /><input type="submit" value="Ajouter" onclick="addmaponmap(this);"/></form>');
 $(that).remove();


	function split( val ) {
		return val.split( /,\s*/ );
	}
	function extractLast( term ) {
		return split( term ).pop();
	}

	$( "#newmap_"+newelem.css("top")+'_'+newelem.css("left") )
		// don't navigate away from the field on tab when selecting an item
		.bind( "keydown", function( event ) {
				if ( event.keyCode === $.ui.keyCode.TAB &&
					$( this ).data( "ui-autocomplete" ).menu.active ) {
				event.preventDefault();
				}
				})
	.autocomplete({
source: function( request, response ) {
$.getJSON( "/api/maps/" + extractLast( request.term ) + "/list", {
term: extractLast( request.term )
}, response );
},
search: function() {
// custom minLength
var term = extractLast( this.value);
if ( term.length < 2 ) {
return false;
}
},
focus: function() {
// prevent value inserted on focus
return false;
},
select: function( event, ui ) {
var terms = split( this.value );
// remove the current input
terms.pop();
// add the selected item
terms.push( ui.item.value );
// add placeholder to get the comma-and-space at the end
terms.push( "" );
this.value = terms.join( "" );
return false;
	}
});
}

function placelinkonmap(e0, e1)
{
	jsPlumb.connect({source: e0, target: e1});
}

function createmapinit()
{

	$("#navbar").draggable({
	stop: function() {
		$('.dragmenu').draggable({helper: "clone"});
	}});
	$('.dragmenu').draggable({helper: "clone"});
  $("#save").on('click', function() {saveMap()});
	$("#map").droppable({
		drop: function (event, ui) {
			if ($(ui.helper).attr("id") != "navbar")
				{
				newelem = $(ui.helper).clone();
				if ($(ui.helper.context).attr("id") == "newtext")
					{
						putatext(newelem);
					}
				if ($(ui.helper.context).attr("id") == "newhost")
					{
						putahost(newelem);
					}
				if ($(ui.helper.context).attr("id") == "newpool")
					{
						putapool(newelem);
					}
				if ($(ui.helper.context).attr("id") == "newmap")
					{
						putamap(newelem);
					}
				if ($(ui.helper.context).attr("id") == "newpicture")
					{
						putapicture(newelem);
					}
				}
		}
	});

  
	endpointOptions = { 
		isSource:true,
		isTarget:true,
		endpoint: ["Rectangle", {cssClass: "endpoint"}],
		maxConnections: -1,
    paintStyle: {
        strokeStyle: "lightgrey",
				fillStyle: "lightgrey",
        lineWidth: 3,
				width: 40,
				height: 40
    },
    connector: ["Straight", {}],
		connectorStyle: {
      strokeStyle: "black",
			lineWidth: 3},
		hoverPaintStyle: { strokeStyle: "#2e2aF8", lineWidth: 8 },
		anchors: ["Center"]
	}; 
};

function editmapinit(id) {
	document.oncontextmenu = new Function('return false');
	createmapinit();

	$.getJSON('/api/cartography/'+id, "", function(data)
		{
			$('body').append('<form name=map><input type=hidden name=mapname></form>');
			document.forms["map"]["mapname"].value = data["_id"];


			for (var i=0;i <  data["blocks"].length; i++) {
				if (data["blocks"][i][0] == "global") {
					if (data["blocks"][i][1]["map_image"]) {
						placepictureonmap("0px", "0px", "/images/cartography/" + data["blocks"][i][1]["map_image"]);
					}
				}
				if (data["blocks"][i][0] == "map") {
					placemaponmap(data["blocks"][i][1]["y"]+"px", data["blocks"][i][1]["x"]+"px", data["blocks"][i][1]["map_name"]);
				}
				if (data["blocks"][i][0] == "host") {
					placehostonmap(data["blocks"][i][1]["y"]+"px", data["blocks"][i][1]["x"]+"px", data["blocks"][i][1]["host_name"]);
				}
				if (data["blocks"][i][0] == "shape") {
					if (data["blocks"][i][1]["icon"][0] == "/") {
						placepictureonmap(data["blocks"][i][1]["y"]+"px", data["blocks"][i][1]["x"]+"px", data["blocks"][i][1]["icon"]);
					}
					else {
						placepictureonmap(data["blocks"][i][1]["y"]+"px", data["blocks"][i][1]["x"]+"px", "/images/cartography/shapes/" + data["blocks"][i][1]["icon"]);
					}
				}
				if (data["blocks"][i][0] == "textbox") {
					placetextonmap(data["blocks"][i][1]["y"]+"px", data["blocks"][i][1]["x"]+"px", data["blocks"][i][1]["text"]);
				}
				if (data["blocks"][i][0] == "pool") {
					placepoolonmap(data["blocks"][i][1]["y"]+"px", data["blocks"][i][1]["x"]+"px", data["blocks"][i][1]["pool_name"]);
				}
			}
			ep = new Array();
			jsPlumb.selectEndpoints().each(function(endpoint) {
				ep[$(endpoint.element).attr("id")] = endpoint;
				var menu1 = [ {'Supprimer':function(menuItem,menu) { removeelement(menu["target"], ep);}} ];
				$("#" + endpoint.elementId).contextMenu(menu1,{theme:'vista'});
			}
			);
			for (i=0;i <  data["blocks"].length; i++) {
				if (data["blocks"][i][0] == "link") {
					placelinkonmap(ep[data["blocks"][i][1]["e0"]], ep[data["blocks"][i][1]["e1"]]);
				}
			}
		})
}

function showmapcontent(id)
{
	showMapline();
	for (i = 0; i < timeouts.length; i++) {
		clearInterval(timeouts[i]);
	}
	$.getJSON('/api/cartography/'+id, "", function(data)
		{
			$("#map").html("");
			document.forms["map"]["mapname"].value = data["_id"];
			for (var i=0;i <  data["blocks"].length; i++) {
				if (data["blocks"][i][0] == "global") {
					if (data["blocks"][i][1]["map_image"]) {
						placepictureonmap("0px", "0px", "/images/cartography/" + data["blocks"][i][1]["map_image"]);
					}
				}
				if (data["blocks"][i][0] == "map") {
					placemaponmap(data["blocks"][i][1]["y"]+"px", data["blocks"][i][1]["x"]+"px", data["blocks"][i][1]["map_name"], 1);
				}
				if (data["blocks"][i][0] == "host") {
					placehostonmap(data["blocks"][i][1]["y"]+"px", data["blocks"][i][1]["x"]+"px", data["blocks"][i][1]["host_name"], 1);
				}
				if (data["blocks"][i][0] == "shape") {
					if (data["blocks"][i][1]["icon"][0] == "/") {
						placepictureonmap(data["blocks"][i][1]["y"]+"px", data["blocks"][i][1]["x"]+"px", data["blocks"][i][1]["icon"], 1);
					}
					else {
						placepictureonmap(data["blocks"][i][1]["y"]+"px", data["blocks"][i][1]["x"]+"px", "/images/cartography/shapes/" + data["blocks"][i][1]["icon"], 1);
					}
				}
				if (data["blocks"][i][0] == "textbox") {
					placetextonmap(data["blocks"][i][1]["y"]+"px", data["blocks"][i][1]["x"]+"px", data["blocks"][i][1]["text"], 1);
				}
				if (data["blocks"][i][0] == "pool") {
					placepoolonmap(data["blocks"][i][1]["y"]+"px", data["blocks"][i][1]["x"]+"px", data["blocks"][i][1]["pool_name"], 1);
				}
			}
			ep = new Array();
			jsPlumb.selectEndpoints().each(function(endpoint) {
				ep[$(endpoint.element).attr("id")] = endpoint;
				endpoint.setEnabled(false);
			}
			);
			for (i=0;i <  data["blocks"].length; i++) {
				if (data["blocks"][i][0] == "link") {
					placelinkonmap(ep[data["blocks"][i][1]["e0"]], ep[data["blocks"][i][1]["e1"]]);
				}
			}
		})
}

function showmap(id) {
	endpointOptions = { 
		isSource:true,
		isTarget:true,
		endpoint: ["Rectangle", {cssClass: "endpoint"}],
		maxConnections: -1,
    paintStyle: {
        strokeStyle: "lightgrey",
				fillStyle: "lightgrey",
        lineWidth: 3,
				width: 40,
				height: 40
    },
    connector: ["Straight", {}],
		connectorStyle: {
      strokeStyle: "black",
			lineWidth: 3},
		hoverPaintStyle: { strokeStyle: "#2e2aF8", lineWidth: 8 },
		anchors: ["Center"]
	}; 

	$('body').append('<form name=map><input type=hidden name=mapname></form>');
	showmapcontent(id);
}

