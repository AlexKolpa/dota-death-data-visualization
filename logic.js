var deaths = {};
var width = 2*64;
var height = 2*68;


d3.csv("/deaths/648283764-VeryHigh.csv", function(error, data){
	deaths = data;
})

var death_scatterplot = d3.select("deathData")
	.append("svg")
	.attr("width", width)
	.attr("height", height);
