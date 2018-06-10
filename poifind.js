
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

var getByNumber=function(idx) {
    return mapdata.filter(num => num[4]==idx);
}

var load = function(file) {
    var fs = require('fs');
    mapdata = JSON.parse(fs.readFileSync(file, 'utf8'));

    // Add a unique number to all fields which is not in the search set
    var n, avoid={}
    mapdata.forEach(el =>  {
	if (n=el[0].match(/\d+/g)) {
	    n.forEach(num => {
		avoid[num]=true;
	    })
	}
    });
    var j, i=100;
    for(j=1;j<mapdata.length;j++) {
	i++;
	while(avoid[i] != undefined) i++;
	mapdata[j][4]=i;
    }
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
    var exactMatches=[]
    mapres.forEach(el =>  {
	if(name.toLowerCase()==el[0].trim().toLowerCase()) {
	    exactMatches.push(el);
	}
    });
    if(exactMatches.length == 1) 
	return exactMatches[0];
}

var listResults = function(mapres) {
    var res = [];
    mapres.forEach(el => {
	res.push("" + el[1]+": "+el[0] + " _"+el[4]+"_")
    });
    return res.join("\n");
}


module.exports = {
    load: load,
    listResults: listResults,
    singleMatch:singleMatch,
    getByNumber:getByNumber,
    find: find
}
