
var mapdata=[];

var matchName= function(name,poitype) {
    name=name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var re=new RegExp(name, 'i');
    return function(el) {
        if(poitype && poitype!=el[1])  return false;
        if(!name) return false;
        return re.test(el[0])
    }
}

var load = function(file) {
    var fs = require('fs');
    mapdata = JSON.parse(fs.readFileSync(file, 'utf8'));
}

var find = function(name, poitype) {
    return mapdata.filter(matchName(name, poitype));
}

// Return single match if any
var singleMatch = function(mapres,name,poitype) {
    // Single match
    if(mapres.length == 1)
	return mapres[0];
    // If exact match, return this
    var exactMatch=null;
    mapres.forEach(function(el) {
	if(name.toLowerCase()==el[0].trim().toLowerCase()) {
	    exactMatch=el;
	}
    });
    return exactMatch;
}

var listResults = function(mapres) {
    var res = [];
    mapres.forEach(function(el){
	res.push(""+el[1]+": "+el[0]);
    });
    return res.join("\n");
}


module.exports = {
    load: load,
    listResults: listResults,
    singleMatch:singleMatch,
    find: find
}
