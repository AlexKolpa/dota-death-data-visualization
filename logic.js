var width = 600;
var height = 600;
var defaultRadius = 6;
var movingWindowSize = 10;

var svg = d3.select("body")
	.insert("svg", ":first-child")
	.attr("width", width)
	.attr("height", height);

var slider = d3.select('#timeInput');
var tierBoxes = d3.selectAll('.tier');
tierBoxes.on('change',updateCircles);
var activeTiers = [];

function updateCircles() {
	activeTiers = [];
	
	for(var i = 0; i < 4; i++) {
		if(tierBoxes[0][i].checked) {
			activeTiers.push(tierBoxes[0][i].value);
		}
	}

	updateRadius(+slider[0][0].value);
}

slider.on('input', function() {
	updateRadius(+this.value);	
});

function updateRadius(time) {
	d3.selectAll('circle')
		.attr('r', getRadius.bind(null, time));
}

function getRadius(time, item) {
	if(activeTiers.indexOf(item.tier) == -1) {
		return 0;
	}

	var diff = time - item.timestamp;
	var scaledU = Math.min(Math.max(diff / movingWindowSize, -1), 1);
	return getEpanechnikovKernel(scaledU);
}

function getEpanechnikovKernel(u) {
	return defaultRadius * 3 / 4 * (1 - u * u);
}

var map_background = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

function loadCircles(file) {
	d3.csv(file, function (error, data) {

		if (error) {
			console.log('error while parsing file', error);
			return;
		}

		console.log('Making ints out of the x & y positions');

		var max = 0;
		data.forEach(function (d) {
			d.xPos = +d.xPos;
			d.yPos = +d.yPos;

			if (d.timestamp > max) {
				max = d.timestamp;
			}
		});

		slider.attr('max', max);

		createCircles(data);

		slider.property('value', 0);
	});
}

function createCircles(data) {
	var x = d3.scale.linear().range([0, width])
		.domain(d3.extent(data, function (d) {
			return d.xPos
		})).nice();
	var y = d3.scale.linear().range([0, height])
		.domain(d3.extent(data, function (d) {
			return d.yPos
		})).nice();

	svg.append('g')
		.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		.attr('cx', function (d) {
			return x(d.xPos)
		})
		.attr('cy', function (d) {
			return y(d.yPos)
		})
		.style('fill', function (d) {
			switch(d.tier) {
				case 'normal':
					return 'green';
				case 'high':
					return 'cyan';
				case 'veryhigh':
					return 'blue';
				case 'pro':
					return 'red';
			}
		});
}

loadCircles('output.csv');
