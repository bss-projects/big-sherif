#!/usr/bin/python

import json
imagepath = "/images/"

f = open('test', 'r')
fc = f.read()
data = json.loads(fc)

template = """
<div id="@@MAPID@@">
@@CONTENT@@
</div>
"""

def write_global(template):
	template = template.replace('@@MAPID@@', bloc[1]["map_name"])
	return template

def write_shape(template):
	template = template.replace('@@CONTENT@@', '<img src="' + imagepath + bloc[1]['icon'] + '" style="position:absolute; left:'+ bloc[1]['x'] +"; top:" + bloc[1]['y'] + '">\n@@CONTENT@@')
	print bloc
	return template

def write_host(template):
	template = template.replace('@@CONTENT@@', """<div class="popupcontent"> 
                </div>
                <a class="close" href="javascript:void(0)">Close</a> 
        </div><a href="javascript:showHostDetail('""" + bloc[1]['host_name'] + """')" id='"""+ bloc[1]['host_name'] + """' class="bullet" rel='""" + bloc[1]['x']+ '-' + bloc[1]['y'] +"""'><img src='/ws/getStatus.php?image=1&type=host&name=""" + bloc[1]['host_name'] + """' title="" /></a>
        <div class="popup" id='""" + bloc[1]['host_name'] + """-box'> 
                <h3>""" + bloc[1]['host_name'] + """</h3> @@CONTENT@@
""")

	print bloc
	return template

def write_textbox(template):
	template = template.replace('@@CONTENT@@', '<div style="position:absolute; left:' + bloc[1]['x'] +"; top:" + bloc[1]['y'] + '">' + bloc[1]['text'] + '</div>\n@@CONTENT@@')
	print bloc
	return template

def write_map(template):
	template = template.replace('@@CONTENT@@', """<div class="popupcontent"> 
                </div>
                <a class="close" href="javascript:void(0)">Close</a> 
        </div><a href="javascript:showHostDetail('""" + bloc[1]['map_name'] + """')" id='"""+ bloc[1]['host_name'] + """' class="bullet" rel='""" + bloc[1]['x']+ '-' + bloc[1]['y'] +"""'><img src='/ws/getStatus.php?image=1&type=map&name=""" + bloc[1]['map_name'] + """' title="" /></a>
        <div class="popup" id='""" + bloc[1]['map_name'] + """-box'> 
                <h3>""" + bloc[1]['map_name'] + """</h3> @@CONTENT@@
""")


	print bloc
	return template

def write_service(template):
	print bloc
	return template

def write_hostgroup(template):
	print bloc
	return template

def write_pool(template):
	print bloc
	return template

def write_servicegroup(template):
	return template

functions = {"global": write_global,
	"shape": write_shape,
	"host": write_host,
	"textbox": write_textbox,
	"map": write_map,
	"service": write_service,
	"hostgroup": write_hostgroup,
	"servicegroup": write_servicegroup,
	"pool": write_pool
}

for bloc in data:
	func = functions[bloc[0]]
	template = func(template);


template = template.replace('@@CONTENT@@', '')
print template
