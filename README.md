## Description

> Pidgey has an extremely sharp sense of direction. It is capable of unerringly returning home to its nest, however far it may be removed from its familiar surroundings.

pidgey is a small map bot I wrote for our local Pokemon Go discord, to
help the users locate pokestops and gyms.

It will take a JSON file with pois (gyms, pokestops, portals) and make
this searchable through discord. It will *not* help you assemble this
file, it assumes you already have a list of pois which you want to
make searchable.


## Install and configuration

Checkout the git. 

Run npm install to install the dependencies.

Create a config.json, using config.example.json as a template.


| Parameter | Description |
| --- | --- | 
| token |  Discord bot token. See  https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token | 
| command | Map command | 
| google_api_key | Google static map api key https://developers.google.com/maps/documentation/maps-static/intro | 
| poifile | JSON file with pois. See data/poi.example.json for format. | 


## Screenshots

![Screenshot 1](screenshots/screenshot-1.png?raw=true)
![Screenshot 2](screenshots/screenshot-2.png?raw=true)


(Icon made by Roundicons Freebies  from www.flaticon.com) 

