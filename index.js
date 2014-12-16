var fs = require('fs');
var parse = require('csv-parse');
var stringify = require('csv-stringify');
var streamify = require('stream-array');
var path = require('path');

var maxDeathDistance = 1000;

var parser = parse({delimiter: ',', relax: true});
var input = fs.createReadStream(process.argv[2]);
var playermap = {};

var playerDeaths = [];

parser.on('readable', function() {
	while(record = parser.read()) {
		var name = record[3], timestamp = record[5];

		if(!playermap[name]) {
			playermap[name] = { playername : name };
		}

		playermap[name][timestamp] = [record[0],record[1]];
	}
});

parser.on('error', function(err) {
	console.log(err.message);
});

parser.on('finish', function() {
	for(k in playermap) {
		if(playermap.hasOwnProperty(k)) {
			parseDeaths(playermap[k]);
		}
	}

	writeResult();
});

function writeResult() {
	var stringifier = stringify();
	var filename = path.basename(process.argv[2]);
	var output = fs.createWriteStream(__dirname + '/deaths/' + filename);
	streamify(playerDeaths).pipe(stringifier).pipe(output);
}


function parseDeaths(player) {
	var timestamps = getSortedTimestampsForPlayer(player);	
	var lastPos = player[timestamps[0]];
	playerDeaths.push(["playername", "timestamp", "xPos", "yPos"]);
	for(var i = 0; i < timestamps.length; i++) {
		var newPos = player[timestamps[i]];
		var distance = getDistanceSq(lastPos, newPos);
		if(distance > maxDeathDistance) {
			playerDeaths.push([player.playername, timestamps[i], lastPos[0], lastPos[1]]);
		}
		
		lastPos = newPos;
	}
}

function getDistanceSq(oldPos, newPos) {
	var dX = newPos[0] - oldPos[0];
	var dY = newPos[1] - oldPos[1];
	return dX*dX + dY*dY;
}

function getSortedTimestampsForPlayer(player) {
	var keys = [];
	for (k in player) {
    		if (player.hasOwnProperty(k)) {
			keys.push(k);
		}
	}

	keys.sort();

	return keys;
}

input.pipe(parser);
