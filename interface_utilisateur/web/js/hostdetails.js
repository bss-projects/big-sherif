function showOhmHost() {
	// affichage du ohm
	$("#botcont").load("host.html", function (){


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


		$( ".modalqrs" ).click(function() {
			
			$("#qrsdlg").html('<a href="' + $(this).attr("title") + '" target="_blank">' +$(this).attr("title")+'</a>');
			$( "#qrsdlg" ).dialog( "open" );
			});

});
}


function showOhmEvent() {
	// affichage du ohm
	$("#botcont").load("event.html", function (){


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


		$( ".modalqrs" ).click(function() {
			
			$("#qrsdlg").html('<a href="' + $(this).attr("title") + '" target="_blank">' +$(this).attr("title")+'</a>');
			$( "#qrsdlg" ).dialog( "open" );
			});

});
}


function showHistory() {
	// affichage de l'history
	$("#botcont").load("history.html");
}
function showMetrologie() {
	// affichage de la metrologie
	$("#botcont").load("metrologie.html");
}
function showUnmanage() {
	// affichage de la fonction unamanage
	$("#botcont").load("unmanage.html", function(){
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
			});

///$("#start_time").mask("99:99");
//$("#end_time").mask("99:99");
}


$(function() {
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

if ( host == 1 )
{
		showOhmHost();
}
if ( event == 1) 
{
 	showOhmEvent();
}
		});



function addsystem() {
	var truc = $("#systems").html();
	var troc = truc.replace(' <i', ', '+document.forms["addasystem"]["fname"].value +' <i');
	$("#systems").html(troc);
	$( "#addsystemdlg" ).dialog( "close" );
	$( "#addsystembtn" ).click(function() {
			$( "#addsystemdlg" ).dialog( "open" );
			});

	return false;
}
