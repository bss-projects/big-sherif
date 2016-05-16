function backtomap(mapname) {
	while (maphistory[maphistory.length - 1] != mapname) {
		maphistory.pop();
	}
	showmapcontent(mapname);
	return false;
}

function showMapline() {
	$("#mapline").html("");
	for (i = 0; i < maphistory.length; i++)
	{
		if (i != 0)
		{
		$("#mapline").append('&gt;');
		}
		$("#mapline").append('<a href="javascript:void(0)" id="mapline_'+ maphistory[i] +'">' + maphistory[i] + "</a>");
		$("#mapline_" + maphistory[i]).click(function(event) {backtomap($(event.currentTarget).attr("id").split('_').slice(1).join('_'));return false;});
	}
}

function showPopup(id, leftbul, topbul){
	var boxid = '#' + id + '-box';
	$(boxid).css("width", "50%");
	$(boxid).fadeIn();
}

function hidePopup(id, leftbul, topbul){
	var boxid = '#' + id + '-box';
	$('body').click( function() {
	
	$(boxid).fadeOut();
	return false;
	});
}

function host_status(hostname, suffix) {
			$.getJSON("/api/hosts/"+hostname+"/status", function(data) {
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
					$("#"+ hostname + "-inbox").html(html);
				};
				$("#" + hostname + "-inbox").append("</table>");
				$("#host_" + hostname + '_' + suffix ).children('i').each(function(){
						$(this).attr("title", crit["title"]);
						$(this).removeClass();
						$(this).addClass(crit["class"]);
						$(this).css("color", crit["color"]);
						});
			});
}

function map_status(mapname, suffix) {
$.getJSON("/api/cartography/" + mapname +"/status", function(data) {
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
$("#map_"+ mapname + '_' +  suffix).children('i').each(function(){
					$(this).attr("title", crit["title"]);
					$(this).removeClass();
					$(this).addClass(crit["class"]);
					$(this).css("color", crit["color"]);
					});
					});
}

function	map_status_popup(mapname, suffix)
{
tmp = setInterval(function(){
	map_status(mapname, suffix);
	}, 10000);
	timeouts.push(tmp);
	map_status(mapname, suffix);
}

function	host_status_popup(hostname, suffix) {
	tmp = setInterval(function(){
		host_status(hostname, suffix);
	}, 10000);
	timeouts.push(tmp);
		host_status(hostname, suffix);
}

function pool_status(poolname, suffix) {
	$.getJSON("/api/component_pool/" + poolname +"/status", function(data) {
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

			$("#pool_"+ poolname + '_' + suffix).children('i').each(function(){
											$(this).attr("title", crit["title"]);
											$(this).removeClass();
											$(this).addClass(crit["class"]);
											$(this).css("color", crit["color"]);
											});
	});
}

function	pool_status_popup(poolname, suffix)
{
	tmp = setInterval(function(){
	pool_status(poolname, suffix);		
	}, 10000);
	timeouts.push(tmp);
	pool_status(poolname, suffix);		
}
