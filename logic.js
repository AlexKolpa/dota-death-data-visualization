var deaths = {};
var width = 2*64;
var height = 2*68;


var death_scatterplot = d3.select("deathData")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

d3.csv("/deaths/648283764-VeryHigh.csv", function(error, data){

	console.log("Making ints out of the x & y positions");

	data.forEach(function(d){
		d.xPos = +d.xPos;
		d.yPos = +d.yPos;
	});

	console.log("Intifying completed");
	console.log("Scattering data");
	
	var x = d3.scale.linear().range([0, width])
		.domain(d3.extent(data, function(d){return d.xPos})).nice();
	var y = d3.scale.linear().range([0, height])
		.domain(d3.extent(data, function(d){return d.yPos})).nice();


	var circle = death_scatterplot.append("g")
		.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", function(d){ return x(d.xPos)})
		.attr("cy", function(d){ return y(d.yPos)})
		.attr("r", 6)
		.style('fill','steelblue')
		.style({'stroke': 'black', 'stroke-width': 2});


	// D3 is awesome, it already has SVG's that help you create axis
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.ticks(10);

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(10);

	// Append the x axis - we want to place it in the bottom of the graph
	death_scatterplot.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height) + ")")
		.call(xAxis);

	// Append the y axis
	death_scatterplot.append("g")
		.attr("class", "y axis")
		.call(yAxis);

	death_scatterplot.append("text")
		.attr("x", (width / 2))			 
		.attr("y", 0 )
		.attr("text-anchor", "middle")  
		.style("font-size", "16px") 
		.text("DEATH EVERYWHERE");

	deaths = data;
})
