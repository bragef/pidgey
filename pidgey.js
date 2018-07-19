#!/bin/env node

const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const strings = require("./strings.json");
const process = require("process");
const fs=require('fs');

const poifinder = require("./poifind.js");
poifinder.load(config.poifile);

function writeLog(logfile, message) {
    if(config.logdir == null)  return;
    if(!fs.existsSync(config.logdir)) fs.mkdirSync(dir);
    fs.appendFile(config.logdir  + "/" + logfile, 
		  (new Date()).toISOString() + "\t" + message + "\n",
		  function(err) {});
}

client.on("message", async message => {

    // Ignore all bots.
    if(message.author.bot) return;
    
    // Ignore messages not starting with ! 
    if(message.content.indexOf(config.prefix) !== 0) return;
    
    // Get command and argument if given. 
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command===config.command) {
	
	let scope = "";
	let clientMessage;
	let matches = null, query, showHelp;
	
	// Shop up to 10 hits in chats, 250 hits in dm's
	let maxHits = message.guild === null ? 250 : 10;

	// If no arguments, or single argument pokestop|gym, show help text
	if(!args[0]) 
	    showHelp = true;
	if(!showHelp && poifinder.isPoiType(args[0].toLowerCase())) {
	    scope = args.shift().toLowerCase();
	}
	if(!args[0])
	    showHelp = true;

	if(!showHelp) {
	    // If numeric query, return poi by number (numbers which
	    // are part of pois are excluded).
	    query = args.join(" ");
	    if( /^[0-9]+$/.test(query)) {
		matches = poifinder.getByNumber(query);
	    }
	    if(!matches || !matches.length) 
		matches = poifinder.find(query, scope);

	}

	if(showHelp) {
	    const embed = new Discord.RichEmbed();
	    embed.setTitle(config.description)
		.setDescription(config.prefix + config.command + strings[config.language]["searchstring"]);
	    clientMessage = {embed};
	    
	} else if(!matches || matches.length == 0) {
	    clientMessage = 'Ingen treff på ' +  query;
	} else if(singleMatch = poifinder.singleMatch(matches, query, scope)) {
	    clientMessage = 'Eksakt treff';
	    let coord=singleMatch[2]+","+singleMatch[3];
	    let mapurl = 'https://maps.googleapis.com/maps/api/staticmap?size=512x512&zoom=15&scale=2&key=' + config.google_api_key;
	    mapurl=mapurl + '&center='+coord;
	    if(singleMatch['1']=='gym') 
		mapurl=mapurl+"&markers=color:green%7Clabel:G%7C"+coord;
	    else if(singleMatch['1']=='portal')
		mapurl=mapurl+"&markers=color:blue%7Clabel:P%7C"+coord;
	    else 
		mapurl=mapurl+"&markers=color:red%7Clabel:S%7C"+coord;
	    
	    const embed = new Discord.RichEmbed();
	    embed
		.setTitle(singleMatch[0]+" (" + singleMatch[1] + ")")
		.setImage(mapurl)
		.setDescription("[OpenStreetMap→](http://www.openstreetmap.org/?mlat="+ singleMatch[2] +"&mlon=" +singleMatch[3] +"&zoom=15&layers=M)");
	    
	    clientMessage = {embed};
	    
	} else if(matches.length <= maxHits) {
	    clientMessage = strings[config.language]["selectmap"];
	    clientMessage += "\n";
	    clientMessage += poifinder.listResults(matches);
	} else { 
	    clientMessage = strings[config.language]["toomany"] + ' (' + matches.length  + '). ';
            clientMessage += strings[config.language]["showall"]; 
	}
	
		
	message.channel.send(clientMessage)
	    .then(function(msg) {
		writeLog("searches.log",  " " + message.channel.name +": ["+ matches.length + "] " + message);
	    }).catch(function(error) {
		writeLog("error.log", "ERROR:  " + message.channel.name +":" + message);
	    });
    }
});

client.on("ready", () => {
  client.user.setActivity(config.prefix + config.command);
});

client.on('error', function(error) {
    writeLog("error.log", error);
});

client.login(config.token);
           
