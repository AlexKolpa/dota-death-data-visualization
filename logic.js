var width = 1000;
var height = 1000;
var defaultRadius = 9;
var border = 2;
var movingWindowSize = 10;
var margin = {top : 20, right : -40, bottom : 30, left : 0};

var svg = d3.select("body")
	.insert("svg", ":first-child")
	.attr("width", width)
	.attr("height", height);

svg.selectAll("image").data([0])
	.enter()
	.append("svg:image")
	.attr("width", width)
	.attr("height", height)
	.attr("xlink:href", "dota2_minimap.png");

svg.selectAll("rect").data([1])
	.enter()
	.append('rect')
	.attr('fill', 'black')
	.attr('opacity', 0.3)
	.attr('width', width)
	.attr('height', height);

var slider = d3.select('#timeInput');
slider.property('value', 0);

var tierBoxes = d3.selectAll('.tier');
tierBoxes.property('checked', true);
tierBoxes.on('change', updateCircles);
var activeTiers = [];

function updateCircles() {
	activeTiers = [];

	for (var i = 0; i < 4; i++) {
		if (tierBoxes[0][i].checked) {
			activeTiers.push(tierBoxes[0][i].value);
		}
	}

	updateRadius(+slider[0][0].value);
}

updateCircles();

slider.on('input', function () {
	updateRadius(+this.value);
});

function updateRadius(time) {
	d3.selectAll('circle')
		.attr('r', getRadius.bind(null, time));
}

function getRadius(time, item) {
	if (activeTiers.indexOf(item.tier) == -1) {
		return 0;
	}

	var diff = time - item.timestamp;
	var scaledU = Math.min(Math.max(diff / movingWindowSize, -1), 1);
	return getEpanechnikovKernel(scaledU);
}

function getEpanechnikovKernel(u) {
	return defaultRadius * 3 / 4 * (1 - u * u);
}

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
	});
}

function createCircles(data) {
	var x = d3.scale.linear().range([margin.left, width - margin.right])
		.domain(d3.extent(data, function (d) {
			return d.xPos
		})).nice();
	var y = d3.scale.linear().range([height - margin.top, margin.bottom])
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
		.style('stroke', 'white')
		.style('stroke-width', border)
		.style('fill', function (d) {
			switch (d.tier) {
				case 'normal':
					return 'cyan';
				case 'high':
					return 'green';
				case 'veryhigh':
					return 'orange';
				case 'pro':
					return 'red';
			}
		})
		.text(function(d) {
			return d.xPos + ", " + d.yPos;
		});
}

loadCircles('output.csv');
