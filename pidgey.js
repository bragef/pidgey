#!/bin/env node

const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const process = require("process");
const fs=require('fs');


const poifinder = require("./poifind.js");
poifinder.load(config.poifile);

// Log start/stop and create a pid file
if(config.pidfile) {
    fs.writeFileSync(config.pidfile, process.pid);
    fs.appendFileSync(config.logdir + "/run.log",(new Date()).toISOString() + " start ("+ process.pid  +")\n")
    let cleanup=function() {
	fs.unlink(config.pidfile, err => { console.log("no pidfile"); }  );
	fs.appendFileSync(config.logdir + "/run.log",(new Date()).toISOString() + " stop ("+ process.pid  + ")\n" );
	// process.exit(2);
    }
    process.on("exit", cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
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

	let maxHits = message.guild === null ? 250 : 10;

	// If no arguments, or single argument pokestop|gym, show help text
	if(!args[0]) 
	    showHelp = true;
	if(!showHelp && ['pokestop','gym','portal'].includes(args[0].toLowerCase())) {
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
	    embed.setTitle('Finn gymmer og pokestop i Bergen')
		.setDescription('!kart [gym|pokestop] søkestreng');
	    clientMessage = {embed};
	    
	} else if(matches.length == 0) {
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
	    clientMessage = "Velg med !kart _nr_ \n";
	    clientMessage += poifinder.listResults(matches);
	} else { 
	    clientMessage = 'For mange treff (' + matches.length  + '). Send direktemelding for å vise alle.';
	}
	
		
	message.channel.send(clientMessage)
	    .then(function(msg) {
		if(config.logdir!=null) {
		    fs.appendFile(config.logdir+"/searches.log",
				  "" + (new Date()).toISOString() 
				  + " " + message.channel.name +": ["+ matches.length + "] " + message + "\n"
				  ,
				  function(err) {}
				 );
		}
	    }).catch(function(error) {
		fs.appendFile(config.logdir + "/error.log",""+ (new Date()).toISOString() + "[ERROR]\n");
	    });
    }

});

client.on("ready", () => {
  client.user.setActivity(config.prefix + config.command);
});

client.on('error', function(error) {
    fs.appendFile(config.logdir + "/error.log", error);
});
client.login(config.token);
           

