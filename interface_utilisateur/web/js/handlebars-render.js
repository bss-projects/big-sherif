function render(tmpl_name, tmpl_data) {
    if ( !render.tmpl_cache ) { 
        render.tmpl_cache = {};
    }

    if ( ! render.tmpl_cache[tmpl_name] ) {
        var tmpl_dir = './static/templates';
        var tmpl_url = tmpl_dir + '/' + tmpl_name + '.html';

        var tmpl_string;
        $.ajax({
            url: tmpl_url,
            method: 'GET',
            async: false,
            success: function(data) {
                tmpl_string = data;
            }
        });
        render.tmpl_cache[tmpl_name] = Handlebars.compile(tmpl_string);
    }

    return render.tmpl_cache[tmpl_name](tmpl_data);
}

Handlebars.registerHelper('if', function(conditional, options) {
  if(conditional) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('formatTimestamp', function(timestamp) {
    var now = new Date(parseInt(timestamp));
    return new Handlebars.SafeString("le "+[now.getDate(), now.getMonth() + 1, now.getFullYear()].join("/")+' &agrave; '+[now.getHours(), now.getMinutes()].join("h"));
});

Handlebars.registerHelper('fonctionnelHelper', function(poolList) {
    var results = [];
    if (poolList && poolList.length)
    {
        for (idx in poolList) {
            if (poolList[idx]["pool_type_name"].localeCompare("Fonctionnel") == 0) {
                results.push(poolList[idx]["pool_name"]);
            }
        }
    }
    if (results.length) {
        return results;
    } else {
        return "Aucun";
    }
});

Handlebars.registerHelper('serviceHelper', function(poolList) {
    var results = [];
    if (poolList && poolList.length)
    {
        for (idx in poolList) {
            if (poolList[idx]["pool_type_name"].localeCompare("Service") == 0) {
                results.push(poolList[idx]["pool_name"]);
            }
        }
    }
    if (results.length) {
        return results;
    } else {
        return "Aucun";
    }
});

Handlebars.registerHelper('perimetreHelper', function(poolList) {
    if (poolList && poolList.length)
    {
        for (idx in poolList) {;
            if (poolList[idx]["pool_type_name"].localeCompare("P\u00e9rim\u00e8tre") == 0) {
                return poolList[idx]["pool_name"]
            }
        }
    }
    return "Aucun";
});

Handlebars.registerHelper('domaineHelper', function(poolList) {
    if (poolList && poolList.length)
    {
        for (idx in poolList) {
            if (poolList[idx]["pool_type_name"].localeCompare("Domaine") == 0) {
                return poolList[idx]["pool_name"]
            }
        }
    }
    return "Aucun";
});