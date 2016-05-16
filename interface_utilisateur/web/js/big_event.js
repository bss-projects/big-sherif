function showEvent(id) {
				$("#ohmevent").css("visibility", "hidden");
				$("#comment").css("visibility", "hidden");
				$("#ticket").css("visibility", "hidden");

				$('#' + id).css("visibility","visible");

}

function addTicket() {

}

function showHost(id) {
				$("#ohmhost").css("visibility", "hidden");
				$("#unmanage").css("visibility", "hidden");
				$("#history").css("visibility", "hidden");
				$("#metrology").css("visibility", "hidden");
				$("#alarms").css("visibility", "hidden");

				$('#' + id).css("visibility","visible");

}

function addUnmanage()
{
				start = $('#date').DatePickerGetDate('formated')[0].split('-');
				startts = new Date(start[1]+ "/"+ start[2]+ "/"+ start[0]).getTime();
				startts += document.forms["unmanage_host"]["start_time"].value.split(':')[0] * 3600000 + document.forms["unmanage_host"]["start_time"].value.split(':')[1] * 60000;
				end = $('#date').DatePickerGetDate('formated')[1].split('-');
				endts = new Date(end[1]+ "/"+ end[2]+ "/"+ end[0]).getTime();
				if (document.forms["unmanage_host"]["end_time"].value != "")
				{
								endts += document.forms["unmanage_host"]["end_time"].value.split(':')[0] * 3600000 + document.forms["unmanage_host"]["end_time"].value.split(':')[1] * 60000;
				}
				var monObj = {};
				//monObj['_id']= startts+endts;
				monObj['component']= document.forms["unmanage_host"]["component"].value;
				monObj['comment']= document.forms["unmanage_host"]["comment"].value;
				monObj['start_date']= startts/1000;
				monObj['end_date']= endts/1000;
				monObj['is_activated']=0;
				monObj['is_over']=0;
				var unmanaged = new RowData({ type: "unmanaged"});
				unmanaged.save(monObj);
				unmanagedList.scrollTop();
}


function delMap(id){
	var map = new RowData({ _id : id, type: "cartography"});
	map.destroy();

}
