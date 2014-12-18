var width = 600;
var height = 600;
var defaultRadius = 6;
var movingWindowSize = 10;

var svg = d3.select('body')
	.insert('svg', ':first-child')
	.attr('width', width)
	.attr('height', height);

var deathVolumeChart = dc.barChart('#dota-death-volume');

var tierBoxes = d3.selectAll('.tier');

var x = null, y = null; 

d3.csv('output.csv', function (error, data) {

	if(error) {
		console.log('error while parsing file', error);
		return;
	}

	console.log('Making ints out of the x & y positions');

	var max = 0;
	data.forEach(function (d) {
		d.xPos = +d.xPos;
		d.yPos = +d.yPos;
		d.timestamp = +d.timestamp;

		if(d.timestamp > max) {
			max = d.timestamp;
		}
	});

	x = d3.scale.linear().range([0, width])
		.domain(d3.extent(data, function (d) {
		return d.xPos
		})).nice();
	y = d3.scale.linear().range([0, height])
		.domain(d3.extent(data, function (d) {
		    return d.yPos
		})).nice();

	var ndx = crossfilter(data);

	var timeDimension = ndx.dimension(function (d) {
		return d.timestamp;
	});

	var timeDimensionGroup = timeDimension.group();

	var tierDimension = ndx.dimension(function (d) {
		return d.tier;
	});
	
	var updateDeaths = function(chart, filter) {
		createCircles(timeDimension.top(Infinity));
	}

	deathVolumeChart
		.width(width)
		.height(80)
		.dimension(timeDimension)
		.group(timeDimensionGroup)
		.centerBar(true)
		.x(d3.scale.linear().domain([0, max]))
		.gap(1)
		.on('filtered', updateDeaths);

	//createCircles(data);
	
	dc.renderAll();
});

function createCircles(data) {
	svg.selectAll('*').remove();
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
		.attr('r', defaultRadius)
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

