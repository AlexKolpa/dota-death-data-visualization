var width = 600;
var height = 600;


var death_scatterplot = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.csv("/deaths/648283764-VeryHigh.csv", function (error, data) {

    console.log("Making ints out of the x & y positions");

    data.forEach(function (d) {
        d.xPos = +d.xPos;
        d.yPos = +d.yPos;
    });

    console.log("Intifying completed");
    console.log("Scattering data");

    var x = d3.scale.linear().range([0, width])
        .domain(d3.extent(data, function (d) {
            return d.xPos
        })).nice();
    var y = d3.scale.linear().range([0, height])
        .domain(d3.extent(data, function (d) {
            return d.yPos
        })).nice();


    var circle = death_scatterplot.append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return x(d.xPos)
        })
        .attr("cy", function (d) {
            return y(d.yPos)
        })
        .attr("r", 6)
        .style('fill', 'steelblue')
        .style({'stroke': 'black', 'stroke-width': 2});
})
