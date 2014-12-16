var width = 600;
var height = 600;
var defaultRadius = 6;
var movingWindowSize = 10;

var svg = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

var slider = d3.select('#timeInput');

function loadCircles(file) {
	d3.csv(file, function (error, data) {

		if(error) {
			console.log('error while parsing file', error);
			return;
		}

		console.log('Making ints out of the x & y positions');

		var max = 0;
		data.forEach(function (d) {
			d.xPos = +d.xPos;
			d.yPos = +d.yPos;

			if(d.timestamp > max) {
				max = d.timestamp;
			}
		});

		slider.attr('max', max);

		createCircles(data);
		
		slider.attr('value', "0");
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
		.style('fill', 'steelblue')
		.style({'stroke': 'black', 'stroke-width': 2});
}

slider.on('input', function() {
	onSliderChange(+this.value);	
});

function onSliderChange(time) {
	d3.selectAll('circle')
		.attr('r', getRadius.bind(null, time));
}

function getRadius(time, item) {
	var diff = time - item.timestamp;
	var scaledU = Math.min(Math.max(diff / movingWindowSize, -1), 1);
	return getEpanechnikovKernel(scaledU);
}

function getEpanechnikovKernel(u) {
	return defaultRadius * 3 / 4 * (1 - u * u);
}

loadCircles('/deaths/tier-pro.csv');
