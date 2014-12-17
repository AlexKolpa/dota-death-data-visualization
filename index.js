var fs = require('fs');
var parse = require('csv-parse');
var stringify = require('csv-stringify');
var streamify = require('stream-array');
var path = require('path');
var minTimeSteps = 10;

var parser = parse({delimiter: ',', relax: true});
var matchPath = process.argv[2];
var tier = matchPath.substring(matchPath.lastIndexOf('-') + 1, matchPath.lastIndexOf('.csv')).toLowerCase();
var input = fs.createReadStream(process.argv[2]);
var playermap = {};

var playerDeaths = [];

parser.on('readable', function() {
	while(record = parser.read()) {
		var name = record[3], timestamp = record[5];

		if(!playermap[name]) {
			playermap[name] = {};
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
			parseDeaths(playermap[k], k);
		}
	}

	writeResult();
});

function writeResult() {
	var outputPath = __dirname + '/output.csv';
	if(!fs.existsSync(outputPath)) {
		playerDeaths.splice(0, 0, ['playername', 'timestamp', 'xPos', 'yPos', 'tier']);
	}

	var output = fs.createWriteStream(outputPath, {'flags': 'a'});
	var stringifier = stringify();
	streamify(playerDeaths).pipe(stringifier).pipe(output);
}


function parseDeaths(player, name) {
	var timestamps = getSortedTimestampsForPlayer(player);
	var staticCounter = 0;
	var lastPos = player[timestamps[0]];
	for(var i = 0; i < timestamps.length; i++) {
		var newPos = player[timestamps[i]];
		var distance = getDistanceSq(lastPos, newPos);
		if(distance < 1) {
			staticCounter++;
		}

		if(staticCounter > minTimeSteps) {
			playerDeaths.push([name, timestamps[i], lastPos[0], lastPos[1], tier]);
			staticCounter = 0;
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
