var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var w = 925,
	h = 550,
	margin = 30,
	startYear = 1,
	endYear = 200,
	startAge = Number(getUrlParameter('startY')),
	endAge = Number(getUrlParameter('endY')),
	y = d3.scale.linear().domain([endAge, startAge]).range([0 + margin, h - margin]),
	x = d3.scale.linear().domain([startYear, endYear]).range([0 + margin - 5, w]),
	years = d3.range(startYear, endYear);
	
var vis = d3.select("#vis")
			.append("svg:svg")
			.attr("width", w)
			.attr("height", h)
			.append("svg:g");
			
var line = d3.svg.line()
			.x(function(d, i) {
				return x(d.x);
			}).y(function(d) {
				return y(d.y);
			});

var startEnd = {},
	countryCodes = {};

/*window.file = 'data_mean_eccentricity_20151228_201432.csv';
window.file = 'data_mean_eccentricity_20151229_103525.csv';*/
window.file = getUrlParameter('file');
	
d3.text(window.file, 'text/csv', function(text) {
	var countries = d3.csv.parseRows(text);
	for (i = 1; i < countries.length; i++) {
		var values = countries[i].slice(4, countries[i.length - 1]);
		var currData = [];
		var started = false;
		for (j = 0; j < values.length; j++) {
			if (values[j] != '') {
				currData.push({
					x: years[j],
					y: values[j]
				});
				if (!started) {
					startEnd[countries[i][1]] = {
						'startYear': years[j],
						'startVal': values[j]
					};
					started = true;
				} else if (j == values.length - 1) {
					startEnd[countries[i][1]]['endYear'] = years[j];
					startEnd[countries[i][1]]['endVal'] = values[j];
				}
			}
		}
		
		var array = $.map(currData, function(value, index) {
		    return [value.y];
		});
		var array2nd = array.slice(array.length - array.length/2);
		
		vis.append("svg:path")
			.data([currData])
			.attr("class", "N"+countries[i][0])
			.attr("N", countries[i][0])
			.attr("mu", countries[i][1])
			.attr("n_ratio", countries[i][2])
			.attr("m2nd", math.mean(array2nd))
			.attr("std2nd", math.std(array2nd))
			.attr("interior", true)
			.attr("d", line)
			.on("mouseover", onmouseover)
			.on("mouseout", onmouseout);
	}
});
window.muRange = [0, 1.5];
window.n_ratioRange = [1, 2];

vis.append("svg:line")
	.attr("x1", x(1))
	.attr("y1", y(startAge))
	.attr("x2", x(200))
	.attr("y2", y(startAge))
	.attr("class", "axis");
	
vis.append("svg:line")
	.attr("x1", x(startYear))
	.attr("y1", y(startAge))
	.attr("x2", x(startYear))
	.attr("y2", y(endAge))
	.attr("class", "axis");
	
vis.selectAll(".xLabel")
	.data(x.ticks(5))
	.enter()
	.append("svg:text")
	.attr("class", "xLabel")
	.text(String)
	.attr("x", function(d) {
		return x(d)
	}).attr("y", h - 10)
	.attr("text-anchor", "middle");
	
vis.selectAll(".yLabel")
	.data(y.ticks(4))
	.enter()
	.append("svg:text")
	.attr("class", "yLabel ymove")
	.text(String)
	.attr("x", 0)
	.attr("y", function(d) {
		return y(d)
	}).attr("text-anchor", "right")
	.attr("dy", 3);
	
vis.selectAll(".xTicks")
	.data(x.ticks(5))
	.enter()
	.append("svg:line")
	.attr("class", "xTicks")
	.attr("x1", function(d) {
		return x(d);
	}).attr("y1", y(startAge))
	.attr("x2", function(d) {
		return x(d);
	}).attr("y2", y(startAge) + 7);
	
vis.selectAll(".yTicks")
	.data(y.ticks(4))
	.enter()
	.append("svg:line")
	.attr("class", "yTicks ymove")
	.attr("y1", function(d) {
		return y(d);
	}).attr("x1", x(-0.5))
	.attr("y2", function(d) {
		return y(d);
	}).attr("x2", x(1));
	

function onclick(d, i) {
	var currClass = d3.select(this).attr("class");
	if (d3.select(this).classed('selected')) {
		d3.select(this).attr("class", currClass.substring(0, currClass.length - 9));
	} else {
		d3.select(this).classed('selected', true);
	}
}

function onmouseover(d, i) {
	var currClass = d3.select(this).attr("class");
	d3.select(this).attr("class", currClass + " current");
	var blurb = "<div class='col'>N: " + $(this).attr("N") + "</div><div class='col'>&mu;: " + $(this).attr("mu") + "</div><div class='col'>n<sub>l</sub>/n<sub>r</sub>: " + $(this).attr("n_ratio") + "</div>";
	$("#default-blurb").hide();
	$("#blurb-content").html(blurb);
	
	/* Plot mean and std of second-half */
	var m2nd = Number($(this).attr("m2nd"));
	var std2nd = Number($(this).attr("std2nd"));
	if(normalised) {
		m2nd = (endAge-startAge)/2;
	}

	vis.append("svg:line")
	    .attr("class", "mean")
	    .attr("x1", x(1))
	    .attr("y1", y(m2nd))
	    .attr("x2", x(200))
	    .attr("y2", y(m2nd));
	vis.append("svg:line")
	    .attr("class", "std")
	    .attr("x1", x(1))
	    .attr("y1", y(m2nd+std2nd))
	    .attr("x2", x(200))
	    .attr("y2", y(m2nd+std2nd));
	vis.append("svg:line")
	    .attr("class", "std")
	    .attr("x1", x(1))
	    .attr("y1", y(m2nd-std2nd))
	    .attr("x2", x(200))
	    .attr("y2", y(m2nd-std2nd));
}

function onmouseout(d, i) {
	var currClass = d3.select(this).attr("class");
	var prevClass = currClass.substring(0, currClass.length - 8);
	d3.select(this).attr("class", prevClass);
	$("#default-blurb").show();
	$("#blurb-content").html('');
	vis.selectAll("line.mean").remove();
	vis.selectAll("line.std").remove();
}

function showRegion(regionCode) {
	var countries = d3.selectAll("path." + regionCode);
	if (countries.classed('highlight')) {
		countries.attr("class", regionCode);
	} else {
		countries.classed('highlight', true);
	}
}


function showRange() {
	$('path').each(function() {
		var path = $(this);
		var mu = Number($(this).attr("mu"));
		var n_ratio = Number($(this).attr("n_ratio"));
	    if(mu < window.muRange[0] || mu > window.muRange[1] || n_ratio < window.n_ratioRange[0] || n_ratio > window.n_ratioRange[1] ) {
			path.removeAttr('interior');
		} else {
			path.attr('interior', true);
		}
	});
}

window.normalised = false;
function normalise() {
	var countries = d3.selectAll("path");
	if(!normalised) {
		countries.each(function(d, i){
			var m2nd = Number(d3.select(this).attr("m2nd"));
			d3.select(this)
			 .attr("transform", null)
		 	 .transition()
			 .attr("transform", "translate(0," + (y((endAge-startAge)/2-m2nd+endAge)-30) + ")");
		});
		window.normalised = true;
		d3.selectAll(".ymove")
		 .attr("transform", null)
	 	 .transition()
		 .attr("transform", "translate(0," + (y((endAge-startAge)/2+endAge)-30) + ")");
	} else {
		countries.each(function(d, i){
			var m2nd = Number(d3.select(this).attr("m2nd"));
			d3.select(this)
			 .attr("transform", null)
		 	 .transition()
			 .attr("transform", "translate(0,0)");
		});
		window.normalised = false;
		d3.selectAll(".ymove")
		 .attr("transform", null)
	 	 .transition()
		 .attr("transform", "translate(0,0)");
}
}
