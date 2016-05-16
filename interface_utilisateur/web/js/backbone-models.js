// Event model, CurrentEvent and EventLog models
var Event = Backbone.Model.extend({
	urlRoot: '/api/currentevents',
	idAttribute: "_id",
	sync: function(method, model, options) {
		return Backbone.sync(method, model, options);
	}
});


var RowData = Backbone.Model.extend({
	urlRoot: function() {
        return '/api/'+this.type
    },
	idAttribute: "_id",
	sync: function(method, model, options) {
		return Backbone.sync(method, model, options);
	},
    fetch: function (options) {
        options.cache = false;
        return Backbone.Collection.prototype.fetch.call(this, options);
    },
    initialize: function(props) {
        this.type = typeof props["type"] !== 'undefined' ? props["type"] : false;
	}
});

var dataGrid = Backbone.Collection.extend({
    model: RowData,
    fetch: function (options) {
        options.cache = false;
        return Backbone.Collection.prototype.fetch.call(this, options);
    },
	url: function () {
        var parameters = {
            "order": this.descending ? "desc": "asc",
            "limit": this.limit,
            "sorting": this.sorting,
            "from": this.scroll_state.from,
            "filters": JSON.stringify(this.filters)
        }
        var query = "/api/"+this.type+"?"+$.param(parameters);
        return query;
	},
	idAttribute: "id",
    parse: function(response) {
        var collection = this;
        var filtered_response = [];
        var underscore_fields = ["pool_domaine", "pool_perimetre"];
        var response_length = response.length;
        
	if(this.type != "connectorlist" && this.type != "criticalitylist"){
        for (var row_idx = 0; row_idx < response_length; row_idx++) {
            var row_object = {};
            _.each(this.column_names, function(column) {
                if (_.indexOf(underscore_fields, column["field"]) >= 0) {
                    var column_field = column["field"].split("_")[0];
                } else {
                    var column_field = column["field"];
                }
                row_object[column_field] = response[row_idx]["_source"][column_field];
            });
            collection.add(row_object);
            filtered_response.push(response[row_idx]["_source"]);
        }	
	}
	else{
	    // TODO XXX : Enlever buggybug pour eviter la boucle infinie
	    if (typeof buggybug === 'undefined')
	    {
	        for (var row_idx = 0; row_idx < response_length; row_idx++) {
        	    collection.add(response[row_idx]["doc"]);
	            filtered_response.push(response[row_idx]["doc"]);
		    buggybug=1;
		}
       	     }
	    else
		{
        	    collection.add(response[0]);
	            filtered_response.push(response[0]);
		    buggybug = undefined;
		}
	}
        
        /* peut ne plus etre necessaire, à tester sans */
        // if (this.scroll_state.top) {
            // this.each(function(model, model_id, collection_list) {
                // var remove = true;
                // if (typeof model == 'undefined') {
                    // return;
                // }
                // for (var i = 0; i < filtered_response.length; i++) {
                    // if (model.id == filtered_response[i]["_id"]){
                        // remove = false;
                    // }
                // }
                // if (remove)
                // {
                    // collection.remove(model);
                // }
            // });
        // }
        /* Fin de truc à tester */
    },
    search: function(filters, reset) {
        reset = typeof reset !== 'undefined' ? reset : false;
        if (reset == true) {
            this.filters = filters;
        } else {
            if (filters["timestamp_start_gt"] != undefined)
            {
              var d = new Date(filters["timestamp_start_gt"]);
              filters["timestamp_start_gt"] = d.getTime() / 1000;
            }
            if (filters["timestamp_start_lt"] != undefined)
            {
              var d = new Date(filters["timestamp_start_lt"]);
              filters["timestamp_start_lt"] = d.getTime() / 1000;
            }

	    if (filters[Object.keys(filters)] == "")
	    {
		delete this.filters[Object.keys(filters)];
	    }
	    else
	    {
		_.extend(this.filters, filters);
	    }
        }
        this.scrollTop();
    },
	scrollDown: function() {
		this.scroll_state.top = false;
        this.scroll_state.from = this.length;
		this.fresh();
	},
	scrollTop: function() {
	var f = function(){
		this.scroll_state.top = true;
	        this.scroll_state.from = 0;
        	this.reset();
	        this.trigger("clear");
		$("#loading-message").css("zIndex", 0);
	}
	$("#loading-message").css("zIndex", 10000);
	setTimeout(f.bind(this),1000);
	},
    triggerSort: function(new_sorting, order) {
		this.sorting = new_sorting;
        if (order == "desc") {
            this.descending = true;
        } else {
            this.descending = false;
        }
		this.scrollTop();
	},
    refresh : function() {
        this.fresh(true);
    },
	fresh : function(toReset) {
        toReset = typeof toReset !== 'undefined' ? toReset : false;
		this.fetch({
			success: function (collection, response, options){
                if (response.length != 0) {
                    if (collection.length < collection.limit){
                        collection.scrollDown();
                    } else {
                        collection.trigger("change");
                    }
                }
		},
		error: function (collection, response, options){
/* 			console.log("Did not manage to fetch the list " + collection.type);
			console.log(collection);
			console.log(response);
			console.log(options); */
		},
		reset: toReset,
        add: false,
        remove: false
		});

	},
    comparator: function(row) {
        if (this.descending == false) {
            return row.get(this.sorting);
        } else {
            var data = row.get(this.sorting);
            if (_.isString(data)) {
                data = data.toLowerCase();
                data = data.split("");
                data = _.map(data, function(letter) { 
                    return String.fromCharCode(-(letter.charCodeAt(0)));
                });
                return data;
            } else {
                return -data;
            }
        }
    },
	initialize: function(props) {
		this.props = props;
        this.type = props["type"];
        this.filters = typeof props["filters"] !== 'undefined' ? props["filters"] : {};
        this.descending = typeof props["descending"] !== 'undefined' ? props["descending"] : true;
        this.sorting= typeof props["sorting"] !== 'undefined' ? props["sorting"] : "_id";
		this.scroll_state = typeof props["scroll_state"] !== 'undefined' ? props["scroll_state"] : {
            top: true,
            from: 0
        };
        this.column_names = props["column_names"];
		this.limit = 20;
        if (typeof props["key"] !== 'undefined') {
            this.key = props["key"];
        }
	}
});

var CurrentEvents = dataGrid.extend({
    
});
