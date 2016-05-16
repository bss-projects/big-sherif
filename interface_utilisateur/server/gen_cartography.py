#!/usr/bin/python

import simplejson
imagepath = "/images/cartography/"

def write_global(template, bloc):
    return template

def write_shape(template, bloc):
    if bloc[1]['icon'][0] == '/':
      template = template.replace('@@CONTENT@@', '<img class="inert-img" id="'+ bloc[1]['icon'] + bloc[1]['x'] + bloc[1]['y'] +'" src="' + bloc[1]['icon'] + '" style="position:absolute; left:'+ bloc[1]['x'] +"px; top:" + bloc[1]['y'] + 'px">\n@@CONTENT@@ ')
    else:
      template = template.replace('@@CONTENT@@', '<img class="inert-img" id="'+ bloc[1]['icon'] + bloc[1]['x'] + bloc[1]['y'] +'" src="' + imagepath + "shapes/" + bloc[1]['icon'] + '" style="position:absolute; left:'+ bloc[1]['x'] +"px; top:" + bloc[1]['y'] + 'px">\n@@CONTENT@@ ')
#    print bloc
    return template

def write_host(template, bloc):
    template = template.replace('@@CONTENT@@', """<a href='#host/""" + bloc[1]['host_name'] + """')" id='""" + bloc[1]['host_name'] + """' target='_blank' class="bullet hostbullet" rel='""" + bloc[1]['x']+ '-' + bloc[1]['y'] +"""'><i title="UNKNOWN" style="color:FireBrick;" class="icon-2x icon-question-sign"></i></a>
        <div class="popup" id='""" + bloc[1]['host_name'] + """-box'> 
                <h3>""" + bloc[1]['host_name'] + """</h3> <div id='""" + bloc[1]['host_name'] + """-inbox'>Pending</div></div> @@CONTENT@@ """)

    template = template.replace('@@SCRIPT@@', """
console.log('""" +  bloc[1]['host_name'] + """');
ep['host_""" + bloc[1]['host_name'] + '_' + bloc[1]['y'] + "px" + bloc[1]['x'] + "px" + """'] = jsPlumb.addEndpoint('""" + bloc[1]['host_name'] + """', endpointOptions );
ep['host_""" + bloc[1]['host_name'] + '_' + bloc[1]['y'] + "px" + bloc[1]['x'] + "px" + """'].setEnabled(false);
setInterval(function(){
$.getJSON("/api/hosts/"""+bloc[1]['host_name']+"""/status", function(data) {
			crit = new Object();
			    if (data["overallCriticality"] == 0) {
                                crit['title'] = "OK";
				crit['color'] = "Green";
				crit['class'] = "icon-2x icon-ok-circle";
                            }
                            if (data["overallCriticality"] == 1) {
                                crit['title'] = "WARNING";
				crit['color'] = "Gold";
				crit['class'] = "icon-2x icon-warning-sign";
                            }
                            if (data["overallCriticality"] == 4) {
                                crit['title'] = "MINEUR";
				crit['color'] = "DarkOrange";
				crit['class'] = "icon-2x icon-warning-sign";
                            }
                            if (data["overallCriticality"] == 5) {
                                crit['title'] = "MAJEUR";
				crit['color'] = "FireBrick";
				crit['class'] = "icon-2x icon-warning-sign";
                            }
                            if (data["overallCriticality"] == 2) {
                                crit['title'] = "CRITIQUE";
				crit['color'] = "FireBrick";
				crit['class'] = "icon-2x icon-remove-sign";
                            }
                            if (data["overallCriticality"] == 3) {
                                crit['title'] = "UNKNOWN";
				crit['color'] = "FireBrick";
				crit['class'] = "icon-2x icon-question-sign";
                            }
var html = "<table>";
for (x in data){
    if (typeof(data[x]) != "object")
	{
	    var i = "";
	    var item = "";
	    if (x == "overallCriticality")
		{
			i = "Criticit&eacute;";

			    if (data[x] == 0) {
				item = '<i title="OK" style="color:Green;" class="icon-2x icon-ok-circle"></i>';
                            }
                            if (data[x] == 1) {
				item = '<i title="WARNING" style="color:Gold;" class="icon-2x icon-warning-sign"></i>';
                            }
                            if (data[x] == 4) {
				item = '<i title="MINEUR" style="color:DarkOrange;" class="icon-2x icon-warning-sign"></i>';
                            }
                            if (data[x] == 5) {
				item = '<i title="MAJEUR" style="color:FireBrick;" class="icon-2x icon-warning-sign"></i>';
                            }
                            if (data[x] == 2) {
				item = '<i title="CRITIQUE" style="color:FireBrick;" class="icon-2x icon-remove-sign"></i>';
                            }
                            if (data[x] == 3) {
				item = '<i title="UNKNOWN" style="color:FireBrick;" class="icon-2x icon-question-sign"></i>';
                            }


		}
		else
		{
			i = x;
			item = data[x]
		}
	    html += "<tr><td>"+i+"</td><td>"+item+"</td></tr>";
	}
    else
	{
		services = new Array();
		html += '</table><table><thead><tr><td>Service</td><td>State</td><td>Criticality</td><td>Output</td></tr></thead>';
		for (y in data[x]){
		for (z in data[x][y])
			{
			services[z] = {};
			if (z == "criticality")
			{
			    if (data[x][y][z] == 0) {
				services[z] = '<i title="OK" style="color:Green;" class="icon-2x icon-ok-circle"></i>';
                            }
                            if (data[x][y][z] == 1) {
				services[z] = '<i title="WARNING" style="color:Gold;" class="icon-2x icon-warning-sign"></i>';
                            }
                            if (data[x][y][z] == 4) {
				services[z] = '<i title="MINEUR" style="color:DarkOrange;" class="icon-2x icon-warning-sign"></i>';
                            }
                            if (data[x][y][z] == 5) {
				services[z] = '<i title="MAJEUR" style="color:FireBrick;" class="icon-2x icon-warning-sign"></i>';
                            }
                            if (data[x][y][z] == 2) {
				services[z] = '<i title="CRITIQUE" style="color:FireBrick;" class="icon-2x icon-remove-sign"></i>';
                            }
                            if (data[x][y][z] == 3) {
				services[z] = '<i title="UNKNOWN" style="color:FireBrick;" class="icon-2x icon-question-sign"></i>';
                            }

	
			}
			else if ( z == "state")
			{
			    if (data[x][y][z] == 0) {
				services[z] = '<i title="R&eacute;tabli" style="color:Green;" class="icon-2x icon-ok-circle"></i>';
                            }
                            if (data[x][y][z] == 1) {
				services[z] = '<i title="Annul&eacute;" style="color:Green;" class="icon-2x icon-minus-sign"></i>';
                            }
                            if (data[x][y][z] == 4) {
				services[z] = '<i title="Bagot" style="color:DarkOrange;" class="icon-2x icon-exchange"></i>';
                            }
                            if (data[x][y][z] == 5) {
				services[z] = '<i title="En cours" style="color:FireBrick;" class="icon-2x icon-exclamation-sign"></i>';
                            }
                            if (data[x][y][z] == 2) {
				services[z] = '<i title="Furtif" style="color:FireBrick;" class="icon-2x icon-fighter-jet"></i>';
                            }
                            if (data[x][y][z] == 3) {
				services[z] = '<i title="Acquit&eacute;" style="color:FireBrick;" class="icon-2x icon-pushpin"></i>';
                            }

			}
			else
			{
				services[z] = data[x][y][z];
			}
			}
			html += "<tr><td>"+services["resource"]+"</td><td>"+services["state"]+"</td><td>"+services["criticality"]+"</td><td>"+services["output"]+"</td></tr>";
		};
		html += '</table><table>';
	}
	$("#"""+ bloc[1]['host_name'] + """-inbox").html(html);
};
$("#"""+ bloc[1]['host_name'] + """-inbox").append("</table>");
$('#"""+ bloc[1]['host_name'] + """').children('i').each(function(){
					$(this).attr("title", crit["title"]);
					$(this).removeClass();
					$(this).addClass(crit["class"]);
					$(this).css("color", crit["color"]);
					});
					});
	}, 10000); @@SCRIPT@@""");

#    print bloc
    return template

def write_textbox(template, bloc):
    template = template.replace('@@CONTENT@@', '<div class="inert-text" id="text_' + bloc[1]['text'] + bloc[1]['x'] + bloc[1]['y'] +'" style="position:absolute; left:' + bloc[1]['x'] +"px; top:" + bloc[1]['y'] + "px; width :" + bloc[1]['w'] + "; height :" + bloc[1]['h'] +'"><span>' + bloc[1]['text'] + '</span></div>\n@@CONTENT@@ ')
    template = template.replace('@@SCRIPT@@', """
ep['text_""" + bloc[1]['y'] +"px"+ bloc[1]['x']+"px" + """'] = jsPlumb.addEndpoint('text_""" + bloc[1]['text'] + bloc[1]['x'] + bloc[1]['y'] + """', endpointOptions );
ep['text_""" + bloc[1]['y'] +"px"+ bloc[1]['x']+"px" + """'].setEnabled(false);
@@SCRIPT@@ """);
#    print bloc
    return template

def write_map(template, bloc):
    template = template.replace('@@CONTENT@@', """<a href='/#cartography/""" + bloc[1]['map_name'] + """')" target='_blank' class="bullet" rel='""" + bloc[1]['x']+ '-' + bloc[1]['y'] +"""'><i title="UNKNOWN" style="color:FireBrick;" class="icon-2x icon-question-sign"></i></a>
        <div class="popup" id='""" + bloc[1]['map_name'] + """-box'> 
                <h3>""" + bloc[1]['map_name'] + """</h3> </div>@@CONTENT@@ """)

    template = template.replace('@@SCRIPT@@', """setInterval(function(){
$.getJSON("/api/cartography/"""+bloc[1]['map_name']+"""/status", function(data) {
			crit = new Object();
			    if (data["overallCriticality"] == 0) {
                                crit['title'] = "OK";
				crit['color'] = "Green";
				crit['class'] = "icon-2x icon-ok-circle";
                            }
                            if (data["overallCriticality"] == 1) {
                                crit['title'] = "WARNING";
				crit['color'] = "Gold";
				crit['class'] = "icon-2x icon-warning-sign";
                            }
                            if (data["overallCriticality"] == 4) {
                                crit['title'] = "MINEUR";
				crit['color'] = "DarkOrange";
				crit['class'] = "icon-2x icon-warning-sign";
                            }
                            if (data["overallCriticality"] == 5) {
                                crit['title'] = "MAJEUR";
				crit['color'] = "FireBrick";
				crit['class'] = "icon-2x icon-warning-sign";
                            }
                            if (data["overallCriticality"] == 2) {
                                crit['title'] = "CRITIQUE";
				crit['color'] = "FireBrick";
				crit['class'] = "icon-2x icon-remove-sign";
                            }
                            if (data["overallCriticality"] == 3) {
                                crit['title'] = "UNKNOWN";
				crit['color'] = "FireBrick";
				crit['class'] = "icon-2x icon-question-sign";
                            }

$('#map_"""+ bloc[1]['map_name'] + """').children('i').each(function(){
					$(this).attr("title", crit["title"]);
					$(this).removeClass();
					$(this).addClass(crit["class"]);
					$(this).css("color", crit["color"]);
					});
					});
	}, 10000); @@SCRIPT@@""");



#    print bloc
    return template

#        var e0 = jsPlumb.addEndpoint('""" + bloc[1]['e0'] + """', {});
#	e1 = jsPlumb.addEndpoint('""" + bloc[1]['e1'] + """', {});
def write_link(template, bloc):
    template = template.replace("@@SCRIPT@@", """setTimeout(function(){
        jsPlumb.connect({ source:ep['""" + bloc[1]['e0'] + """'] , target: ep['""" + bloc[1]['e1'] + """'],  connector:"Straight" });
}, 1000);
@@SCRIPT@@
""");
#    print bloc
    return template

def write_service(template, bloc):
#    print bloc
    return template

def write_hostgroup(template, bloc):
#    print bloc
    return template

def write_pool(template, bloc):
    template = template.replace('@@CONTENT@@', """<a href='/#pool/""" + bloc[1]['pool_name'] + """')" target='_blank' class="bullet" rel='""" + bloc[1]['x']+ '-' + bloc[1]['y'] +"""'><i title="UNKNOWN" style="color:FireBrick;" class="icon-2x icon-question-sign"></i></a>
        <div class="popup" id='""" + bloc[1]['pool_name'] + """-box'> 
                <h3>""" + bloc[1]['pool_name'] + """</h3> </div>@@CONTENT@@ """)

    template = template.replace('@@SCRIPT@@', """setInterval(function(){
$.getJSON("/api/component_pool/"""+bloc[1]['pool_name']+"""/status", function(data) {
			crit = new Object();
			    if (data["overallCriticality"] == 0) {
                                crit['title'] = "OK";
				crit['color'] = "Green";
				crit['class'] = "icon-2x icon-ok-circle";
                            }
                            if (data["overallCriticality"] == 1) {
                                crit['title'] = "WARNING";
				crit['color'] = "Gold";
				crit['class'] = "icon-2x icon-warning-sign";
                            }
                            if (data["overallCriticality"] == 4) {
                                crit['title'] = "MINEUR";
				crit['color'] = "DarkOrange";
				crit['class'] = "icon-2x icon-warning-sign";
                            }
                            if (data["overallCriticality"] == 5) {
                                crit['title'] = "MAJEUR";
				crit['color'] = "FireBrick";
				crit['class'] = "icon-2x icon-warning-sign";
                            }
                            if (data["overallCriticality"] == 2) {
                                crit['title'] = "CRITIQUE";
				crit['color'] = "FireBrick";
				crit['class'] = "icon-2x icon-remove-sign";
                            }
                            if (data["overallCriticality"] == 3) {
                                crit['title'] = "UNKNOWN";
				crit['color'] = "FireBrick";
				crit['class'] = "icon-2x icon-question-sign";
                            }

$('#pool_"""+ bloc[1]['pool_name'] + """').children('i').each(function(){
					$(this).attr("title", crit["title"]);
					$(this).removeClass();
					$(this).addClass(crit["class"]);
					$(this).css("color", crit["color"]);
					});
					});
	}, 10000); @@SCRIPT@@""");


#    print bloc
    return template

def write_servicegroup(template, bloc):
   return template

functions = {"global": write_global,
    "shape": write_shape,
    "host": write_host,
    "textbox": write_textbox,
    "map": write_map,
    "service": write_service,
    "hostgroup": write_hostgroup,
    "servicegroup": write_servicegroup,
    "pool": write_pool,
    "link": write_link
}

def generate_html(data):
    template = """
        @@CONTENT@@
	<script>
  endpointOptions = {
    isSource:true,
    isTarget:true,
    draggable: false,
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
	ep = new Array();

@@SCRIPT@@</script>
        """

    for bloc in data:
        func = functions[bloc[0]]
        template = func(template, bloc);

    template = template.replace('@@CONTENT@@', """
<div id="loadvnc"></div>
""")
    template = template.replace('@@SCRIPT@@', """$(function(){
    $.contextMenu({
        selector: '.hostbullet', 
        callback: function(key, options) {

	    var component = new RowData({_id: options.$trigger.attr("id"), type: "hosts"});
            var m = "clicked: " + key;
	    if (key == "hostview")
		{
			window.open(options.$trigger.attr("href"));
		}
	    if (key == "hostconnect")
		{
			component.fetch({wait: true, success: function (model,response,options) {
			window.open("http://" + model.attributes["address"]);
			}});
		}
	    if (key == "VNC")
		{
			component.fetch({wait: true, success: function (model,response,options) {
			$("#loadvnc").html('<applet archive="/static/utils/tightvnc-jviewer.jar" code="com.glavsoft.viewer.Viewer" width="1" height="1"> <param name="Host" value="' + model.attributes["address"] + '" /><param name="Port" value="5900" /></applet>Chargement du service VNC, connexion &agrave; ' + model.attributes["address"]);
			}});
		}
        },
        items: {
            "hostview": {name: "Fiche Hote", icon: "edit"},
            "hostconnect": {name: "Connection HTTP &agrave; l'h&ocirc;te", icon: "edit"},
            "VNC": {name: "Connection VNC &agrave; l'h&ocirc;te", icon: "edit"},
            "sep1": "---------",
            "quit": {name: "Quit", icon: "quit"}
        }
    });
    
});
""")
    return template

    
def generate_js(data):
    template = """
var initMap = function(){

/* Show jQuery is running */
$('#map').css({
		height: '"""+str(data.get("height","500"))+"""px'
});
$('#map').zoommap({
		// Width and Height of the Map
		width: '"""+str(data.get("width","500"))+"""px',
		height: '"""+str(data.get("height","500"))+"""px',
			
		//Misc Settings
		blankImage: 'images/blank.gif',
		zoomDuration: 1000,
		bulletWidthOffset: '12px',
		bulletHeightOffset: '12px',
		
		//ids and classes
		zoomClass: 'zoomable',
		popupSelector: 'div.popup',
		popupCloseSelector: 'a.close',
		
		//Return to Parent Map Link
		showReturnLink: true,
		returnId: 'returnlink',
		returnText: 'return to """+data.get("id", data.get("parent", "previous"))+""" map',
		
		//Initial Region to be shown
		map: 
        """+simplejson.dumps(data["map"])+"""
	 });
	}
$(document).ready(initMap);
    """


    return template
