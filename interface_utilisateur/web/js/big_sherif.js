function big_sherif() {
// big_sherif plugin
}

function declare_ticket() {
		
	// $("#ticket_form").removeClass("notice error");
	// $("#ticket_form").html("");
	var monObj = {};
	if (document.forms["ticket_form"]["event_id"].value != "")
	{
		monObj["event_id"] = document.forms["ticket_form"]["event_id"].value
	}
	monObj["intitule_incident"] = document.forms["ticket_form"]["intitule_incident"].value;
	monObj["type_action"] = document.forms["ticket_form"]["type_action"].value;
	monObj["organisation_emettrice"] = (document.forms["ticket_form"]["organisation_emettrice"].value ? document.forms["ticket_form"]["desc"].value : "");
	monObj["nos_references"] = document.forms["ticket_form"]["nos_references"].value;
	monObj["vos_references"] = document.forms["ticket_form"]["vos_references"].value;
	monObj["date_heure_action"] = document.forms["ticket_form"]["date_heure_action"].value;
	monObj["code_refpat"] = document.forms["ticket_form"]["code_refpat"].value;
	monObj["nom_inventeur"] = document.forms["ticket_form"]["nom_inventeur"].value;
	monObj["nom_signaleur"] = document.forms["ticket_form"]["nom_signaleur"].value;
	monObj["telephone_inventeur"] = document.forms["ticket_form"]["telephone_inventeur"].value;
	monObj["telephone_signaleur"] = document.forms["ticket_form"]["telephone_signaleur"].value;
	monObj["pk_debut"] = document.forms["ticket_form"]["pk_debut"].value;
	monObj["pk_fin"] = document.forms["ticket_form"]["pk_fin"].value;
	monObj["libelle_lieu"] = document.forms["ticket_form"]["libelle_lieu"].value;
	monObj["code_file"] = document.forms["ticket_form"]["code_file"].value;
	monObj["description_equipement"] = document.forms["ticket_form"]["description_equipement"].value;
	monObj["code_ees_sagai"] = document.forms["ticket_form"]["code_ees_sagai"].value;
	monObj["num_ees_equipement"] = document.forms["ticket_form"]["num_ees_equipement"].value;
	monObj["code_gmao"] = document.forms["ticket_form"]["code_gmao"].value;
	monObj["description_anomalie"] = document.forms["ticket_form"]["description_anomalie"].value;
	monObj["code_anomalie"] = document.forms["ticket_form"]["code_anomalie"].value;
	monObj["situation_inacceptable"] = document.forms["ticket_form"]["situation_inacceptable"].value;
	monObj["critere_nettete"] = document.forms["ticket_form"]["critere_nettete"].value;
	monObj["equipement_sensible"] = document.forms["ticket_form"]["equipement_sensible"].value;
	monObj["zone_critique"] = document.forms["ticket_form"]["zone_critique"].value;
	monObj["destinataire_depeche"] = document.forms["ticket_form"]["destinataire_depeche"].value;
	monObj["num_equipe_dediee"] = document.forms["ticket_form"]["num_equipe_dediee"].value;
	monObj["niveau_urgence"] = document.forms["ticket_form"]["niveau_urgence"].value;
	monObj["etat_equipement"] = document.forms["ticket_form"]["etat_equipement"].value;
	monObj["delai_resolution"] = document.forms["ticket_form"]["delai_resolution"].value;
	monObj["commentaire"] = document.forms["ticket_form"]["commentaire"].value;
	monObj["journal_supervision"] = document.forms["ticket_form"]["journal_supervision"].value;
	monObj["url_document_associe"] = document.forms["ticket_form"]["url_document_associe"].value;
	monObj["copie_pour_info"] = document.forms["ticket_form"]["copie_pour_info"].value;
	monObj["commentaire_lieu"] = document.forms["ticket_form"]["commentaire_lieu"].value;
	monObj["code_reparation"] = document.forms["ticket_form"]["code_reparation"].value;
	monObj["version"] = document.forms["ticket_form"]["version"].value;

	$.ajax({
			type: "POST",
			url: "/api/declare_ticket",
			data: monObj,
			contentType: "application/json; charset=utf-8",
			dataType: "json"
		}).done(function() { alert("L'incident est correctement enregistre dans OSS"); });

	// var error = 0;
	// if (monObj["pool_name"] == "") 
	// {
	// 	$("#poolnotice").addClass("notice error");
	// 	$("#poolnotice").append("Vous devez rentrer un nom de regroupement !<br>");
	// 	error = 1;
	// }
	// if (monObj["pool_type_name"] == "") 
	// {
	// 	$("#poolnotice").addClass("notice error");
	// 	$("#poolnotice").append("Vous devez rentrer un type de pool !<br>");
	// 	error = 1;
	// }

	// if (error == 1)
	// {
	// 	return;
	// }
};

function addUser() {
	var monObj = {};
	//monObj["_id"] = (document.forms["addauser"]["id"].value != "" ? document.forms["addauser"]["id"].value : undefined) ;
	monObj["_id"] = document.forms["addauser"]["username"].value;
	monObj["username"] = document.forms["addauser"]["username"].value;
	monObj["last_name"] = document.forms["addauser"]["nom"].value;
	monObj["first_name"] = document.forms["addauser"]["prenom"].value;
	monObj["email"] = document.forms["addauser"]["email"].value;
	monObj["password"] = $.md5(document.forms["addauser"]["password"].value);
	monObj["type"] = "user";
    
	var error = 0;
	if (monObj["username"] == "") 
	{
		$("#usernotice").addClass("notice error");
                $("#usernotice").append("Vous devez rentrer un nom d'utilisateur !<br>");
		error = 1;
	}
	
	if (error == 1)
	{
		return;
	}
	if (document.forms["addauser"]["oldpassword"] == "0")
	{
	if (monObj["password"] == "") 
	{
		if (!confirm("Voulez vous vraiment ne pas mettre de mot de passe ?"))
		{
			return;	
		}
	}
	}
	else 
	{
	//delete monObj["password"];
	}

	monObj["groups"] = [];
	$('#adduserdlg :checked').each(function() {
		monObj["groups"][monObj["groups"].length] = $(this).attr("id").replace("checkusergroup", "");
	});

    // UPDATE ET POST A LA FOIS CA MARCHE C'EST BEAU
	// SAUF QUAND TU VEUX INSERT UN TRUC QUI EXISTE DEJA ET QUE EN FAIT CA UPDATE APRES T'A L'AIR CON
    var user = new RowData({_id: monObj["_id"], type: "userlist"});
    user.save(monObj, {success: function(model, response) {
                big_sherif.userList.scrollTop();
            }});
    // FIN

	document.forms["addauser"].reset();
        $( "#adduserdlg" ).dialog( "close" );
        $( "#adduserbtn" ).click(function() {
                        $( "#adduserdlg" ).dialog( "open" );
                        });

};

function editUser(id) {
	if (id)
	{
		var truc = $( "#adduserdlg" ).prev().html();
		$( "#adduserdlg" ).prev().html(truc.replace("Ajout", "Edition"));
		$( "#adduserdlg" ).attr("title", "Edition d'un utilisateur");
		var user = new RowData({_id: id, type: "userlist"});
		user.fetch({
                        success: function (model, response, options){
		$("#adduserdlg").load("/static/templates/adduserdlg.html", function(){
			var monObj = model.toJSON();
			document.forms["addauser"]["id"].value = monObj["_id"];
			document.forms["addauser"]["username"].value = monObj["username"];
			document.forms["addauser"]["nom"].value = (monObj["last_name"] ? monObj["last_name"] : "");
			document.forms["addauser"]["prenom"].value = (monObj["first_name"]? monObj["first_name"] : "");
			document.forms["addauser"]["email"].value = (monObj["email"] ? monObj["email"] : "");
			// BUG : toujours 1 car null et  non pas undefined pour 2, enfin, je crois
			document.forms["addauser"]["oldpassword"].value = (monObj["password"] ? "1" : "2");
			document.forms["addauser"]["username"].disabled = true;
			$( "#adduserdlg" ).on("dialogclose", function() {
				 $('#adduserdlg :checked').each(function() { $(this).prop('checked', false); })
				document.forms['addauser']['id'].value = '';
				$('#usernotice').removeClass('notice error');$('#usernotice').html('');
				
				
			});
			$( "#adduserdlg" ).dialog({
				autoOpen: false,
				width: 500,
				show: {
					effect: "blind",
					duration: 100
					},
				hide: {
					effect: "blind",
					duration: 100
					},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

				});
                                $( "#adduserbtn" ).click(function() {
                                        $( "#adduserdlg" ).dialog( "open" );
					});
				var groupList = new dataGrid({
					type: "grouplist",
			               sorting: "_id",
			               column_names: [
					{
					        label: "",
				        	field: "_id",
						css_class: "column_fiche",
			                        width: "32px",
			                        format: function(data) {
						var checked = "";
						for (var i=0; monObj["groups"][i]; i++)
						{
							if (monObj["groups"][i] == data)
							{
								checked = ' checked="checked" ';
							}
						}
						return '<input id="checkusergroup'+data+'" type="checkbox"'+ checked +' />';
						}
					},
					{
						label: "Nom",
						field: "groupname",
						width: "160px",
						format: function(data) {
						return data;
						}
					},
					{
			                        label: "Description",
                        			field: "desc",
			                        width: "300px",
			                        format: function(data) {
			                            // 
			                            return data;
			                        }
					}]
					});
				$( "#adduserdlg" ).dialog( "open" );
                		var groupListView = new dataGridView({collection: groupList, "tableId": "addusergroupListTableId"});
		                groupListView.$el = $("#addusergrouplist");
		                groupListView.render();
				$("#scrolling_area_addusergroupListTableId").css({"height" : "300px"});
            });


                        },
                        error: function (model, response, options){
                                //// console.log("Did not manage to fetch the event "+model.type + "/" + model.id);
                        }
                });
		//// console.log(id + "alone");
	}
	else
	{
		alert("une erreur s'est produite");
	}
}

function delUser(id) {
	if (id)
	{
	//	// console.log(id + "alone");
        	var group = new RowData({ _id: id ,type: "userlist"});
	        group.destroy({success: function(model, response) {
                big_sherif.userList.scrollTop();
            }});
	}
	else
	{
		$('#mainuserListTableId :checked').each(function() {
		//	// console.log($(this).attr("id").replace("checkuser", "") + "not alone");
            		var current_id = $(this).attr("id").replace("checkuser", "");
        		var group = new RowData({ _id: current_id ,type: "userlist"});
		        group.destroy({success: function(model, response) {
                big_sherif.userList.scrollTop();
            }});
		});
	}
}

function dupUser() {
	alert ("Not yet ready");
}

function lockUser() {
	alert ("Not yet ready");
}

function addGroup() {
	var monObj = {};
	if (document.forms["addagroup"]["_id"].value != "")
	{
		monObj["_id"] = document.forms["addagroup"]["_id"].value;
	} else {
        monObj["_id"] = document.forms["addagroup"]["nom"].value;
    }
	monObj["groupname"] = document.forms["addagroup"]["nom"].value;
	monObj["desc"] = (document.forms["addagroup"]["desc"].value ? document.forms["addagroup"]["desc"].value : "");
	monObj["type"] = "group";

	var error = 0;	
	if (monObj["groupname"] == "")
	{
		$("#groupnotice").addClass("notice error");
		$("#groupnotice").append("Vous devez définir un nom de groupe !<br>");
		error = 1;
	}

	if (error == 1)
	{
		return;
	}

	var i = 0;

	monObj["pool"] = [];
	$('#addgroupdlg :checked').each(function() {
		monObj["pool"][monObj["pool"].length] = $(this).attr("id").replace("checkgrouppool", "");
	});

    // UPDATE ET POST A LA FOIS CA MARCHE C'EST BEAU
	// SAUF QUAND TU VEUX INSERT UN TRUC QUI EXISTE DEJA ET QUE EN FAIT CA UPDATE APRES T'A L'AIR CON

	var group = new RowData({type: "grouplist"});
	group.save(monObj,{success: function(model, response) {
                big_sherif.groupList.scrollTop();
            }});

	document.forms["addagroup"].reset();
        $( "#addgroupdlg" ).dialog( "close" );
        $( "#addgroupbtn" ).click(function() {
                        $( "#addgroupdlg" ).dialog( "open" );
                        });

};

function editGroup(id) {
	if (id)
	{
		var truc = $( "#addgroupdlg" ).prev().html();
		$( "#addgroupdlg" ).prev().html(truc.replace("Ajout", "Edition"));
		$( "#addgroupdlg" ).attr("title", "Edition d'un groupe");
		var user = new RowData({_id: id, type: "grouplist"});
		user.fetch({
                        success: function (model, response, options){
		$("#addgroupdlg").load("/static/templates/addgroupdlg.html", function(){
			var monObj = model.toJSON();
			document.forms["addagroup"]["_id"].value = monObj["_id"];
			document.forms["addagroup"]["nom"].value = monObj["groupname"];
			document.forms["addagroup"]["desc"].value = (monObj["desc"] ? monObj["desc"] : "");
			$( "#addgroupdlg" ).on("dialogclose", function() { 
				$('#addgroupdlg :checked').each(function() { $(this).prop('checked', false); })
				document.forms['addagroup']['_id'].value = '';
				});
			$( "#addgroupdlg" ).dialog({
				autoOpen: false,
				width: 500,
				show: {
					effect: "blind",
					duration: 100
					},
				hide: {
					effect: "blind",
					duration: 100
					},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

				});
                                $( "#addgroupbtn" ).click(function() {
                                        $( "#addgroupdlg" ).dialog( "open" );
					});

            	var poolList = new dataGrid({
                    type: "component_pool",
                    sorting:"pool_name",
                    column_names: [
		    {
                        label: "",
                        field: "_id",
			css_class: "column_fiche",
                        width: "32px",
                        format: function(data) {
				if ($.inArray(data, monObj["pool"]) != -1)
				{
					data += '" checked ';
				}
                            return '<input id="checkgrouppool'+data+'" type="checkbox" />';
                        }
                    },
                    {
                        label: "Nom de regroupement",
                        field: "pool_name",
                        width: "160px",
                        format: function(data) {
                            // 
                            return data;
                        }
                    },

                    {
                        label: "Type",
                        field: "pool_type_name",
                        width: "80px",
                        format: function(data) {
                            // 
                            return data;
                        }
                    },
                    {
                        label: "Description",
                        field: "desc",
                        width: "100px",
                        format: function(data) {
                            return data;
                        }
                    }]
                });
		$( "#addgroupdlg" ).dialog("open");
                var poolListView = new dataGridView({collection: poolList, "tableId": "addgroupPoolListTableId"});
                poolListView.$el = $("#addgrouppoollist");
                poolListView.render();
		$("#scrolling_area_addgroupPoolListTableId").css({"height" : "300px"});
            });
                                //// console.log("Managed to retrieve event "+model.id);
                        },
                        error: function (model, response, options){
                              //  // console.log("Did not manage to fetch the event "+model.type + "/" + model.id);
                        }
                });
	}
	else
	{
		alert("une erreur s'est produite");
	}
}

function delGroup(id) {
	if (id)
	{
		// console.log(id + "alone");
        var group = new RowData({ _id: id ,type: "grouplist"});
        group.destroy({success: function(model, response) {
                big_sherif.groupList.scrollTop();
            }});
        
	}
	else
	{
		$('#maingroupListTableId :checked').each(function() {
            var current_id = $(this).attr("id").replace("checkgroup", "");
			// console.log(current_id + "not alone");
            var group = new RowData({ _id: current_id ,type: "grouplist"});
            group.destroy({success: function(model, response) {
                big_sherif.groupList.scrollTop();
            }});
		});
	}
}

function dupGroup() {
	alert ("Not yet ready");
}

function editHost() {
	alert ("Not yet ready");
}

function delHost(id) {
	if (id)
	{
		// console.log(id + "alone");
	        var group = new RowData({ _id: id ,type: "hosts"});
	        group.destroy({success: function(model, response) {
                big_sherif.hostList.scrollTop();
            }});
	}
	else
	{
		$('#mainHostListTableId :checked').each(function() {
            		var current_id = $(this).attr("id").replace("checkhost", "");
			// console.log($(this).attr("id").replace("checkhost", "") + "not alone");
        		var group = new RowData({ _id: current_id ,type: "hosts"});
		        group.destroy({success: function(model, response) {
                big_sherif.hostList.scrollTop();
            }});
		});
	}
}

function getpoolsfromdata(data, type)	{
	    var toreturn = "";
	    for (var i=0; i<data.length; i++)
		if (data[i]["pool_type_name"] == type)
		{
		if (toreturn != "")
		  {
		  toreturn += ", ";
		  }
		toreturn += data[i]["pool_name"];
		}
            if (toreturn == "") {
		toreturn = "Aucun";
	    }
	    return toreturn;
	};

function addWhitelist() {
		
	$("#whitelistnotice").removeClass("notice error");
	$("#whitelistnotice").html("");
	var monObj = {};
	if (document.forms["addawhitelist"]["_id"].value != "")
	{
		monObj["_id"] = document.forms["addawhitelist"]["_id"].value;
	}
	else
	{

		monObj["_id"] = undefined;
	}
	monObj["label"] = document.forms["addawhitelist"]["label"].value;
	monObj["order"] = parseInt(document.forms["addawhitelist"]["order"].value);
	monObj["balance"] = parseInt(document.forms["addawhitelist"]["balance"].value);
	monObj["hostname"] = document.forms["addawhitelist"]["hostname"].value;
	monObj["resource"] = document.forms["addawhitelist"]["resource"].value;
	monObj["connector_name"] = document.forms["addawhitelist"]["connector_name"].value;
	monObj["criticality"] = document.forms["addawhitelist"]["criticality"].value;
	monObj["desc"] = document.forms["addawhitelist"]["desc"].value;
	monObj["stop"] = parseInt($("#addwhitelistdlg input[name=stop]:checked").val());

	var error = 0;
	if (monObj["label"] == "") 
	{
		$("#whitelistnotice").addClass("notice error");
		$("#whitelistnotice").append("Vous devez rentrer un nom d'utilisateur !<br>");
		error = 1;
	}
	if (monObj["order"] == "") 
	{
		$("#whitelistnotice").addClass("notice error");
		$("#whitelistnotice").append("Vous devez rentrer une priorité !<br>");
		error = 1;
	}
	if (monObj["hostname"] == "") 
	{
		$("#whitelistnotice").addClass("notice error");
		$("#whitelistnotice").append("Vous devez rentrer un nom d'équipement (* pour tous ) !<br>");
		error = 1;
	}
	if (monObj["resource"] == "") 
	{
		$("#whitelistnotice").addClass("notice error");
		$("#whitelistnotice").append("Vous devez rentrer une ressource (* pour tous ) !<br>");
		error = 1;
	}
	if (monObj["connector_name"] == "") 
	{
		$("#whitelistnotice").addClass("notice error");
		$("#whitelistnotice").append("Vous devez rentrer un connecteur (* pour tous) !<br>");
		error = 1;
	}
	if (monObj["criticality"] == "") 
	{
		$("#whitelistnotice").addClass("notice error");
		$("#whitelistnotice").append("Vous devez rentrer une criticité !<br>");
		error = 1;
	}
	if (!(monObj["stop"] === parseInt(monObj["stop"]))) 
	{
		$("#whitelistnotice").addClass("notice error");
		$("#whitelistnotice").append("Vous devez définir l'état de la règle !<br>");
		error = 1;
	}

	if (error == 1)
	{
		return;
	}

    // UPDATE ET POST A LA FOIS CA MARCHE C'EST BEAU
	// SAUF QUAND TU VEUX INSERT UN TRUC QUI EXISTE DEJA ET QUE EN FAIT CA UPDATE APRES T'A L'AIR CON
	// console.log(monObj);
	var whitelist = new RowData({_id: monObj["_id"], type: "whitelist"});
	whitelist.save(monObj, {success: function(model, response) {
                big_sherif.whiteList.scrollTop();
            }});
    // FIN

	document.forms["addawhitelist"].reset();
	document.forms["addawhitelist"]["_id"] = "";
        $( "#addwhitelistdlg" ).dialog( "close" );
        $( "#addwhitelistbtn" ).click(function() {
                        $( "#addwhitelistdlg" ).dialog( "open" );
                        });
};

function editWhitelist(id) {
	if (id)
	{
		var truc = $( "#addwhitelistdlg" ).prev().html();
		$( "#addwhitelistdlg" ).prev().html(truc.replace("Ajout", "Edition"));
		$( "#addwhitelistdlg" ).attr("title", "Edition d'une règle de whitelist ");
		var whitelist = new RowData({_id: id, type: "whitelist"});
		whitelist.fetch({
                        success: function (model, response, options){
		$("#addwhitelistdlg").load("/static/templates/addwhitelistdlg.html", function(){
			var monObj = model.toJSON();
			document.forms["addawhitelist"]["_id"].value = monObj["_id"];
			document.forms["addawhitelist"]["label"].value = monObj["label"];
			document.forms["addawhitelist"]["order"].value = monObj["order"];
			document.forms["addawhitelist"]["balance"].value = monObj["balance"];
			document.forms["addawhitelist"]["hostname"].value = monObj["hostname"];
			document.forms["addawhitelist"]["resource"].value = monObj["resource"];
			document.forms["addawhitelist"]["connector_name"].value = monObj["connector_name"];
			document.forms["addawhitelist"]["criticality"].value = monObj["criticality"];
			document.forms["addawhitelist"]["desc"].value = (monObj["desc"] ? monObj["desc"] : "");

			$("#addwhitelistdlg [type=radio]").each(function() {
				if ($(this).val() == monObj["stop"])
				{
					$(this).prop('checked', true);
				}
			});
			$( "#addwhitelistdlg" ).on("dialogclose", function() { $('#addwhitelistdlg :checked').each(function() { $(this).prop('checked', false); })});
			$( "#addwhitelistdlg" ).dialog({
				autoOpen: false,
				width: 500,
				show: {
					effect: "blind",
					duration: 100
					},
				hide: {
					effect: "blind",
					duration: 100
					},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

				});
                                $( "#addwhitelistbtn" ).click(function() {
                                        $( "#addwhitelistdlg" ).dialog( "open" );
					});
				});
				$( "#addwhitelistdlg" ).dialog( "open" );
                                //// console.log("Managed to retrieve event "+model.id);
                        },
                        error: function (model, response, options){
                                // console.log("Did not manage to fetch the event "+model.type + "/" + model.id);
                        }
                });
	}
	else
	{
		alert("une erreur s'est produite");
	}
}

function dupWhitelist() {
	alert ("Not yet ready");
}

function delWhitelist(id) {
	if (id)
	{
		// console.log(id + "alone");
	        var group = new RowData({ _id: id ,type: "whitelist"});
	        group.destroy({success: function(model, response) {
                big_sherif.whiteList.scrollTop();
            }});
	}
	else
	{
		$('#mainWhiteListTableId :checked').each(function() {
            		var current_id = $(this).attr("id").replace("checkwhitelist", "");
			// console.log($(this).attr("id").replace("checkwhitelist", "") + "not alone");
        		var group = new RowData({ _id: current_id ,type: "whitelist"});
		        group.destroy({success: function(model, response) {
                big_sherif.whiteList.scrollTop();
            }});
		});
	}
    
}

function addBlacklist() {
		
	$("#blacklistnotice").removeClass("notice error");
	$("#blacklistnotice").html("");
	var monObj = {};
	if (document.forms["addablacklist"]["_id"].value != "")
	{
		monObj["_id"] = document.forms["addablacklist"]["_id"].value;
	}
	monObj["label"] = document.forms["addablacklist"]["label"].value;
	monObj["order"] = parseInt(document.forms["addablacklist"]["order"].value);
	monObj["balance"] = parseInt(document.forms["addablacklist"]["balance"].value);
	monObj["hostname"] = document.forms["addablacklist"]["hostname"].value;
	monObj["resource"] = document.forms["addablacklist"]["resource"].value;
	monObj["connector_name"] = document.forms["addablacklist"]["connector_name"].value;
	monObj["criticality"] = document.forms["addablacklist"]["criticality"].value;
	monObj["desc"] = document.forms["addablacklist"]["desc"].value;
	monObj["stop"] = parseInt($("#addblacklistdlg input[name=stop]:checked").val());
	
	var error = 0;
	if (monObj["label"] == "") 
	{
		$("#blacklistnotice").addClass("notice error");
		$("#blacklistnotice").append("Vous devez rentrer un nom d'utilisateur !<br>");
		error = 1;
	}
	if (monObj["order"] == "") 
	{
		$("#blacklistnotice").addClass("notice error");
		$("#blacklistnotice").append("Vous devez rentrer une priorité !<br>");
		error = 1;
	}
	if (monObj["hostname"] == "") 
	{
		$("#blacklistnotice").addClass("notice error");
		$("#blacklistnotice").append("Vous devez rentrer un nom d'équipement (* pour tous ) !<br>");
		error = 1;
	}
	if (monObj["resource"] == "") 
	{
		$("#blacklistnotice").addClass("notice error");
		$("#blacklistnotice").append("Vous devez rentrer une ressource (* pour tous ) !<br>");
		error = 1;
	}
	if (monObj["connector_name"] == "") 
	{
		$("#blacklistnotice").addClass("notice error");
		$("#blacklistnotice").append("Vous devez rentrer un connecteur (* pour tous) !<br>");
		error = 1;
	}
	if (monObj["criticality"] == "") 
	{
		$("#blacklistnotice").addClass("notice error");
		$("#blacklistnotice").append("Vous devez rentrer une criticité !<br>");
		error = 1;
	}
	if (!(monObj["stop"] === parseInt(monObj["stop"]))) 
	{
		$("#blacklistnotice").addClass("notice error");
		$("#blacklistnotice").append("Vous devez définir l'état de la règle !<br>");
		error = 1;
	}

	if (error == 1)
	{
		return;
	}

    // UPDATE ET POST A LA FOIS CA MARCHE C'EST BEAU
	// SAUF QUAND TU VEUX INSERT UN TRUC QUI EXISTE DEJA ET QUE EN FAIT CA UPDATE APRES T'A L'AIR CON
	// console.log(monObj);
	var blacklist = new RowData({_id: monObj["_id"], type: "blacklist"});
	blacklist.save(monObj, {success: function(model, response) {
                big_sherif.blackList.scrollTop();
            }});
    // FIN

	document.forms["addablacklist"].reset();
	document.forms["addablacklist"]["_id"] = "";
        $( "#addblacklistdlg" ).dialog( "close" );
        $( "#addblacklistbtn" ).click(function() {
                        $( "#addblacklistdlg" ).dialog( "open" );
                        });

};

function editBlacklist(id) {
	if (id)
	{
		var truc = $( "#addblacklistdlg" ).prev().html();
		$( "#addblacklistdlg" ).prev().html(truc.replace("Ajout", "Edition"));
		$( "#addblacklistdlg" ).attr("title", "Edition d'une règle de blacklist ");
		var blacklist = new RowData({_id: id, type: "blacklist"});
		blacklist.fetch({
                        success: function (model, response, options){
		$("#addblacklistdlg").load("/static/templates/addblacklistdlg.html", function(){
			var monObj = model.toJSON();
			document.forms["addablacklist"]["_id"].value = monObj["_id"];
			document.forms["addablacklist"]["label"].value = monObj["label"];
			document.forms["addablacklist"]["order"].value = monObj["order"];
			document.forms["addablacklist"]["balance"].value = monObj["balance"];
			document.forms["addablacklist"]["hostname"].value = monObj["hostname"];
			document.forms["addablacklist"]["resource"].value = monObj["resource"];
			document.forms["addablacklist"]["connector_name"].value = monObj["connector_name"];
			document.forms["addablacklist"]["criticality"].value = monObj["criticality"];
			document.forms["addablacklist"]["desc"].value = (monObj["desc"] ? monObj["desc"] : "");

			$("[type=radio]").each(function() {
				if ($(this).val() == monObj["stop"])
				{
					$(this).prop('checked', true);
				}
			});
			$( "#addblacklistdlg" ).on("dialogclose", function() { $('#addblacklistdlg :checked').each(function() { $(this).prop('checked', false); })});
			$( "#addblacklistdlg" ).dialog({
				autoOpen: false,
				width: 500,
				show: {
					effect: "blind",
					duration: 100
					},
				hide: {
					effect: "blind",
					duration: 100
					},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

				});
                                $( "#addblacklistbtn" ).click(function() {
                                        $( "#addblacklistdlg" ).dialog( "open" );
					});
				});
				$( "#addblacklistdlg" ).dialog( "open" );
                                //// console.log("Managed to retrieve event "+model.id);
                        },
                        error: function (model, response, options){
                                // console.log("Did not manage to fetch the event "+model.type + "/" + model.id);
                        }
                });
	}
	else
	{
		alert("une erreur s'est produite");
	}
}

function dupBlacklist() {
	alert ("Not yet ready");
}

function delBlacklist(id) {
	if (id)
	{
		// console.log(id + "alone");
	        var group = new RowData({ _id: id ,type: "blacklist"});
	        group.destroy({success: function(model, response) {
                big_sherif.blackList.scrollTop();
            }});
	}
	else
	{
		$('#mainBlackListTableId :checked').each(function() {
            		var current_id = $(this).attr("id").replace("checkblacklist", "");
			// console.log($(this).attr("id").replace("checkblacklist", "") + "not alone");
        		var group = new RowData({ _id: current_id ,type: "blacklist"});
		        group.destroy({success: function(model, response) {
                big_sherif.blackList.scrollTop();
            }});
		});
	}
}

function wbrule_isiton(data)	{
		if (data == 0)
		  {// green
			return '<i class="icon-off icon-large" title="on" style="color: green"></i>';
		  }
		else if (data == 1)
		{
			return '<i class="icon-off icon-large" title="off" style="color: red"></i>';
		}
	    return data;
	};


function addPoolMember() {
document.forms["addpoolmember"]["newmember"].value;
document.forms["addapool"]["pool_name"].value;
document.forms["addapool"]["pool_type_name"].value;

        var component = new RowData({_id: document.forms["addpoolmember"]["newmember"].value, type: "hosts"});
        component.fetch({wait: true, success: function (model,response,options) {
		var poollist = model.attributes["pool"];
		if (poollist == undefined)
		{
			poollist = new Array();
		}
		poollist.push({pool_name: document.forms["addapool"]["pool_name"].value, pool_type_name: document.forms["addapool"]["pool_type_name"].value});
		component.save("pool", poollist, {wait: true, success: function (model,response,options) {
		big_sherif.hostPoolList.scrollTop();
		document.forms["addpoolmember"].reset();
}});
}});
}

function delPoolMember(id) {
        var component = new RowData({_id: id, type: "hosts"});
        component.fetch({wait: true, success: function (model,response,options) {
		var poollist = model.attributes["pool"];
		var i = 0;
		while (i < poollist.length)
		{
			if ((poollist[i]["pool_name"] == document.forms["addapool"]["pool_name"].value) && (poollist[i]["pool_type_name"] == document.forms["addapool"]["pool_type_name"].value))
			{
				poollist.splice(i, 1);
			}
			i++;
		}
		component.save("pool", poollist, {wait: true, success: function (model,response,options) {
		document.forms["addpoolmember"]["newmember"].reset;
		big_sherif.hostPoolList.scrollTop();
}});
}});


}


function addPool() {
		
	$("#poolnotice").removeClass("notice error");
	$("#poolnotice").html("");
	var monObj = {};
	if (document.forms["addapool"]["_id"].value != "")
	{
		monObj["_id"] = document.forms["addapool"]["_id"].value
	}
	monObj["pool_name"] = document.forms["addapool"]["pool_name"].value;
	monObj["pool_type_name"] = document.forms["addapool"]["pool_type_name"].value;
	monObj["desc"] = (document.forms["addapool"]["desc"].value ? document.forms["addapool"]["desc"].value : "");


	
	var error = 0;
	if (monObj["pool_name"] == "") 
	{
		$("#poolnotice").addClass("notice error");
		$("#poolnotice").append("Vous devez rentrer un nom de regroupement !<br>");
		error = 1;
	}
	if (monObj["pool_type_name"] == "") 
	{
		$("#poolnotice").addClass("notice error");
		$("#poolnotice").append("Vous devez rentrer un type de pool !<br>");
		error = 1;
	}

	if (error == 1)
	{
		return;
	}

    // UPDATE ET POST A LA FOIS CA MARCHE C'EST BEAU
	// SAUF QUAND TU VEUX INSERT UN TRUC QUI EXISTE DEJA ET QUE EN FAIT CA UPDATE APRES T'A L'AIR CON
	// console.log(monObj);
	var pool = new RowData({_id: monObj["_id"], type: "component_pool"});
	pool.save(monObj, {success: function(model, response) {
                big_sherif.poolList.scrollTop();
            }});
    // FIN

	document.forms["addapool"].reset();
        $( "#addpooldlg" ).dialog( "close" );
        $( "#addpoolbtn" ).click(function() {
                        $( "#addpooldlg" ).dialog( "open" );
                        });

};

function editPool(id) {
	if (id)
	{
		var truc = $( "#addpooldlg" ).prev().html();
		$( "#addpooldlg" ).prev().html(truc.replace("Ajout", "Edition"));
		$( "#addpooldlg" ).attr("title", "Edition d'un regroupement");
		var pool = new RowData({_id: id, type: "component_pool"});
		pool.fetch({
                        success: function (model, response, options){
		$("#addpooldlg").load("/static/templates/addpooldlg.html", function(){
			var monObj = model.toJSON();
			document.forms["addapool"]["_id"].value = monObj["_id"];
			document.forms["addapool"]["pool_name"].value = monObj["pool_name"];
			document.forms["addapool"]["pool_type_name"].value = monObj["pool_type_name"];
			document.forms["addapool"]["desc"].value = (monObj["desc"] ? monObj["desc"] : "");


			document.forms["addapool"]["pool_name"].disabled = true;
//			document.forms["addapool"]["pool_type_name"].disabled = true;

			big_sherif.hostPoolList = new dataGrid({
	         	type: "hosts",
			filters: {"pool.pool_name": monObj["pool_name"]},
			sorting:"_id",
			key:monObj["pool_name"],
			column_names: [
			{
label: "",
field: "_id",
css_class: "column_fiche",
width: "32px",
format: function(data) {
return '<i style="cursor: pointer;" class="icon-trash icon-large" onclick=\'delPoolMember("'+data+'")\'></i>';
}
},
{
label: "Hote",
field: "_id",
css_class: "column_fiche",
width: "300px",
format: function(data) {
return data;
}
}
]});

hostPoolListView = new dataGridView({"collection": big_sherif.hostPoolList, "tableId": "hostPoolListTable"})
hostPoolListView.$el = $("#pool_members");
hostPoolListView.render();


$('#addpoolmember').html('<form name="addpoolmember" action="javascript:void(0)"><input type="text" name="newmember" id="newmember" /><input type="submit" value="Ajouter au pool" onclick="addPoolMember();"/></form>');



function split( val ) {
return val.split( /,\s*/ );
}
function extractLast( term ) {
return split( term ).pop();
}
$( "#newmember" )
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


			$( "#addpooldlg" ).dialog({
				autoOpen: false,
				width: 500,
				show: {
					effect: "blind",
					duration: 100
					},
				hide: {
					effect: "blind",
					duration: 100
					},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

				});
                                $( "#addpoolbtn" ).click(function() {
                                        $( "#addpooldlg" ).dialog( "open" );
					});
				});


				$( "#addpooldlg" ).dialog( "open" );
                                //// console.log("Managed to retrieve event "+model.id);
                        },
                        error: function (model, response, options){
                                // console.log("Did not manage to fetch the event "+model.type + "/" + model.id);
                        }
                });
	}
	else
	{
		alert("une erreur s'est produite");
	}
}

function delPool(id) {
	if (id)
	{
		// console.log(id + "alone");
	        var group = new RowData({ _id: id ,type: "component_pool"});
	        group.destroy({success: function(model, response) {
                big_sherif.poolList.scrollTop();
            }});
	}
	else
	{
		$('#mainPoolListTableId :checked').each(function() {
            		var current_id = $(this).attr("id").replace("checkpool", "");
			// console.log($(this).attr("id").replace("checkpool", "") + "not alone");
        		var group = new RowData({ _id: current_id ,type: "component_pool"});
		        group.destroy({success: function(model, response) {
                big_sherif.poolList.scrollTop();
            }});
		});
	}
}

function addDuplicaterulelist() {
		
	$("#duplicaterulelistnotice").removeClass("notice error");
	$("#duplicaterulelistnotice").html("");
	var monObj = {};
	if (document.forms["addaduplicaterulelist"]["_id"].value != "")
	{
		monObj["_id"] = document.forms["addaduplicaterulelist"]["_id"].value
	}
	monObj["address_dest"] = document.forms["addaduplicaterulelist"]["address_dest"].value;
	monObj["component_dest"] = document.forms["addaduplicaterulelist"]["component_dest"].value;
	monObj["address_src"] = document.forms["addaduplicaterulelist"]["address_src"].value;
	monObj["component_src"] = document.forms["addaduplicaterulelist"]["component_src"].value;
	
	var error = 0;
	if (monObj["component_src"] == "") 
	{
		$("#duplicaterulelistnotice").addClass("notice error");
		$("#duplicaterulelistnotice").append("Vous devez rentrer un équipement source !<br>");
		error = 1;
	}
	if (monObj["address_src"] == "") 
	{
		$("#duplicaterulelistnotice").addClass("notice error");
		$("#duplicaterulelistnotice").append("Vous devez rentrer une adresse source !<br>");
		error = 1;
	}

	if (monObj["component_dest"] == "") 
	{
		$("#duplicaterulelistnotice").addClass("notice error");
		$("#duplicaterulelistnotice").append("Vous devez rentrer un équipement de destination !<br>");
		error = 1;
	}

	if (monObj["address_dest"] == "") 
	{
		$("#duplicaterulelistnotice").addClass("notice error");
		$("#duplicaterulelistnotice").append("Vous devez rentrer une adresse de destination !<br>");
		error = 1;
	}


	if (error == 1)
	{
		return;
	}

    // UPDATE ET POST A LA FOIS CA MARCHE C'EST BEAU
	// SAUF QUAND TU VEUX INSERT UN TRUC QUI EXISTE DEJA ET QUE EN FAIT CA UPDATE APRES T'A L'AIR CON
	// console.log(monObj);
	var duplicaterulelist = new RowData({_id: monObj["_id"], type: "component_deduplicate"});
	duplicaterulelist.save(monObj, {success: function(model, response) {
                big_sherif.duplicateRulesList.scrollTop();
            }});
    // FIN

	document.forms["addaduplicaterulelist"].reset();
        $( "#addduplicaterulelistdlg" ).dialog( "close" );
        $( "#addduplicaterulelistbtn" ).click(function() {
                        $( "#addduplicaterulelistdlg" ).dialog( "open" );
                        });

};

function editDuplicaterulelist(id) {
	if (id)
	{
		var truc = $( "#addduplicaterulelistdlg" ).prev().html();
		$( "#addduplicaterulelistdlg" ).prev().html(truc.replace("Ajout", "Edition"));
		$( "#addduplicaterulelistdlg" ).attr("title", "Edition d'une règle de duplication");
		var duplicaterulelist = new RowData({_id: id, type: "component_deduplicate"});
		duplicaterulelist.fetch({
                        success: function (model, response, options){
		$("#addduplicaterulelistdlg").load("/static/templates/addduplicaterulelistdlg.html", function(){
			var monObj = model.toJSON();
			document.forms["addaduplicaterulelist"]["_id"].value = monObj["_id"];
			document.forms["addaduplicaterulelist"]["address_dest"].value = monObj["address_dest"];
			document.forms["addaduplicaterulelist"]["component_dest"].value = monObj["component_dest"];
			document.forms["addaduplicaterulelist"]["address_src"].value = monObj["address_src"];
			document.forms["addaduplicaterulelist"]["component_src"].value = monObj["component_src"];


			$( "#addduplicaterulelistdlg" ).dialog({
				autoOpen: false,
				width: 500,
				show: {
					effect: "blind",
					duration: 100
					},
				hide: {
					effect: "blind",
					duration: 100
					},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

				});
                                $( "#addduplicaterulelistbtn" ).click(function() {
                                        $( "#addduplicaterulelistdlg" ).dialog( "open" );
					});
				});
				$( "#addduplicaterulelistdlg" ).dialog( "open" );
                                //// console.log("Managed to retrieve event "+model.id);
                        },
                        error: function (model, response, options){
                                // console.log("Did not manage to fetch the event "+model.type + "/" + model.id);
                        }
                });
	}
	else
	{
		alert("une erreur s'est produite");
	}
}

function delDuplicaterulelist(id) {
	if (id)
	{
		// console.log(id + "alone");
	        var group = new RowData({ _id: id ,type: "component_deduplicate"});
	        group.destroy({success: function(model, response) {
                big_sherif.duplicateRulesList.scrollTop();
            }});
	}
	else
	{
		$('#mainPoolListTableId :checked').each(function() {
            		var current_id = $(this).attr("id").replace("checkdr", "");
			// console.log($(this).attr("id").replace("checkdr", "") + "not alone");
        		var group = new RowData({ _id: current_id ,type: "component_deduplicate"});
		        group.destroy({success: function(model, response) {
                big_sherif.duplicateRulesList.scrollTop();
            }});
		});
	}
}

function delDuplicatelist(id) {
	if (id)
	{
		// console.log(id + "alone");
	        var group = new RowData({ _id: id ,type: "duplicate_entry"});
	        group.destroy({success: function(model, response) {
                big_sherif.duplicateList.scrollTop();
            }});
	}
	else
	{
		$('#mainduplicateListTableId :checked').each(function() {
            		var current_id = $(this).attr("id").replace("checkdl", "");
			// console.log($(this).attr("id").replace("checkdl", "") + "not alone");
        		var group = new RowData({ _id: current_id ,type: "duplicate_entry"});
		        group.destroy({success: function(model, response) {
                big_sherif.duplicateList.scrollTop();
            }});
		});
	}
}

function newHostDuplicate(id) {
// REmplissage de la popup

	var deduplicate = new RowData({_id: id, type: "duplicate_entry"});
	deduplicate.fetch({wait: true, success: function (model,response,options) {
	$("#addhostduplicatedlg").load("/static/templates/addhostduplicatedlg.html", function(){
			var monObj = model.toJSON();
			document.forms["addaduplicatehost"]["nom"].value = monObj["duplicate_entry"]["component"] + "_" + monObj["duplicate_entry"]["connector_name"];
			document.forms["addaduplicatehost"]["connector"].value = monObj["duplicate_entry"]["connector"];
			document.forms["addaduplicatehost"]["connector_name"].value = monObj["duplicate_entry"]["connector_name"];
			document.forms["addaduplicatehost"]["ip"].value = monObj["duplicate_entry"]["address"];
			document.forms["addaduplicatehost"]["dupid"].value = id;
			document.forms["addaduplicatehost"]["oldname"].value = monObj["duplicate_entry"]["component"];

			$( "#addhostduplicatedlg" ).attr("title", "Création d'un nouvel équipement");
			$( "#addhostduplicatedlg" ).dialog({
				autoOpen: true,
				width: 500,
				show: {
					effect: "blind",
					duration: 100
					},
				hide: {
					effect: "blind",
					duration: 100
					},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

				});

		});
	}});
}

function addDuplicateHost() {
//Traitemetn de la popup
//ajout de la popup
        var component = new RowData({ihm: 1, _id: document.forms["addaduplicatehost"]["nom"].value, hostname: document.forms["addaduplicatehost"]["nom"].value, address: document.forms["addaduplicatehost"]["ip"].value, connector: [ document.forms["addaduplicatehost"]["connector"].value ], connector_name: [ document.forms["addaduplicatehost"]["connector_name"].value ], type: "hosts"});
	component.save();
	// suppression de l'enregistrement doublon
	var group = new RowData({ _id: document.forms["addaduplicatehost"]["dupid"].value,type: "duplicate_entry"});
	group.destroy({success: function(model, response) {
			big_sherif.duplicateList.scrollTop();
			}});

        var maRegle = {};
        maRegle["address_src"] = document.forms["addaduplicatehost"]["ip"].value;
        maRegle["component_src"] = document.forms["addaduplicatehost"]["oldname"].value;
        maRegle["address_dest"] = document.forms["addaduplicatehost"]["ip"].value;
        maRegle["component_dest"] = document.forms["addaduplicatehost"]["nom"].value;
        var duplicaterulelist = new RowData({type: "component_deduplicate"});
        duplicaterulelist.save(maRegle, {success: function(model, response) {
                var group = new RowData({ _id: id,type: "duplicate_entry"});
                group.destroy({success: function(model, response) {
                        big_sherif.duplicateList.scrollTop();
                        }});

                }});

	//fermeture de la popup
	document.forms["addaduplicatehost"].reset();
	$( "#addhostduplicatedlg" ).dialog("close");
}

function linkHostDuplicate(id) {

	if (confirm("Confirmez vous l'unicité de l'hôte ?"))
	{
	var deduplicate = new RowData({_id: id, type: "duplicate_entry"});
	deduplicate.fetch({wait: true, success: function (model,response,options) {
			var monDoublon = model.toJSON();

			var maRegle = {};
			maRegle["address_dest"] = monDoublon["primary_entry"]["address"];
			maRegle["component_dest"] = monDoublon["primary_entry"]["component"];
			maRegle["address_src"] = monDoublon["duplicate_entry"]["address"];
			maRegle["component_src"] = monDoublon["duplicate_entry"]["component"];
			var duplicaterulelist = new RowData({type: "component_deduplicate"});
			duplicaterulelist.save(maRegle, {success: function(model, response) {
				var group = new RowData({ _id: id,type: "duplicate_entry"});
				group.destroy({success: function(model, response) {
					big_sherif.duplicateList.scrollTop();
					}});

				}});
			}});
	}
}

function addCriticality() {

	$("#criticalitynotice").removeClass("notice error");
	$("#criticalitynotice").html("");
	var monObj = {};
	if (document.forms["addacriticality"]["_id"].value != "")
	{
		monObj["_id"] = document.forms["addacriticality"]["_id"].value
	} else {
		monObj["_id"] = document.forms["addacriticality"]["id"].value
	}
	monObj["id"] = document.forms["addacriticality"]["id"].value;
	monObj["label"] = document.forms["addacriticality"]["label"].value;
	monObj["weight"] = document.forms["addacriticality"]["weight"].value;
	monObj["desc"] = document.forms["addacriticality"]["desc"].value;

	var error = 0;
	if (monObj["id"] == "") 
	{
		$("#criticalitynotice").addClass("notice error");
		$("#criticalitynotice").append("Vous devez rentrer un id !<br>");
		error = 1;
	}
	if (monObj["label"] == "") 
	{
		$("#criticalitynotice").addClass("notice error");
		$("#criticalitynotice").append("Vous devez rentrer un label !<br>");
		error = 1;
	}

	if (monObj["weight"] == "") 
	{
		$("#criticalitynotice").addClass("notice error");
		$("#criticalitynotice").append("Vous devez rentrer un poids !<br>");
		error = 1;
	}


	if (error == 1)
	{
		return;
	}

	// UPDATE ET POST A LA FOIS CA MARCHE C'EST BEAU
	// SAUF QUAND TU VEUX INSERT UN TRUC QUI EXISTE DEJA ET QUE EN FAIT CA UPDATE APRES T'A L'AIR CON
	// console.log(monObj);
	var criticality = new RowData({_id: monObj["_id"], type: "criticalitylist"});
	criticality.save(monObj, {success: function(model, response) {
			big_sherif.criticalityList.scrollTop();
			}});
	// FIN

	document.forms["addacriticality"].reset();
	$( "#addcriticalitydlg" ).dialog( "close" );
	$( "#addcriticalitybtn" ).click(function() {
			$( "#addcriticalitydlg" ).dialog( "open" );
			});

};

function editCriticality(id) {
	if (id)
	{
		var truc = $( "#addcriticalitydlg" ).prev().html();
		$( "#addcriticalitydlg" ).prev().html(truc.replace("Ajout", "Edition"));
		$( "#addcriticalitydlg" ).attr("title", "Edition d'une règle de duplication");
		var criticality = new RowData({_id: id, type: "criticalitylist"});
		criticality.fetch({
success: function (model, response, options){
$("#addcriticalitydlg").load("/static/templates/addcriticalitydlg.html", function(){
	var monObj = model.toJSON();
	document.forms["addacriticality"]["_id"].value = monObj["_id"];
	document.forms["addacriticality"]["id"].value = monObj["_id"];
	document.forms["addacriticality"]["id"].disabled = true;
	document.forms["addacriticality"]["label"].value = monObj["label"];
	document.forms["addacriticality"]["weight"].value = monObj["weight"];
	document.forms["addacriticality"]["desc"].value = (monObj["desc"] ? monObj["desc"] : "");


	$( "#addcriticalitydlg" ).dialog({
autoOpen: false,
width: 500,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

});
$( "#addcriticalitybtn" ).click(function() {
		$( "#addcriticalitydlg" ).dialog( "open" );
		});
});
$( "#addcriticalitydlg" ).dialog( "open" );
//// console.log("Managed to retrieve event "+model.id);
},
error: function (model, response, options){
	       // console.log("Did not manage to fetch the event "+model.type + "/" + model.id);
       }
});
}
else
{
	alert("une erreur s'est produite");
}
}

function delCriticality(id) {
	if (id)
	{
		// console.log(id + "alone");
		var group = new RowData({ _id: id ,type: "criticalitylist"});
		group.destroy({success: function(model, response) {
				big_sherif.criticalityList.scrollTop();
				}});
	}
	else
	{
		$('#maincriticalityListTableId :checked').each(function() {
				var current_id = $(this).attr("id").replace("checkcriticality", "");
				// console.log($(this).attr("id").replace("checkcriticality", "") + "not alone");
				var group = new RowData({ _id: current_id ,type: "criticalitylist"});
				group.destroy({success: function(model, response) {
					big_sherif.criticalityList.scrollTop();
					}});
				});
	}
}

function addConnector() {

	$("#connectornotice").removeClass("notice error");
	$("#connectornotice").html("");
	var monObj = {};
	if (document.forms["addaconnector"]["_id"].value != "")
	{
		monObj["_id"] = document.forms["addaconnector"]["_id"].value;
	} else {
		monObj["_id"] = document.forms["addaconnector"]["nom"].value;
	}
	var nom = document.forms["addaconnector"]["nom"].value;
	monObj["connector"] = document.forms["addaconnector"]["connector"].value;
	monObj["connector_family"] = typeof document.forms["addaconnector"]["connector_family"] != 'undefined' ? document.forms["addaconnector"]["connector_family"].value : "";
	monObj["connector_hostname"] = document.forms["addaconnector"]["connector_hostname"].value;
	monObj["connector_hostip"] = document.forms["addaconnector"]["connector_hostip"].value;
	monObj["connector_status"] = $("input[name=connector_status]:checked").val();

	var error = 0;
	if (monObj["connector"] == "") 
	{
		$("#connectornotice").addClass("notice error");
		$("#connectornotice").append("Vous devez rentrer un nom de connecteur !<br>");
		error = 1;
	}
	if (monObj["connector_status"] == "") 
	{
		$("#connectornotice").addClass("notice error");
		$("#connectornotice").append("Vous devez choisir un statut !<br>");
		error = 1;
	}
	if (monObj["connector_hostname"] == "") 
	{
		$("#connectornotice").addClass("notice error");
		$("#connectornotice").append("Vous devez rentrer un nom de superviseur !<br>");
		error = 1;
	}
	if (monObj["connector_hostip"] == "") 
	{
		$("#connectornotice").addClass("notice error");
		$("#connectornotice").append("Vous devez rentrer une ip de superviseur !<br>");
		error = 1;
	}

	if (error == 1)
	{
		return;
	}
	monObj["connector_status"] = parseInt(monObj["connector_status"]);
	// UPDATE ET POST A LA FOIS CA MARCHE C'EST BEAU
	// SAUF QUAND TU VEUX INSERT UN TRUC QUI EXISTE DEJA ET QUE EN FAIT CA UPDATE APRES T'A L'AIR CON
	// console.log(monObj);
	var connector = new RowData({_id: monObj["_id"], type: "connectorlist"});
	connector.save(monObj,{success: function(model, response) {
			big_sherif.connectorList.scrollTop();
			}});
	// FIN
	document.forms["addaconnector"]["_id"].value = "";
	document.forms["addaconnector"].reset();
	$( "#addconnectordlg" ).dialog( "close" );
	$( "#addconnectorbtn" ).click(function() {
			$( "#addconnectordlg" ).dialog( "open" );
			});

};

function editConnector(id) {
	if (id)
	{
		var truc = $( "#addconnectordlg" ).prev().html();
		$( "#addconnectordlg" ).prev().html(truc.replace("Ajout", "Edition"));
		$( "#addconnectordlg" ).attr("title", "Edition d'une règle de connector ");
		var connector = new RowData({_id: id, type: "connectorlist"});
		connector.fetch({
success: function (model, response, options){
$("#addconnectordlg").load("/static/templates/addconnectordlg.html", function(){
	var monObj = model.toJSON();
	// console.log(monObj);
	document.forms["addaconnector"]["_id"].value = monObj["_id"];
	document.forms["addaconnector"]["nom"].value = monObj["_id"];
	document.forms["addaconnector"]["connector"].value = monObj["connector"];
	document.forms["addaconnector"]["connector_family"].value = (monObj["connector_family"] ? monObj["connector_family"] : "");
	document.forms["addaconnector"]["connector_hostname"].value = monObj["connector_hostname"];
	document.forms["addaconnector"]["connector_hostip"].value = monObj["connector_hostip"];
	document.forms["addaconnector"]["nom"].disabled = true;
	big_sherif.transcodeList = new dataGrid({
type: "criticality_transcode",
filters: {"connector": monObj["connector"]},
sorting:"connector",
key:monObj["connector"],
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "32px",
format: function(data) {
return '<i style="cursor: pointer;" class="icon-trash icon-large" onclick=\'delTranscode("'+data+'")\'></i>';
}
},
{
label: "Criticité superviseur",
field: "criticality_input",
width: "150px",
format: function(data) {
return data;
}
},
{
label: "Criticité transcodée",
       field: "criticality_transcode",
       width: "150px",
       format: function(data) {
	       return data;
       }
},
{
label: "Poids",
       field: "weight",
       width: "163px",
       format: function(data) {
	       return data;
       }
}


]});
transcodeListView = new dataGridView({"collection": big_sherif.transcodeList, "tableId": "transcodeListTable"})
transcodeListView.$el = $("#ctranscode");
transcodeListView.render();


$("[type=radio]").each(function() {
		if ($(this).val() == monObj["connector_status"])
		{
		$(this).prop('checked', true);
		}
		});
$( "#addconnectordlg" ).on("dialogclose", function() { $('#addconnectordlg :checked').each(function() { $(this).prop('checked', false); })});
$( "#addconnectordlg" ).dialog({
autoOpen: false,
width: 500,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

});
$( "#addconnectorbtn" ).click(function() {
		$( "#addconnectordlg" ).dialog( "open" );
		});
});
$( "#addconnectordlg" ).dialog( "open" );
//// console.log("Managed to retrieve event "+model.id);
},
error: function (model, response, options){
	       // console.log("Did not manage to fetch the event "+model.type + "/" + model.id);
       }
});
}
else
{
	alert("une erreur s'est produite");
}
}

function addTranscode(connector) {

	var monObj = {};
	monObj["connector"] = document.forms["addatranscode"]["connector"].value;
	monObj["criticality_input"] = document.forms["addatranscode"]["criticality_input"].value;
	monObj["criticality_transcode"] = document.forms["addatranscode"]["criticality_transcode"].value;
	monObj["weight"] = document.forms["addatranscode"]["weight"].value;

	var error = 0;
	if (monObj["connector"] == "") 
	{
		$("#transcodenotice").addClass("notice error");
		$("#transcodenotice").append("Vous devez rentrer un nom de connecteur !<br>");
		error = 1;
	}
	if (monObj["criticality_transcode"] == "") 
	{
		$("#transcodenotice").addClass("notice error");
		$("#transcodenotice").append("Vous devez choisir une criticité transcodée !<br>");
		error = 1;
	}
	if (monObj["criticality_input"] == "") 
	{
		$("#transcodenotice").addClass("notice error");
		$("#transcodenotice").append("Vous devez rentrer une criticité d'entrée !<br>");
		error = 1;
	}
	if (monObj["weight"] == "") 
	{
		$("#transcodenotice").addClass("notice error");
		$("#transcodenotice").append("Vous devez rentrer un poids !<br>");
		error = 1;
	}

	if (error == 1)
	{
		return;
	}

	// UPDATE ET POST A LA FOIS CA MARCHE C'EST BEAU
	// SAUF QUAND TU VEUX INSERT UN TRUC QUI EXISTE DEJA ET QUE EN FAIT CA UPDATE APRES T'A L'AIR CON
	// console.log(monObj);
	var transcode = new RowData({_id: monObj["_id"], type: "criticality_transcode"});
	transcode.save(monObj,{success: function(model, response) {
			document.forms['addatranscode'].reset();
			$( '#addtranscodedlg' ).dialog( 'close' );
			big_sherif.transcodeList.scrollTop();
			}});
	// FIN
}

function delTranscode(id) {
	if (id)
	{
		// console.log(id + "alone");
		var group = new RowData({ _id: id ,type: "criticality_transcode"});
		group.destroy({success: function(model, response) {
				big_sherif.transcodeList.scrollTop();
				}});
	}

}

function dupConnector() {
	alert ("Not yet ready");
}

function delConnector(id) {
	// console.log("entering delete");
	if (id)
	{
		// console.log(id + "alone");
		var group = new RowData({ _id: id ,type: "connectorlist"});
		group.destroy({success: function(model, response) {
				big_sherif.connectorList.scrollTop();
				}});
	}
	else
	{
		$('#mainconnectorListTableId :checked').each(function() {
				var current_id = $(this).attr("id").replace("checkconnector", "");
				// console.log($(this).attr("id").replace("checkconnector", "") + "not alone");
				var group = new RowData({ _id: current_id ,type: "connectorlist"});
				group.destroy({success: function(model, response) {
					big_sherif.connectorList.scrollTop();
					}});
				});
	}
}

function addRequalification() {

	$("#requalificationnotice").removeClass("notice error");
	$("#requalificationnotice").html("");
	var monObj = {};
	if (document.forms["addarequalification"]["_id"].value != "")
	{
		monObj["_id"] = document.forms["addarequalification"]["_id"].value
	} else {
		monObj["_id"] = document.forms["addarequalification"]["id"].value
	}
	monObj["component"] = document.forms["addarequalification"]["component"].value;
	monObj["resource"] = document.forms["addarequalification"]["resource"].value;
	monObj["connector"] = document.forms["addarequalification"]["connector"].value;
	monObj["criticality_transcode"] = document.forms["addarequalification"]["criticality_transcode"].value;
	monObj["criticality_requalify"] = document.forms["addarequalification"]["criticality_requalify"].value;

	var error = 0;
	if (monObj["component"] == "") 
	{
		$("#requalificationnotice").addClass("notice error");
		$("#requalificationnotice").append("Vous devez rentrer un équipement !<br>");
		error = 1;
	}
	if (monObj["resource"] == "") 
	{
		$("#requalificationnotice").addClass("notice error");
		$("#requalificationnotice").append("Vous devez rentrer une ressource !<br>");
		error = 1;
	}

	if (monObj["connector"] == "") 
	{
		$("#requalificationnotice").addClass("notice error");
		$("#requalificationnotice").append("Vous devez rentrer un connecteur !<br>");
		error = 1;
	}
	if (monObj["criticality_transcode"] == "") 
	{
		$("#requalificationnotice").addClass("notice error");
		$("#requalificationnotice").append("Vous devez rentrer une criticité d'entrée !<br>");
		error = 1;
	}

	if (monObj["criticality_requalify"] == "") 
	{
		$("#requalificationnotice").addClass("notice error");
		$("#requalificationnotice").append("Vous devez rentrer une criticité requalifiée !<br>");
		error = 1;
	}



	if (error == 1)
	{
		return;
	}

	// UPDATE ET POST A LA FOIS CA MARCHE C'EST BEAU
	// SAUF QUAND TU VEUX INSERT UN TRUC QUI EXISTE DEJA ET QUE EN FAIT CA UPDATE APRES T'A L'AIR CON
	// console.log(monObj);
	var requalification = new RowData({_id: monObj["_id"], type: "criticality_requalify"});
	requalification.save(monObj, {success: function(model, response) {
			big_sherif.requalificationList.scrollTop();
			}});
	// FIN

	document.forms["addarequalification"].reset();
	$( "#addrequalificationdlg" ).dialog( "close" );
	$( "#addrequalificationbtn" ).click(function() {
			$( "#addrequalificationdlg" ).dialog( "open" );
			});

};

function editRequalification(id) {
	if (id)
	{
		var truc = $( "#addrequalificationdlg" ).prev().html();
		$( "#addrequalificationdlg" ).prev().html(truc.replace("Ajout", "Edition"));
		$( "#addrequalificationdlg" ).attr("title", "Edition d'une règle de requalification");
		var requalification = new RowData({_id: id, type: "criticality_requalify"});
		requalification.fetch({
success: function (model, response, options){
$("#addrequalificationdlg").load("/static/templates/addrequalificationdlg.html", function(){
	var monObj = model.toJSON();
	document.forms["addarequalification"]["_id"].value = monObj["_id"];
	document.forms["addarequalification"]["component"].value = monObj["component"];
	document.forms["addarequalification"]["resource"].value = monObj["resource"];
	document.forms["addarequalification"]["connector"].value = monObj["connector"];
	document.forms["addarequalification"]["criticality_transcode"].value = monObj["criticality_transcode"];
	document.forms["addarequalification"]["criticality_requalify"].value = monObj["criticality_requalify"];


	$( "#addrequalificationdlg" ).dialog({
autoOpen: false,
width: 500,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

});
$( "#addrequalificationbtn" ).click(function() {
		$( "#addrequalificationdlg" ).dialog( "open" );
		});
});
$( "#addrequalificationdlg" ).dialog( "open" );
//// console.log("Managed to retrieve event "+model.id);
},
error: function (model, response, options){
	       // console.log("Did not manage to fetch the event "+model.type + "/" + model.id);
       }
});
}
else
{
	alert("une erreur s'est produite");
}
}

function delRequalification(id) {
	if (id)
	{
		// console.log(id + "alone");
		var group = new RowData({ _id: id ,type: "criticality_requalify"});
		group.destroy({success: function(model, response) {
				big_sherif.requalificationList.scrollTop();
				}});
	}
	else
	{
		$('#mainrequalificationListTableId :checked').each(function() {
				var current_id = $(this).attr("id").replace("checkrequalification", "");
				// console.log($(this).attr("id").replace("checkrequalification", "") + "not alone");
				var group = new RowData({ _id: current_id ,type: "criticality_requalify"});
				group.destroy({success: function(model, response) {
					big_sherif.requalificationList.scrollTop();
					}});
				});
	}
}


big_sherif.init = function() {
	$.cookie.json = true;
	setChallenge();

	var BigsherifRouter = Backbone.Router.extend({
routes: {
"login": "loginPage",
"": "dashboardPage",
"Welcome": "dashboardPage",
"currentEventLog": "currentEventLog",
"currentEventLogHistory": "currentEventLogHistory",
"eventLog": "eventLog",
"hostList": "hostList",
"whiteList": "whiteList",
"blackList": "blackList",
"poolList": "poolList",
"duplicateRulesList": "duplicateRulesList",
"duplicateList": "duplicateList",
"criticalityList": "criticalityList",
"connectorList": "connectorList",
"requalificationList": "requalificationList",
"userList": "userList",
"groupList": "groupList",
"cartographyList": "cartographyList",
"cartography/:id": "cartography",
"cartographyEdit/:id": "cartographyEdit",
"event/:id": "eventPage",
"eevent/:id": "eeventPage",
"host/:id": "hostPage",
"pool/:id": "poolPage",
"signOut": "signOut",
"*actions": "defaultRoute"
	},
defaultRoute: function() {
		      this.navigate("");
	      },
loginPage: function() {
		   $("#app_container").html(render("loginPage", {}));
		   $("#loginForm").submit(function(event) {
				   attemptLogin();
				   return(false);
				   });
	   },
signOut: function(){
		 $.removeCookie("big_sherif_session", {path: "/"});
		 this.navigate("");
		 location.reload();
	 },
tab_preflight: function(tab_id, tab_label) {
		       var check = true;
		       if ($("#tabPanel").length == 0){
			       this.dashboardPage();
			       check = false;
		       }
		       if ($("#"+tab_id).length == 0){
			       $("#tabPanel").append('<div id="'+tab_id+'"></div>');
			       $($("#tabPanel").find( ".ui-tabs-nav" )[0].lastChild).before('<li><a href="#'+tab_id+'">'+tab_label+'</a><span class="ui-icon ui-icon-close" role="presentation">Remove Tab</span></li>');
			       $("#tabPanel").tabs("refresh");
			       check = false;
		       }
		       var index = $('#tabPanel a[href="#'+tab_id+'"]').parent().index();
		       $("#tabPanel").tabs("option", "active", index);
		       return check;
	       },
eventPage: function(id) {
		   var event = new RowData({_id: id, type: "currentevents"});
		   var eventView = new EventView({model: event});
		   eventView.$el = $("#app_container");
	   },
eeventPage: function(id) {
		   var event = new RowData({_id: id, type: "events"});
		   var eventView = new EventView({model: event});
		   eventView.$el = $("#app_container");
	   },

hostPage: function(id) {
		  var host = new RowData({_id: id, type: "hosts"});
		  var hostView = new HostView({model: host});
		  hostView.$el = $("#app_container");
		  document.title = id + ": Big Sherif";

	  },
poolPage: function(id) {
		  var pool = new RowData({_id: id, type: "hosts"});
		  var poolView = new PoolView({model: pool});
		  poolView.$el = $("#app_container");
		  document.title = id + ": Big Sherif";

	  },

cartography: function(id) {
		     var html = render("cartography",
				     {
id : id
});
$("#app_container").html(html);
},
cartographyEdit: function(id) {
		     var html = render("cartographyEdit",
				     {
id : id
});
$("#app_container").html(html);
},

cartographyList: function() {
			 if (!this.tab_preflight("cartographyList", "Cartographie")) {
				 $.ajax({
url: '/api/cartography',
type: 'get',
dataType: 'json',
success: function(data){
var html = render("cartographyList",
	{
list: data
});
$("#cartographyList").html(html);
},
error: function(e){
console.log(e.message);
}
});
}
},
eventLog: function(id) {
		  // Render Event Log
		  if (!this.tab_preflight("eventLog", "Journal des événements")) {
			  big_sherif.eventLog = new dataGrid({
type: "events",
sorting: "timestamp_start",
column_names: [
// {
// label: "Fiche d'aide",
// field: "",
// format: function(data) {
//
// }
// },
{
label: " ",
field: "component",
css_class: "column_fiche",
width: "32px",
format: function(data) {
// lien qui ouvre la fiche host
return new Handlebars.SafeString('<a href="/#host/'+data+'" target="_blank"><i title="Fiche équipement" class="icon-2x icon-hdd"></i></a>');
}
},
{
label: " ",
       field: "_id",
       css_class: "column_fiche",
	width: "32px",
	format: function(data) {
		// lien qui ouvre la fiche event
		return new Handlebars.SafeString('<a href="/#eevent/'+data+'" target="_blank"><i title="Fiche événement" class="icon-2x icon-file-alt"></i></a>');
	}
},
	// {
	// label: "Incident associé",
	// field: "ticket",
	// format: function(data) {
	//lien qui ouvre la fiche ticket
	// }
	// },
{
label: "Equipement",
       field: "component",
       css_class: "",
	width: "160px",
	format: function(data) {
		// lien qui ouvre la fiche host
		return data;
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
			return '<i title="OK" style="color:Green;" class="icon-2x icon-ok-circle"></i>'
		}
		if (data == 1) {
			return '<i title="WARNING" style="color:Gold;" class="icon-2x icon-warning-sign"></i>'
		}
		if (data == 4) {
			return '<i title="MINEUR" style="color:DarkOrange;" class="icon-2x icon-warning-sign"></i>'
		}
		if (data == 5) {
			return '<i title="MAJEUR" style="color:FireBrick;" class="icon-2x icon-warning-sign"></i>'
		}
		if (data == 2) {
			return '<i title="CRITIQUE" style="color:FireBrick;" class="icon-2x icon-remove-sign"></i>'
		}
		if (data == 3) {
			return '<i title="UNKNOWN" style="color:FireBrick;" class="icon-2x icon-question-sign"></i>'
		}
		return data;
	}
},
{
label: "Date",
       field: "timestamp_start",
       css_class: "",
	width: "150px",
	format: function(data) {
		var event_time = new Date(parseInt(data) * 1000);
		return event_time.toLocaleString();
	}
},
{
label: "Domaine",
       field: "pool_domaine",
//       css_class: "sorting",
	width: "160px",
	format: function(data) {
		if (data == null) {
			return "Aucun";
		}
		// check le type de pool
		return getpoolsfromdata(data, "Domaine");
	}
},
{
label: "Périmètre",
       field: "pool_perimetre",
//       css_class: "sorting",
	width: "160px",
	format: function(data) {
		if (data == null) {
			return "Aucun";
		}
		// check le type de pool
		return getpoolsfromdata(data, "Périmètre");
	}
},
{
label: "Ressource",
       field: "resource",
       css_class: "",
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
       css_class: "",
	format: function(data) {
		return data;
	}
}
]
});
var eventLogView = new dataGridView({collection: big_sherif.eventLog, "tableId": "mainEventLogTableId", timeout: 3000});
eventLogView.$el = $("#eventLog");
eventLogView.render();
}
},
currentEventLog: function(id) {
			 // Render CurrentEvent
			 if (!this.tab_preflight("currentEventLog", "Bac d'alarmes")) {
				 big_sherif.currentEventLog = new CurrentEvents({type: "currentevents",
						 sorting: "state,weight,timestamp_start",
						 column_names: [
						 // {
						 // label: "Fiche d'aide",
						 // field: "",
						 // format: function(data) {
						 //
						 // }
						 // },
						 {
label: " ",
field: "component",
css_class: "column_fiche",
width: "32px",
format: function(data) {
// lien qui ouvre la fiche host
return new Handlebars.SafeString('<a href="/#host/'+data+'" target="_blank"><i title="Fiche équipement" class="icon-2x icon-hdd"></i></a>');
}
},
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
	// {
	// label: "Incident associé",
	// field: "ticket",
	// format: function(data) {
	//lien qui ouvre la fiche ticket
	// }
	// },
{
label: "Equipement",
       field: "component",
       // css_class: "sorting",
       width: "160px",
       format: function(data) {
	       // lien qui ouvre la fiche host
	       return data;
       }
},
{
label: "",
       field: "state",
       // css_class: "column_fiche sorting",
       css_class: "column_fiche",
	width: "32px",
	format: function(data) {
		// kikou logo et couleur qui clake
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
			return '<i title="Info" style="color:grey;" class="icon-2x icon-info-sign"></i>'
		}

		return data;
	}
},
{
label: "",
       field: "criticality",
       // css_class: "column_fiche sorting",
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
       // css_class: "sorting",
       width: "150px",
       format: function(data) {
	       var event_time = new Date(parseInt(data) * 1000);
	       return event_time.toLocaleString();
       }
},
{
label: "Domaine",
       field: "pool_domaine",
       // css_class: "sorting",
       width: "160px",
       format: function(data) {
	       if (data == null) {
		       return "Aucun";
	       }
	       // check le type de pool
	       return getpoolsfromdata(data, "Domaine");
       }
},
{
label: "Périmètre",
       field: "pool_perimetre",
       // css_class: "sorting",
       width: "160px",
       format: function(data) {
	       if (data == null) {
		       return "Aucun";
	       }
	       // check le type de pool
	       return getpoolsfromdata(data, "Périmètre");
       }
},
{
label: "Ressource",
       field: "resource",
       // css_class: "sorting",
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
       // css_class: "sorting",
       format: function(data) {
	       return data;
       }
}
]});
var currentEventLogView = new dataGridView({collection: big_sherif.currentEventLog, "tableId": "mainCurrentEventLogTableId", timeout: 3000});
currentEventLogView.$el = $("#currentEventLog");
currentEventLogView.render();
}
},
currentEventLogHistory: function(id) {
				// Render CurrentEvent
				if (!this.tab_preflight("currentEventLogHistory", "Bac d'événements")) {
					big_sherif.currentEventLogHistory = new dataGrid({type: "currenteventshistory",
							sorting: "timestamp_start",
							column_names: [
							// {
							// label: "Fiche d'aide",
							// field: "",
							// format: function(data) {
							//
							// }
							// },
							{
label: " ",
field: "component",
css_class: "column_fiche",
width: "32px",
format: function(data) {
// lien qui ouvre la fiche host
return new Handlebars.SafeString('<a href="/#host/'+data+'" target="_blank"><i title="Fiche équipement" class="icon-2x icon-hdd"></i></a>');
}
},
{
label: " ",
       field: "_id",
       width: "32px",
       css_class: "column_fiche",
	format: function(data) {
		// lien qui ouvre la fiche event
		return new Handlebars.SafeString('<a href="/#event/'+data+'" target="_blank"><i title="Fiche événement" class="icon-2x icon-file-alt"></i></a>');
	}
},
	// {
	// label: "Incident associé",
	// field: "ticket",
	// format: function(data) {
	//lien qui ouvre la fiche ticket
	// }
	// },
{
label: "Equipement",
       field: "component",
       css_class: "",
	width: "160px",
	format: function(data) {
		// lien qui ouvre la fiche host
		return data;
	}
},
{
label: "",
       field: "state",
       css_class: "column_fiche ",
	width: "32px",
	format: function(data) {
		// kikou logo et couleur qui clake
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
			return '<i title="Info" style="color:grey;" class="icon-2x icon-info-sign"></i>'
		}

		return data;
	}
},
{
label: "",
       field: "criticality",
       css_class: "column_fiche ",
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
       css_class: "",
	width: "150px",
	format: function(data) {
		var event_time = new Date(parseInt(data) * 1000);
		return event_time.toLocaleString();
	}
},
{
label: "Domaine",
       field: "pool_domaine",
    //   css_class: "sorting",
	width: "160px",
	format: function(data) {
		if (data == null) {
			return "Aucun";
		}
		// check le type de pool
		return getpoolsfromdata(data, "Domaine");
	}
},
{
label: "Périmètre",
       field: "pool_perimetre",
      // css_class: "sorting",
	width: "160px",
	format: function(data) {
		if (data == null) {
			return "Aucun";
		}
		// check le type de pool
		return getpoolsfromdata(data, "Périmètre");
	}
},
{
label: "Ressource",
       field: "resource",
       css_class: "",
	width: "160px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Description",
       field: "output",
       css_class: "",
	width: "100%",
	format: function(data) {
		return data;
	}
}
]});
var currentEventLogHistoryView = new dataGridView({collection: big_sherif.currentEventLogHistory, "tableId": "mainCurrentEventLogHistoryTableId", timeout: 3000});
currentEventLogHistoryView.$el = $("#currentEventLogHistory");
currentEventLogHistoryView.render();
}
},
hostList: function(id) {
		  // Render Host List
		  if (!this.tab_preflight("hostList", "Liste des équipements")) {
			  big_sherif.hostList = new dataGrid({
type: "hosts",
sorting: "hostname",
descending: false,
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "70px",
format: function(data) {
return '<input id="checkhost_'+data+'" type="checkbox" /><!-- <i style="cursor: pointer;" class="icon-edit icon-large" onclick=\'editHost("'+data+'")\'></i> --><i style="cursor: pointer;" class="icon-trash icon-large" onclick=\'delPoolMember("'+data+'")\'></i>';
}
},

{
label: "Nom d'équipement",
field: "hostname",
css_class: "",
width: "160px",
format: function(data) {
	// lien qui ouvre la fiche host
	return new Handlebars.SafeString('<a href="/#host/'+data+'" target="_blank">'+data+'</a>');
}
},
{
label: "Adresse IP",
       field: "address",
       css_class: "",
	width: "100px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: " ",
       field: "resource",
       width: "32px",
       // css_class: "sorting column_fiche",
       css_class: "column_fiche",
	format: function(data) {
		// key "Host status" dans la resource
		// console.log(data);
		return '<i class="icon-info-sign icon-large" title="broken"></i>'
	}
},
{
label: "Domaine",
       field: "pool_domaine",
    //   css_class: "sorting",
	width: "160px",
	format: function(data) {
		// check le type de pool
		if (data == null) {
			return "Aucun";
		}
		return getpoolsfromdata(data, "Domaine");
	}
},
{
label: "Périmètre",
       field: "pool_perimetre",
      // css_class: "sorting",
	width: "160px",
	format: function(data) {
		// check le type de pool
		if (data == null) {
			return "Aucun";
		}
		return getpoolsfromdata(data, "Périmètre");
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
// {
// label: "Localisation",
// field: "location",
// format: function(data) {
// peut ne pas exister
// }
// },
]
});
var hostListView = new dataGridView({collection: big_sherif.hostList, "tableId": "mainHostListTableId"});
hostListView.$el = $("#hostList");
hostListView.render();
$("#menuBar_mainHostListTableId").html('<ul class="button-bar" style="padding-bottom: 15px"><li><li><a href="javascript:void(0);" onclick="delHost();"><i class="icon-trash" ></i>Supprimer</a></li></ul>')
}
},
whiteList: function(id) {
		   // Render Whitelist management page
		   if(!this.tab_preflight("whiteList", "Liste blanche")) {
			   big_sherif.whiteList = new dataGrid({
type: "whitelist",
sorting: "label",
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "70px",
format: function(data) {
return '<input id="checkwhitelist'+data+'" type="checkbox" /> <i style="cursor: pointer;" class="icon-edit icon-large" onclick=\'editWhitelist("'+data+'")\'></i> <i style="cursor: pointer;" class="icon-trash icon-large" onclick=\'delWhitelist("'+data+'")\'></i>';
}
},

{
label: "",
field: "stop",
css_class: "column_fiche ",
width: "32px",
format: function(data) {
return wbrule_isiton(data);
}
},
{
label: "Nom",
       css_class: "",
	field: "label",
	width: "160px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Priorité",
       field: "order",
       css_class: "",
	width: "100px",
	format: function(data) {
		//
		return data;
	}
},
{
label: "Filtre équipement",
       field: "hostname",
       css_class: "",
	width: "160px",
	format: function(data) {
		// concatenation de hostname, resource, connector_name et criticality
		return data;
	}
},
{
label: "Filtre ressource",
       field: "resource",
       css_class: "",
	width: "160px",
	format: function(data) {
		//
		return data;
	}
},
{
label: "Filtre connecteur",
       field: "connector_name",
       css_class: "",
	width: "160px",
	format: function(data) {
		// check le type de pool
		return data;
	}
},
{
label: "Filtre criticité",
       field: "criticality",
       css_class: "",
	width: "100px",
	format: function(data) {
		// check le type de pool
		return data;
	}
},
{
label: "Description",
       field: "desc",
       css_class: "",
	width: "100%",
	format: function(data) {
		return data;
	}
}]
});
var whiteListView = new dataGridView({collection: big_sherif.whiteList, "tableId": "mainWhiteListTableId"});
whiteListView.$el = $("#whiteList");
whiteListView.render();
$("#menuBar_mainWhiteListTableId").html('<ul class="button-bar" style="padding-bottom: 15px"><li><a href="javascript:void(0);" id="addwhitelistbtn"><i class="icon-plus" ></i>Ajouter</a></li><li><a href="javascript:void(0);" onclick="delWhitelist();"><i class="icon-trash" ></i>Supprimer</a></li><!--<li><a href="javascript:void(0);" onclick="dupWhitelist();"><i class="icon-copy" ></i>Dupliquer</a></li>--></ul><div id="addwhitelistdlg" title="Ajout d\'une entrée en liste blanche"></div>');
$("#addwhitelistdlg").load("/static/templates/addwhitelistdlg.html", function(){
		$( "#addwhitelistdlg" ).dialog({
autoOpen: false,
width: 500,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

});
		$( "#addwhitelistbtn" ).click(function() {
			$( "#addwhitelistdlg" ).dialog( "open" );
			var truc = $( "#addwhitelistdlg" ).prev().html();
			$( "#addwhitelistdlg" ).prev().html(truc.replace("Edition", "Ajout"));
			$( "#addwhitelistdlg" ).attr("title", "Edition d'une whitelist");
			});
		});

}

},
blackList: function(id) {
		   // Render Blacklist management page
		   if(!this.tab_preflight("blackList", "Liste noire")) {
			   big_sherif.blackList = new dataGrid({
type: "blacklist",
sorting: "label",
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "70px",
format: function(data) {
return '<input id="checkblacklist'+data+'" type="checkbox" /> <i style="cursor: pointer;" class="icon-edit icon-large" onclick=\'editBlacklist("'+data+'")\'></i> <i style="cursor: pointer;" class="icon-trash icon-large" onclick=\'delBlacklist("'+data+'")\'></i>';
}
},

{
label: "",
field: "stop",
width: "32px",
format: function(data) {
// icone verte ou rouge
return wbrule_isiton(data);
}
},
{
label: "Nom",
       field: "label",
       css_class: "",
	width: "100px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Priorité",
       field: "order",
       css_class: "",
	width: "100px",
	format: function(data) {
		//
		return data;
	}
},
{
label: "Filtre équipement",
       field: "hostname",
       css_class: "",
	width: "100px",
	format: function(data) {
		// concatenation de hostname, resource, connector_name et criticality
		return data;
	}
},
{
label: "Filtre ressource",
       field: "resource",
       css_class: "",
	width: "100px",
	format: function(data) {
		//
		return data;
	}
},
{
label: "Filtre connecteur",
       field: "connector_name",
       css_class: "",
	width: "100px",
	format: function(data) {
		// check le type de pool
		return data;
	}
},
{
label: "Filtre criticité",
       field: "criticality",
       css_class: "",
	width: "100px",
	format: function(data) {
		// check le type de pool
		return data;
	}
},
{
label: "Description",
       field: "desc",
       css_class: "",
	width: "100%",
	format: function(data) {
		return data;
	}
}]
});
var blackListView = new dataGridView({collection: big_sherif.blackList, "tableId": "mainBlackListTableId"});
blackListView.$el = $("#blackList");
blackListView.render();
$("#menuBar_mainBlackListTableId").html('<ul class="button-bar" style="padding-bottom: 15px"><li><a href="javascript:void(0);" id="addblacklistbtn"><i class="icon-plus" ></i>Ajouter</a></li><li><a href="javascript:void(0);" onclick="delBlacklist();"><i class="icon-trash" ></i>Supprimer</a></li><!--<li><a href="javascript:void(0);" onclick="dupBlacklist();"><i class="icon-copy" ></i>Dupliquer</a></li>--></ul><div id="addblacklistdlg" title="Ajout d\'une entrée en liste noire"></div>');
$("#addblacklistdlg").load("/static/templates/addblacklistdlg.html", function(){
		$( "#addblacklistdlg" ).dialog({
autoOpen: false,
width: 500,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

});
		$( "#addblacklistbtn" ).click(function() {
			$( "#addblacklistdlg" ).dialog( "open" );
			var truc = $( "#addblacklistdlg" ).prev().html();
			$( "#addblacklistdlg" ).prev().html(truc.replace("Edition", "Ajout"));
			$( "#addblacklistdlg" ).attr("title", "Edition d'une blacklist");
			});
		});

}              
},
poolList: function(id) {
		  // Render pool list management page
		  if(!this.tab_preflight("poolList", "Gestion des regroupements")) {
			  big_sherif.poolList = new dataGrid({
type: "component_pool",
sorting:"pool_name",
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "70px",
format: function(data) {
return '<input id="checkpool'+data+'" type="checkbox" /> <i style="cursor: pointer;" class="icon-edit icon-large" onclick=\'editPool("'+data+'")\'></i> <i style="cursor: pointer;" class="icon-trash icon-large" onclick=\'delPool("'+data+'")\'></i>';
}
},
{
label: "Type de regroupement",
field: "pool_type_name",
css_class: "",
width: "160px",
format: function(data) {
// 
return data;
}
},
{
label: "Nom de regroupement",
       field: "pool_name",
       css_class: "",
	width: "160px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Description",
       field: "desc",
       css_class: "",
	width: "100%",
	format: function(data) {
		return data;
	}
}]
});
var poolListView = new dataGridView({collection: big_sherif.poolList, "tableId": "mainPoolListTableId"});
poolListView.$el = $("#poolList");
poolListView.render();
$("#menuBar_mainPoolListTableId").html('<ul class="button-bar" style="padding-bottom: 15px"><li><a href="javascript:void(0);" id="addpoolbtn"><i class="icon-plus" ></i>Ajouter</a></li><li><a href="javascript:void(0);" onclick="delPool();"><i class="icon-trash" ></i>Supprimer</a></li><!--<li><a href="javascript:void(0);" onclick="dupPool();"><i class="icon-copy" ></i>Dupliquer</a></li>--></ul><div id="addpooldlg" title="Ajout d\'un regroupement"></div>');
$("#addpooldlg").load("/static/templates/addpooldlg.html", function(){
		$( "#addpooldlg" ).dialog({
autoOpen: false,
width: 500,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

});
		$( "#addpoolbtn" ).click(function() {
			$( "#addpooldlg" ).dialog( "open" );
			var truc = $( "#addpooldlg" ).prev().html();
			$( "#addpooldlg" ).prev().html(truc.replace("Edition", "Ajout"));
			$( "#addpooldlg" ).attr("title", "Edition d'un pool");
			document.forms["addapool"]["pool_name"].disabled = false;
			document.forms["addapool"]["pool_type_name"].disabled = false;
			});
});


}       
},
duplicateRulesList: function(id) {
			    // Render duplicateRules list management page
			    if(!this.tab_preflight("duplicateRulesList", "Rêgles de gestion des doublons")) {
				    big_sherif.duplicateRulesList = new dataGrid({
type: "component_deduplicate",
sorting:"_id",
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "70px",
format: function(data) {
return '<input id="checkdr'+data+'" type="checkbox" /> <i style="cursor: pointer;" class="icon-edit icon-large" onclick=\'editDuplicaterulelist("'+data+'")\'></i> <i style="cursor: pointer;" class="icon-trash icon-large" onclick=\'delDuplicaterulelist("'+data+'")\'></i>';
}
},
{
label: "",
field: "stop",
width: "32px",
format: function(data) {
//
return wbrule_isiton(data);
return data;
}
},
{
label: "équipement source",
       field: "component_src",
       css_class: "",
	width: "160px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Adresse ip source",
       field: "address_src",
       css_class: "",
	width: "160px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "équipement de destination",
       field: "component_dest",
       css_class: "",
	width: "200px",
	format: function(data) {
		//
		return data;
	}
},
{
label: "Adresse de destination",
       field: "address_dest",
       css_class: "",
	width: "160px",
	format: function(data) {
		//
		return data;
	}
},
{
label: "Description",
       field: "desc",
       css_class: "",
	width: "160px",
	format: function(data) {
		//
		return data;
	}
}]
});
var duplicateRulesListView = new dataGridView({collection: big_sherif.duplicateRulesList, "tableId": "mainduplicateRulesListTableId"});
duplicateRulesListView.$el = $("#duplicateRulesList");
duplicateRulesListView.render();
$("#menuBar_mainduplicateRulesListTableId").html('<ul class="button-bar" style="padding-bottom: 15px"><li><a href="javascript:void(0);" id="addduplicaterulelistbtn"><i class="icon-plus" ></i>Ajouter</a></li><li><a href="javascript:void(0);" onclick="delDuplicaterulelist();"><i class="icon-trash" ></i>Supprimer</a></li></ul><div id="addduplicaterulelistdlg" title="Ajout d\'une règle de duplication"></div>');
$("#addduplicaterulelistdlg").load("/static/templates/addduplicaterulelistdlg.html", function(){
		$( "#addduplicaterulelistdlg" ).dialog({
autoOpen: false,
width: 500,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

});
		$( "#addduplicaterulelistbtn" ).click(function() {
			$( "#addduplicaterulelistdlg" ).dialog( "open" );
			var truc = $( "#addduplicaterulelistdlg" ).prev().html();
			$( "#addduplicaterulelistdlg" ).prev().html(truc.replace("Edition", "Ajout"));
			$( "#addduplicaterulelistdlg" ).attr("title", "Edition d'une règle de duplication");
			});
		});


}       
},duplicateList: function(id) {
	// Render duplicate list management page
	if(!this.tab_preflight("duplicateList", "Liste des doublons")) {
		big_sherif.duplicateList = new dataGrid({
type: "duplicate_entry",
sorting: "_id",
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "45px",
format: function(data) {
return '<input id="checkdl'+data+'" type="checkbox" /><i title="Confirmation et creation automatique de la règle" style="cursor: pointer;" class="icon-link icon-large" onclick=\'linkHostDuplicate("'+data+'")\'></i><i title="Créer un nouvel hôte" style="cursor: pointer;" class="icon-copy icon-large" onclick=\'newHostDuplicate("'+data+'")\'></i> <i title="Supprimer" style="cursor: pointer;" class="icon-trash icon-large" onclick=\'delDuplicatelist("'+data+'")\'></i>';
}
},
{
label: "Type de doublon",
field: "duplicate_type",
css_class: "",
width: "300px",
format: function(data) {
return data;
}
},
{
label: "Elément dupliqué",
       field: "duplicate_reason",
       css_class: "",
	width: "160px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Elément connu",
       field: "primary_entry",
       css_class: "",
	width: "250px",
	format: function(data) {
		// component et address
		toreturn = "";
		for (var key in data) {
			if (toreturn != "")
			{
				toreturn += ", <br>";
			}
			toreturn += key + ' = ' + data[key];
		}
		return toreturn;
	}
},
{
label: "Doublon",
       field: "duplicate_entry",
       width: "100%",
       format: function(data) {
	       // component et addresse et connector_name
	       toreturn = "";
	       for (var key in data) {
		       if (toreturn != "")
		       {
			       toreturn += ", <br>";
		       }
		       toreturn += key + ' = ' + data[key];
	       }
	       return toreturn;
       }
}]
});
var duplicateListView = new dataGridView({collection: big_sherif.duplicateList, "tableId": "mainduplicateListTableId"});
duplicateListView.$el = $("#duplicateList");
duplicateListView.render();
$("#menuBar_mainduplicateListTableId").html('<ul class="button-bar" style="padding-bottom: 15px"><li><a href="javascript:void(0);" onclick="delDuplicatelist();"><i class="icon-trash" ></i>Supprimer</a></li></ul><div id="addhostduplicatedlg" title="Ajout d\'un doublon"></div>');

}       
},criticalityList: function(id) {
	// Render criticality list management page
	if(!this.tab_preflight("criticalityList", "Gestion des niveaux de criticité")) {
		big_sherif.criticalityList = new dataGrid({
type: "criticalitylist",
sorting: "_id",
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "70px",
format: function(data) {
return '<input id="checkcriticality'+data+'" type="checkbox" /> <i style="cursor: pointer;" class="icon-edit icon-large" onclick=\'editCriticality("'+data+'")\'></i> <i style="cursor: pointer;" class="icon-trash icon-large" onclick=\'delCriticality("'+data+'")\'></i>';
}
},
{
label: "Id",
field: "_id",
css_class: "",
width: "70px",
format: function(data) {
return data;
}
},
{
label: "Label",
       field: "label",
       css_class: "",
	width: "70px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Poids",
       field: "weight",
       css_class: "",
	width: "70px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Description",
       field: "desc",
       css_class: "",
	width: "100%",
	format: function(data) {
		// 
		return data;
	}
}]
});
var criticalityListView = new dataGridView({collection: big_sherif.criticalityList, "tableId": "maincriticalityListTableId"});
criticalityListView.$el = $("#criticalityList");
criticalityListView.render();
$("#menuBar_maincriticalityListTableId").html('<ul class="button-bar" style="padding-bottom: 15px"><li><a href="javascript:void(0);" id="addcriticalitybtn"><i class="icon-plus" ></i>Ajouter</a></li><li><a href="javascript:void(0);" onclick="delCriticality();"><i class="icon-trash" ></i>Supprimer</a></li></ul><div id="addcriticalitydlg" title="Ajout d\'une criticité"></div>');
$("#addcriticalitydlg").load("/static/templates/addcriticalitydlg.html", function(){
		$( "#addcriticalitydlg" ).dialog({
autoOpen: false,
width: 500,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

});
		$( "#addcriticalitybtn" ).click(function() {
			$( "#addcriticalitydlg" ).dialog( "open" );
			var truc = $( "#addcriticalitydlg" ).prev().html();
			$( "#addcriticalitydlg" ).prev().html(truc.replace("Edition", "Ajout"));
			$( "#addcriticalitydlg" ).attr("title", "Edition d'une criticité");
			document.forms["addacriticality"]["id"].disabled = false;
			});
		});


}       
},connectorList: function(id) {
	// Render connector list management page
	if(!this.tab_preflight("connectorList", "Gestion des connecteurs")) {
		big_sherif.connectorList = new dataGrid({
type: "connectorlist",
sorting:"_id",
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "70px",
format: function(data) {
return '<input id="checkconnector'+data+'" type="checkbox" /> <i style="cursor: pointer;" class="icon-edit icon-large" onclick=\'editConnector("'+data+'")\'></i> <i style="cursor: pointer;" class="icon-trash icon-large" onclick=\'delConnector("'+data+'")\'></i>';
}
},
{
label: "",
field: "connector_status",
css_class: "column_fiche ",
width: "32px",
format: function(data) {
// logo inconnu /suspendu / actif
if (data == 1)
	return '<i class="icon-eye-close icon-large" title="Suspendu" style="color: blue"></i>';
if (data == 2)
	return '<i class="icon-thumbs-up icon-large" title="Actif" style="color: green"></i>';
if (data == 0)
	return '<i class="icon-thumbs-down icon-large" title="En attente d\'activation" style="color: red"></i>';
}
},

{
label: "Nom",
       field: "_id",
       css_class: "",
	width: "100px",
	format: function(data) {
		return data;
	}
},
{
label: "Type",
       field: "connector",
       css_class: "",
	width: "100px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Famille",
       field: "connector_family",
       css_class: "",
	width: "100px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Hote du connecteur",
       field: "connector_hostname",
       css_class: "",
	width: "160px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Ip",
       field: "connector_hostip",
       css_class: "",
	width: "100%",
	format: function(data) {
		// 
		return data;
	}
}
]
});
var connectorListView = new dataGridView({collection: big_sherif.connectorList, "tableId": "mainconnectorListTableId"});
connectorListView.$el = $("#connectorList");
connectorListView.render();
$("#menuBar_mainconnectorListTableId").html('<ul class="button-bar" style="padding-bottom: 15px"><li><a href="javascript:void(0);" id="addconnectorbtn"><i class="icon-plus" ></i>Ajouter</a></li><li><a href="javascript:void(0);" onclick="delConnector();"><i class="icon-trash" ></i>Supprimer</a></li></ul><div id="addconnectordlg" title="Ajout d\'un connecteur"></div><div id="addtranscodedlg" title="Ajout d\'un transcodage"></div>');

$("#addtranscodedlg").load("/static/templates/addtranscodedlg.html", function(){
		$( "#addtranscodedlg" ).dialog({
autoOpen: false,
width: 500,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

});
		});

$("#addconnectordlg").load("/static/templates/addconnectordlg.html", function(){
		$( "#addconnectordlg" ).dialog({
autoOpen: false,
width: 500,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

});
		$( "#addconnectorbtn" ).click(function() {
			$( "#addconnectordlg" ).dialog( "open" );
			var truc = $( "#addconnectordlg" ).prev().html();
			$( "#addconnectordlg" ).prev().html(truc.replace("Edition", "Ajout"));
			$( "#addconnectordlg" ).attr("title", "Edition d'une criticité");
			document.forms["addaconnector"]["nom"].disabled = false;
			});
		});

}       
},requalificationList: function(id) {
	// Render requalification list management page
	if(!this.tab_preflight("requalificationList", "Gestion de la requalification")) {
		big_sherif.requalificationList = new dataGrid({
type: "criticality_requalify",
sorting: "_id",
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "70px",
format: function(data) {
return '<input id="checkrequalification'+data+'" type="checkbox" /> <i style="cursor: pointer;" class="icon-edit icon-large" onclick=\'editRequalification("'+data+'")\'></i> <i style="cursor: pointer;" class="icon-trash icon-large" onclick=\'delRequalification("'+data+'")\'></i>';
}
},
{
label: "Equipement",
field: "component",
css_class: "",
width: "160px",
format: function(data) {
// 
return data;
}
},
{
label: "ressource",
       field: "resource",
       css_class: "",
	width: "160px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Connecteur",
       field: "connector",
       css_class: "",
	width: "160px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Criticité d'entrée",
       field: "criticality_transcode",
       css_class: "",
	width: "200px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Criticité requalifée",
       field: "criticality_requalify",
       css_class: "",
	width: "100%",
	format: function(data) {
		// 
		return data;
	}
}]
});
var requalificationListView = new dataGridView({collection: big_sherif.requalificationList, "tableId": "mainrequalificationListTableId"});
requalificationListView.$el = $("#requalificationList");
requalificationListView.render();
$("#menuBar_mainrequalificationListTableId").html('<ul class="button-bar" style="padding-bottom: 15px"><li><a href="javascript:void(0);" id="addrequalificationbtn"><i class="icon-plus" ></i>Ajouter</a></li><li><a href="javascript:void(0);" onclick="delDuplicaterulelist();"><i class="icon-trash" ></i>Supprimer</a></li></ul><div id="addrequalificationdlg" title="Ajout d\'une règle de requalification"></div>');
$("#addrequalificationdlg").load("/static/templates/addrequalificationdlg.html", function(){
		$( "#addrequalificationdlg" ).dialog({
autoOpen: false,
width: 500,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

});
		$( "#addrequalificationbtn" ).click(function() {
			$( "#addrequalificationdlg" ).dialog( "open" );
			var truc = $( "#addrequalificationdlg" ).prev().html();
			$( "#addrequalificationdlg" ).prev().html(truc.replace("Edition", "Ajout"));
			$( "#addrequalificationdlg" ).attr("title", "Edition d'une règle de requalification");
			});
		});

}       
},userList: function(id) {
var groupList = new dataGrid({
type: "grouplist",
sorting: "_id",
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "32px",
format: function(data) {
return '<input id="checkusergroup'+data+'" type="checkbox" />';
}
},
{
label: "Nom",
field: "groupname",
width: "160px",
format: function(data) {
return data;
}
},
{
label: "Description",
       field: "desc",
       width: "300px",
       format: function(data) {
	       // 
	       return data;
       }
}]
});
var groupListView = new dataGridView({collection: groupList, "tableId": "testgroupListTableId"});

	// Render user list management page
	if(!this.tab_preflight("userList", "Gestion des profils utilisateur")) {
		big_sherif.userList = new dataGrid({
type: "userlist",
sorting: "_id",
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "70px",
format: function(data) {
return '<input id="checkuser'+data+'" type="checkbox" /> <i class="icon-edit icon-large" style="cursor: pointer;" onclick=\'editUser("'+data+'")\'></i> <i class="icon-trash icon-large" style="cursor: pointer;" onclick=\'delUser("'+data+'")\'></i>';
}
},
{
label: "Pseudonyme",
field: "_id",
css_class: "",
width: "160px",
format: function(data) {
// 
return data;
}
},
{
label: "Nom",
       field: "last_name",
       css_class: "",
	width: "160px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Prénom",
       field: "first_name",
       css_class: "",
	width: "160px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Groupes",
       field: "groups",
       css_class: "",
	width: "100%",
	format: function(data) {
		// 
		return data;
	}
}]
});
var userListView = new dataGridView({collection: big_sherif.userList, "tableId": "mainuserListTableId"});
userListView.$el = $("#userList");
userListView.render();
$("#menuBar_mainuserListTableId").html('<ul class="button-bar" style="padding-bottom: 15px"><li><a href="javascript:void(0);" id="adduserbtn"><i class="icon-plus" ></i>Ajouter</a></li><li><a href="javascript:void(0);" onclick="delUser();"><i class="icon-trash" ></i>Supprimer</a></li><!--<li><a href="javascript:void(0);" onclick="dupUser();"><i class="icon-copy" ></i>Dupliquer</a></li>--><li><a href="javascript:void(0);" onclick="lockUser();"><i class="icon-lock" ></i>(D&eacute;)Verrouiller</a></li></ul><div id="adduserdlg" title="Ajout d\'un utilisateur"></div>')
$("#adduserdlg").load("/static/templates/adduserdlg.html", function(){
		$( "#adduserdlg" ).on("dialogclose", function() { $('#adduserdlg :checked').each(function() { $(this).prop('checked', false); })});
		$( "#adduserdlg" ).dialog({
autoOpen: false,
width: 500,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}
});
		$( "#adduserbtn" ).click(function() {
			$( "#adduserdlg" ).dialog( "open" );
			var truc = $( "#adduserdlg" ).prev().html();
			$( "#adduserdlg" ).prev().html(truc.replace("Edition", "Ajout"));
			$( "#adduserdlg" ).attr("title", "Ajout d'un utilisateur");
			document.forms["addauser"]["username"].disabled = false;
			});
var groupList = new dataGrid({
type: "grouplist",
sorting: "_id",
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "32px",
format: function(data) {
return '<input id="checkusergroup'+data+'" type="checkbox" />';
}
},
{
label: "Nom",
field: "groupname",
width: "160px",
format: function(data) {
return data;
}
},
{
label: "Description",
       field: "desc",
       width: "300px",
       format: function(data) {
	       // 
	       return data;
       }
}]
});
var groupListView = new dataGridView({collection: groupList, "tableId": "addusergroupListTableId"});
groupListView.$el = $("#addusergrouplist");
groupListView.render();
$("#scrolling_area_addusergroupListTableId").css({"height" : "300px"});
});
}
},groupList: function(id) {
	// Render group list management page
	if(!this.tab_preflight("groupList", "Gestion des groupes utilisateur")) {
		big_sherif.groupList = new dataGrid({
type: "grouplist",
sorting: "_id",
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "70px",
format: function(data) {
return '<input id="checkgroup'+data+'" type="checkbox" /> <i style="cursor: pointer;" class="icon-edit icon-large" onclick=\'editGroup("'+data+'")\'></i> <i style="cursor: pointer;" class="icon-trash icon-large" onclick=\'delGroup("'+data+'")\'></i>';
}
},
{
label: "Nom",
field: "groupname",
css_class: "",
width: "300px",
format: function(data) {
// 
return data;
}
},
{
label: "Description",
       field: "desc",
       css_class: "",
	width: "300px",
	format: function(data) {
		// 
		return data;
	}
},
{
label: "Liste des droits",
       field: "permissions",
       width: "100%",
       format: function(data) {
	       // Metre u ncertain nombre de charactere et tronquer apres
	       return data;
       }
}]
});
var groupListView = new dataGridView({collection: big_sherif.groupList, "tableId": "maingroupListTableId"});
groupListView.$el = $("#groupList");
groupListView.render();
$("#menuBar_maingroupListTableId").html('<ul class="button-bar" style="padding-bottom: 15px"><li><a href="javascript:void(0);" id="addgroupbtn"><i class="icon-plus" ></i>Ajouter</a></li><li><a href="javascript:void(0);" onclick="delGroup();"><i class="icon-trash" ></i>Supprimer</a></li><!--<li><a href="javascript:void(0);" onclick="dupGroup();"><i class="icon-copy" ></i>Dupliquer</a></li>--></ul><div id="addgroupdlg" title="Ajout d\'un groupe"></div>')
$("#addgroupdlg").load("/static/templates/addgroupdlg.html", function(){
		$( "#addgroupdlg" ).dialog({
autoOpen: false,
width: 500,
show: {
effect: "blind",
duration: 100
},
hide: {
effect: "blind",
duration: 100
},
position: {
my: "top",
at: "top",
of: "#tabPanel"
}

});
		$( "#addgroupbtn" ).click(function() {
			$( "#addgroupdlg" ).dialog( "open" );
			var truc = $( "#addgroupdlg" ).prev().html();
			$( "#addgroupdlg" ).prev().html(truc.replace("Edition", "Ajout"));
			$( "#addgroupdlg" ).attr("title", "Edition d'un groupe");
			});
		var poolList = new dataGrid({
type: "component_pool",
sorting:"pool_name",
column_names: [
{
label: "",
field: "_id",
css_class: "column_fiche",
width: "32px",
format: function(data) {
return '<input id="checkgrouppool'+data+'" type="checkbox" />';
}
},
{
label: "Nom de regroupement",
field: "pool_name",
width: "160px",
format: function(data) {
// 
return data;
}
},

{
label: "Type",
       field: "pool_type_name",
       width: "80px",
       format: function(data) {
	       // 
	       return data;
       }
},
{
label: "Description",
       field: "desc",
       width: "100px",
       format: function(data) {
	       return data;
       }
}]
});
var poolListView = new dataGridView({collection: poolList, "tableId": "addgroupPoolListTableId"});
poolListView.$el = $("#addgrouppoollist");
poolListView.render();
$("#scrolling_area_addgroupPoolListTableId").css({"height" : "300px"});
});
}
},
dashboardPage: function() {
		       var session = $.cookie("big_sherif_session");
		       if (!session.isLogedIn) {
			       this.navigate("login" ,{trigger: true});
			       return;
		       }

		       // Set up page
		       $("#app_container").html(render("DashboardPage", {}));		

		       // Render Tabs and add Functionality
		       var tabs = $( "#tabPanel" ).tabs();
		       $( "#tabPanel" ).on( "tabsactivate", function( event, ui ) {
				       document.bigsherif_router.navigate(ui.newTab.context.hash);
				       } );
		       var menu = $("#menuBar").menu().hide()

			       $("#menu").button({
icons: {
primary: "ui-icon-gear",
secondary: "ui-icon-triangle-1-s"
},
text: false
}).click(function() {
	menu.show().position({
my: "left top",
at: "left bottom",
of: this
});
	$( document ).one( "click", function() {
		menu.hide();
		});
	return false;
	});

tabs.find( ".ui-tabs-nav" ).sortable({
axis: "x",
stop: function() {
tabs.tabs( "refresh" );
}
});
tabs.delegate( "span.ui-icon-close", "click", function() {
		var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
		$( "#" + panelId ).remove();
		tabs.tabs( "refresh" );
		});
if (_.indexOf(session["profile"]["groups"], "admin") >= 0) {
    $("#menuToHide").show();
}
this.navigate("currentEventLog" ,{trigger: true});

/*             // Sliding test
	       $("body").append('<div id="wrapper"><div id="overview" class="overview">Overview content <a id="fullpage_toggle">Set full page</a></div></div>');
	       $("#wrapper").append('<div id="fullpage" class="fullpage">Full page content <a id="closeall">close all</a></div>');
	       $("#overview").hide();
	       $("#fullpage").hide();
	       $("#slide_toggle").click(function(){
	       $("#overview").toggle("blind", {direction:"down"}, 500);

	       });
	       $("#fullpage_toggle").click(function(){
	       $("#fullpage").toggle("blind", {direction:"down"}, 500);

	       });
	       $("#closeall").click(function(){
	       $("#overview").toggle("blind", {direction:"down"}, 500);
	       $("#fullpage").toggle("blind", {direction:"down"}, 500);

	       }); */

}

});

document.bigsherif_router = new BigsherifRouter();



Backbone.history.start();
};
