/* globals d3 topojson */
(function() {
	'use strict';

	var width = 600,
		height = 500,
		svg = d3.select('#js-map'),
		tooltip = d3.select('#js-tooltip'),
		load,
		parseQueryString,
		params;

	svg.attr('width', width)
		.attr('height', height);

	load = function(type, id) {
		var filepath = 'https://raw.githubusercontent.com/' +
			'yaocl/page_taiwan/master/topojson/' +
			(type === 'towns' ? 'towns/towns-' + id :
				(type === 'villages' ? 'villages/villages-' + id :
					'counties')) + '.json';
		// console.log("filepath="+filepath);

		d3.json(filepath).then((data) => {
			// console.log("data=",data);
			var features = topojson.feature(data, data.objects.map).features,
				bbox = data.bbox,
				scale = Math.min(width / (bbox[2] - bbox[0]),
								 height / (bbox[3] - bbox[1])) * 50,
				center = [(bbox[2] + bbox[0]) / 2, (bbox[3] + bbox[1]) / 2],
				projection,
				path;

			// console.log("d3.json features=",features);
			// console.log("d3.json bbox=",bbox);
			// console.log("d3.json scale=",scale);

			projection = d3.geoMercator()
				.center(center)
				.scale(scale)
				.translate([width / 2, height / 2]);

			// console.log("projection=",projection);
			path = d3.geoPath().projection(projection);

			// console.log("path=",path);
			// console.log("geo-path=",svg.selectAll('.geo-path'));

			svg.selectAll('path')
				.data(features)
				.enter()
				.append('path')
				.attr('d', path)
				.on('click', function(e) {
					console.log("e=", e);
					// if (!d3.event) {
					// 	return;
					// }
					// d3.event.stopPropagation();

					d3.select(this).select(function(d){
						// console.log("d.properties=",d.properties);

						var id, t;
						id = d.properties.id;

						if (type === 'villages') {
							return;
						} else if (type === 'towns') {
							// t = 'villages';
							return;
						} else {
							t = 'towns';
						}

						location.search = unescape(encodeURI('type=' + t + '&id=' + id));
					})

				})
				.on('mouseover', function(e) {
					// console.log("d=", d);
					d3.select(this).select(function(d){
						var centroid = path.centroid(d);

						// console.log("d.properties=",d.properties);
						// console.log("centroid=",centroid);
						tooltip
							.classed('s-show', true)
							.style('left', centroid[0] + 'px')
							.style('top', (centroid[1] - 20) + 'px')
							.text(d.properties.name);

						var id = d.properties.id;
						var town = get_town_by_id(id);
						if( JSON.stringify(town) !== '{}' ) {
							document.getElementById("city").innerHTML = town.cityid+" "+ town.city;
							document.getElementById("town").innerHTML = town.id+" "+town.town;
							document.getElementById("note").innerHTML = town.note;
						} else {
							document.getElementById("city").innerHTML = "";
							document.getElementById("town").innerHTML = "";
							document.getElementById("note").innerHTML = "";
						}
					})

				})
				.on('mouseout', function() {
					tooltip.classed('s-show', false);
				});
		});
	};

	parseQueryString = function(queryString) {
		var queries = queryString.split('&'),
			result = {},
			tokens,
			length,
			i;

		for (i = 0, length = queries.length; i < length; i++) {
			tokens = queries[i].split('=');
			result[tokens[0]] = tokens[1];
		}

		return result;
	};

	params = parseQueryString(location.search.substr(1));
	console.log("load type="+params['type']+", id="+params['id']);
	load(params['type'], params['id']);
})();
