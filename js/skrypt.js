			var centered = null;
			var country = null;
			var continent = "Europe";

			var height = 500; // map svg
			var width = 800;  // map svg
			var zoom = 1.3;
			var zoomLvl = 1;
			var x_zoom;
			var y_zoom;

			var mouseMoved = false;
			var mousedown = false;
			var mouseX;
			var mouseY;
			var projection = d3.geo.mercator();
			var path = d3.geo.path().projection(projection);

			var mapChart = false;
			var pieChart = true;
			var barChart = true;

			function mapLinkClick(e){
				e.preventDefault();

				if($(e.target).attr('href') == 'all'){
					$('#wykresy').fadeOut(500);
						$('#map svg').animate({opacity: 0},500,function(){
							
							drawContinent();
							$('#msg').html(generateLink());
							zoomLvl = 1;
							$('.mapLink').click(mapLinkClick);
						});
				}else if($(e.target).attr('href') == 'country'){
					zoomLvl = 2;
					var states = d3.select('#gmap').selectAll("path").classed("active_loc", false);
					$('#msg').html(generateLink(continent,country.name));
					centered = null;
					getAjax("/continent/"+continent.replace(/\s+/g, '')+"/country/"+country.iso);
					$('.mapLink').click(mapLinkClick);

				}else if($(e.target).attr('href') == 'continent'){
					zoomLvl = 1;
					drawWorld(continent);
					
				}
			};	


			function getAjax(url){
				console.log(url);
				//TODO podmienic url i stworzyc zeby tam zintegrowac ze scalą
				$('#wykresy').fadeOut(200,function(){
					$.ajax({
						type: "GET",
						url: "js/data.json",
						success: function(data){
							$('#wykresy').html("");
							if(barChart){
								$('#wykresy').html("<div id='slup1' class='slupekDiv'></div>");
								slupki(data, '#slup1');
							}
							if(pieChart){
								$('#wykresy').html($('#wykresy').html() + '<div id="chart1" style="margin-top: 30px"><div id="leg"></div></div>'); 
								piechart(data, '#chart1')
							}
							$('#wykresy').fadeIn(400);
						}
					});


				});
				
			}

   			var color = d3.scale.category20();     //builtin range of colors

		    function slupki(data, el){

		    	var max_w = 490; //maxymalna szerokość             
		        var x_max = d3.max(data, function(d){return d.value});
		        var k = x_max / max_w; //podzielnik aby nie wychodzilo poza maxymalna szerokość

		        var vis = d3.select(el); //zaznaczamy dtrójką diva do ktorego dodajemy wykres
		             
		        var divs = vis.selectAll("div")     //tworzymy divy zbiorcze ile ich jest
		            .data(data)                          
		            .enter()
		            .append("div")
		            .attr("class", "slupekWraper");
		            
		        divs.append("div")                  //do zbiorczego diva najpierw słupek
		            .attr("style", function(d,i){ return "background: "+ color(i) +"; width: " + (d.value/k) + "px;"; })  
		            .attr("class", "slupek");

		        divs.append("div")                  //a potem labelke ;)
		            .attr("class", "labelka")
		            .attr("style", function(d,i){ return "width: " + (d.value/k) + "px;"; })  
		            .text(function(d){ return d.fieldLabel + " " + d.value; });
		    }

		                            //radius
		 
		    function piechart(data, el){
		    	var allValue = 0;
		    	$.each(data,function(i,el){
		    		allValue+= el.value;
		    	});

		    	var textcl = "";
			    var w = 300,                        //width
			    h = 300,                            //height
			    r = 150;  
		           var vis = d3.select(el) //dodajemy svg do diva o wysokosc iszerokosci i potem element g ktorego przesowamy na srodek
		            .append("svg:svg")              
		            .data([data])                   
		                .attr("width", w)           
		                .attr("height", h)
		                .append("svg:g")                
		                .attr("transform", "translate(" + (r) + "," + (r) + ")")    
		     
		        var arc = d3.svg.arc()     //tworzymy element d3 arc o promieniu r        
		            .outerRadius(r);
		     
		        var pie = d3.layout.pie()          //kazdy pie element d3 robi tak jak powinno byc adekwatnie do elementu value
		            .value(function(d) { return d.value; });   
		     
		        var arcs = vis.selectAll("g.slice")    //do głownego g dodajemy pod g'ki z naszymi kawalkami ciastka 
		            .data(pie)                          
		            .enter()                            
		                .append("svg:g")               
		                .attr("class", "slice");

		     
		            arcs.append("svg:path")             //do kazdego kawałka ciastka rysujemy dróżkę na biało i wypełniamy kolorem
		                    .attr("fill", function(d, i) { return color(i); } ) 
		                    .attr("stroke", "white")
		                    .attr("d", arc);
		            //Cyferki na pie charcie
		            arcs.append("svg:text")                                     //add a label to each slice
		                .attr("transform", function(d) {                    	//set the label's origin to the center of the arc
			                													//we have to make sure to set these before calling arc.centroid
			                d.innerRadius = 0;
			                d.outerRadius = r;
			                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
		           		 })
		            .attr("text-anchor", "middle")                          //center the text on it's origin
		            .text(function(d, i) { return Math.round((data[i].value*100)/allValue)+"%"; });  
		                                                        
		           
		        
		        jQuery.each(data, function(i, val) {
		            textcl +=  "<div><div class='legend' style='background: "+ color(i)  +"'></div><div class='legendLabel'>" + val.fieldLabel + "</div></div>";
		        });
		         $("#leg").html(textcl);
		    }

		    function generateLink(continent, country, region){
		    	var link = "<a href='all' class='mapLink'>All</a>";

		    	if(continent != undefined)
		    		link += "/<a href='continent' class='mapLink'>"+continent+"</a>";

		    	if(country != undefined)
		    		link += "/<a href='country' class='mapLink'>"+country+"</a>";

		    	if(region != undefined)
		    		link += "/<a href='region' class='mapLink'>"+region+"</a>";

		    	return link;
		    }

			function getScale(sqkm){
				if(sqkm >= 15000000) return 3;

				else if(sqkm >= 10000000) return 5;

				else if(sqkm >= 7500000) return 7;

				else if(sqkm >= 1250000) return 15;

				else if(sqkm >= 300000) return 26;

				else return 30;
			}

			function drawWorld(cont){
				$('#msg').html(generateLink(continent));
				getAjax("/continent/"+continent.replace(/\s+/g, ''));
				$('.mapLink').click(mapLinkClick);

				centered = null;
				$('#map svg').animate({opacity: 0},500,function(){
				$('#map').html("");
				$('#loading').show();
				
				var contLoad;
				switch(cont){
					case "Africa": contLoad = "AFRICA"; break;
					case "Asia": contLoad = "ASIA"; break;
					case "Australia and Oceania": contLoad = "AUSTRALIA_OCEANIA"; break;
					case "North America": contLoad = "NT_AMERICA"; break;
					case "South America": contLoad = "ST_AMERICA"; break;
					default: contLoad = "EUROPE"; break;
				}

					$.getJSON("js/search/continent.json").done(function(dt) {
						var data = dt[contLoad];
						zoom = data.zoom;
						x_zoom = data.x;
						y_zoom = data.y;

						var svg = d3.select('#map').append('svg')
							.attr('width', width)
							.attr('height', height)
							.attr('style','opacity: 0;');
						var states = svg.append('g')
							.attr('id', 'gmap');
						states.attr('transform', 'scale('+zoom+','+zoom+')translate(' + x_zoom + ',' + y_zoom + ')');
						
						d3.json('js/maps/COUNTRYV3.geojson', function(collection) {
							var toDraw = [];

							$.each(collection.features,function(i, el){
								$.each(data.continent,function(j, el2){
									if(el2.iso == el.properties.ISO_3DIGIT)
										toDraw.push(el);
								});
							});

							$('#loading').hide();
							states.selectAll('path')
								.data(toDraw)
							.enter().append('path')
								.attr('d', d3.geo.path().projection(projection))
								.attr('id', function(d){return d.properties.LONG_NAME.replace(/\s+/g, '')})
								.classed('none_active',true)
								.style("stroke-width", 1 / zoom + "px")
								.on('click', click);

								function click(d) {
									if(!mouseMoved){
									var x = -150,
									y = 0,
									k = zoom;
									
									if (d && centered !== d) {
										country = { name: d.properties.CNTRY_NAME, iso: d.properties.ISO_3DIGIT };
										
										var centroid = path.centroid(d);
										k = getScale(d.properties.SQKM);
										x = -centroid[0] + (width/2)/k;
										y = -centroid[1] + (height/2)/k;

										zoom = k;
										x_zoom = x;
										y_zoom = y;
										centered = d;
									} else {
										country = null;
										centered = null;
									}

									states.selectAll("path")
										.classed("active_loc", centered && function(d) { return d === centered; });
										
									states.transition()
										.duration(1000)
										.attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")")
										.style("stroke-width", 0.5 / k + "px");

									if(centered==null){
										$('#msg').html(generateLink());
									
									}else{
										zoomLvl = 2;
										drawCountry(centered.properties.ISO_3DIGIT);

									}

									$('.mapLink').click(mapLinkClick);
									
									}
								}

								$('#map svg').animate({opacity: 1},500);
						});

					
					});
				});
				
			}

			function drawContinent(){
					$('#map').html("");
					$('#loading').show();

					centered = null;
					zoom = 1.3;
					x_zoom = -170;
					y_zoom = 0;

					var svg = d3.select('#map').append('svg')
						.attr('width', width)
						.attr('height', height)
						.attr('style','opacity: 0;');
					
					var states = svg.append('g')
						.attr('id', 'gmap');
					states.attr('transform', 'scale('+zoom+','+zoom+')translate(' + x_zoom + ',' + y_zoom + ')');
						


					d3.json('js/maps/CONTINENT.geojson', function(collection) {
						$('#loading').hide();
						
						json = collection;
						states.selectAll('path')
							.data(collection.features)
						.enter().append('path')
							.attr('d', d3.geo.path().projection(projection))
							.attr('id', function(d){return d.properties.CONTINENT.replace(/\s+/g, '')})
							.classed('none_active',true)
							.on('click', click);

							function click(d) {
								if(!mouseMoved){
								var x = -150,
								y = 0,
								k = zoom;
								
								if (d && centered !== d) {
									continent = d.properties.CONTINENT;
									var centroid = path.centroid(d);
									k = getScale(d.properties.SQKM);
									x = -centroid[0] + (width/2)/k;
									y = -centroid[1] + (height/2)/k;

									zoom = k;
									x_zoom = x;
									y_zoom = y;
									centered = d;
								} else {
									continent = null;
									centered = null;
								}

								states.selectAll("path")
									.classed("active_loc", centered && function(d) { return d === centered; });
									
								states.transition()
									.duration(1000)
									.attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")")
									.style("stroke-width", 0.5 / k + "px");

								if(centered==null){
									$('#msg').html(generateLink());
								
								}else{
									drawWorld(continent);

								}

								$('.mapLink').click(mapLinkClick);
								
								}
							}

							$('#map svg').animate({opacity: 1},500);
					});
				

				
			}


			function drawCountry(ctry,reg){
				
				$('#msg').html(generateLink(continent,country.name, reg));
				getAjax("/continent/"+continent+"/country/"+country.iso);
				$('.mapLink').click(mapLinkClick);
				centered = null;

				$('#map svg').animate({opacity: 0},500,function(){
					$('#loading').show();
					$('#map').html("");
					var svg = d3.select('#map').append('svg')
					.attr('width', width)
					.attr('height', height)
					.attr('style','opacity: 0;');
					
					var states = svg.append('g')
						.attr('id', 'gmap');
					states.attr('transform', 'scale('+zoom+','+zoom+')translate('+x_zoom+','+y_zoom+')');
					

					d3.json('js/maps/'+ctry.replace(/\s+/g, '')+'.geojson', function(collection) {
						$('#loading').hide();
						
						json = collection;
						states.selectAll('path')
							.data(collection.features)
						.enter().append('path')
							.attr('d', d3.geo.path().projection(projection))
							.attr('id', function(d){return d.properties.NAME_1.replace(/\s+/g, '')})
							.classed('none_active',true)
							.classed("active_loc", function(d) {if(d.properties.NAME_1 == reg){centered = d; return true;} else {return false;} })
							.style("stroke-width", 1 / zoom + "px")
							.on('click', click);

						function click(d) {
							if(!mouseMoved){
								if (d && centered !== d) {
									getAjax("/continent/"+continent.replace(/\s+/g, '')+"/country/" + d.properties.ISO + "/region/" + d.properties.NAME_1.replace(/\s+/g, ''));
									$('#msg').html(generateLink(continent,d.properties.NAME_0,d.properties.NAME_1));
									centered = d;
								}else{
									centered = null;
									getAjax("/continent/"+continent.replace(/\s+/g, '')+"/country/" + d.properties.ISO);
									$('#msg').html(generateLink(continent,d.properties.NAME_0));
								}

								states.selectAll("path")
									.classed("active_loc", centered && function(d2) { return d2 === centered; });

								$('.mapLink').click(mapLinkClick);
							}
						}

						$('#map svg').animate({opacity: 1},500);
						});

				});
			}
			
			function translateMap(){
				var states = d3.select('#gmap')
					.transition()
					.duration(200)
					.ease("linear")
					.attr("transform", "scale(" + zoom + ")translate(" + x_zoom + "," + y_zoom + ")");
			}


			$(document).ready(function(){
				drawContinent();

				function zoomIn(){
					if(zoom < 30){
						if(zoomLvl == 1){
							zoom += 0.3;
							x_zoom -= 30 / zoom;
							y_zoom -= 20 / zoom;	
						}
						else{
							zoom += 1;
							x_zoom -= 18 / zoom;
							y_zoom -= 8 / zoom;		
						}					
						
						translateMap()
					}
				}
				function zoomOut(){
					if(zoom > 1){
						if(zoomLvl == 1){
							zoom -= 0.3;				
							x_zoom += 30 / zoom;
							y_zoom += 20 / zoom;	
						}
						else{
							zoom -= 1;
							x_zoom += 18 / zoom;
							y_zoom += 8 / zoom;	
						}
						
						translateMap()
					}
				}
		
				$('#in').click(function(){
					zoomIn();
				});

				$('#out').click(function(){
					zoomOut();
				});

				$('#map').mousedown(function(event){
					mouseMoved = false;
					mousedown = true;
					mouseX = event.pageX;
					mouseY = event.pageY;

				});
				$(document).mouseup(function(){
					mousedown = false;
				});
				$(document).mousemove(function(event){
					if(mousedown){
						var mouseDeltaX = (mouseX - event.pageX);
						var mouseDeltaY = (mouseY - event.pageY);

						if(Math.abs(mouseDeltaY) >= 1.5 || Math.abs(mouseDeltaX) >= 1.5)
							mouseMoved = true;

						x_zoom-= mouseDeltaX/zoom;
						y_zoom-= mouseDeltaY/zoom;
						mouseX = event.pageX;
						mouseY = event.pageY;

						var states = d3.select('#gmap')
						.attr("transform", "scale(" + zoom + ")translate(" + x_zoom + "," + y_zoom + ")");
					}
				});

				$('.mapLink').click(mapLinkClick);

				$('#map').mousewheel(function(event) {
					event.preventDefault();
					
    				if(event.deltaY == 1)
    					zoomIn();
    				else
    					zoomOut();
				});

				////SEARCH------------------------------------
				$('#searchForm').submit(function(e){
					e.preventDefault();

					$('#searchMsg').fadeOut('fast')
					var value = $('#stext').val().toLowerCase();
					if(value== "") return;

					switch(value){
						case "europe": continent = "Europe"; drawWorld("Europe");
							break;
						case "asia": continent = "Asia"; drawWorld("Asia");
							break;
						case "africa": continent = "Africa"; drawWorld("Africa");
							break;
						//case "australia":
						case "australia and oceania":
						case "oceania": continent = "Australia and Oceania"; drawWorld("Australia and Oceania");
							break;
						case "north america":
						case "america": continent = "North America"; drawWorld("North America");
							break;
						case "south america":
						case "america": continent = "South America"; drawWorld("South America");
							break;
						default:
						
							$.getJSON("js/search/continent.json").done(function(dt) {
								$.getJSON("js/maps/COUNTRYV3.geojson").done(function(wrld) {
									$.getJSON("js/search/search.json").done(function(data) {
										var found = false;
										var obj;
										$.each(data.region,function(i, el){
											if(value == el.name.toLowerCase()){
												continent = setContinent(dt,el.iso.replace(/\s+/g, ''));
												country = { name: findCountry(wrld.features,el.iso.replace(/\s+/g, '')), iso: el.iso.replace(/\s+/g, '') };
												console.log(country);
												drawCountry(el.iso.replace(/\s+/g, ''), el.name);
												zoomLvl = 2;
												found = true;
											}
										});

										if(!found)
											$.each(wrld.features,function(i, el){
												var iso = "";
												if(el.properties.ISO_3DIGIT) iso = el.properties.ISO_3DIGIT.toLowerCase();

												if(value == el.properties.CNTRY_NAME.toLowerCase() || iso == value){
													country = { name:el.properties.CNTRY_NAME, iso: el.properties.ISO_3DIGIT };
													continent = setContinent(dt,el.properties.ISO_3DIGIT);
													var centroid = path.centroid(el);
													zoom = getScale(el.properties.SQKM);
													x_zoom = -centroid[0] + (width/2)/zoom;
													y_zoom = -centroid[1] + (height/2)/zoom;
													zoomLvl = 2;
													drawCountry(el.properties.ISO_3DIGIT);
													found = true;
												}
											});

										if(!found)
											$('#searchMsg').stop().css('opacity','0').css('display','inline-block').animate({'opacity': 1});
									});
								});
							});
							// 
							break;
					}
					

				});

				function findCountry(data,iso){
					var rtn = "";
					$.each(data,function(i, el){
						if(iso == el.properties.ISO_3DIGIT){
							var centroid = path.centroid(el);
							zoom = getScale(el.properties.SQKM);
							x_zoom = -centroid[0] + (width/2)/zoom;
							y_zoom = -centroid[1] + (height/2)/zoom;
							
							rtn =  el.properties.CNTRY_NAME;
						}
					});

					return rtn;

				}
				function setContinent(data, iso){
					var rtn = false;
					$.each(data.EUROPE.continent,function(i, el){
						if(el.iso == iso){
							rtn = "Europe";
						}
					});
					if(!rtn)
						$.each(data.NT_AMERICA.continent,function(i, el){
							if(el.iso == iso){
								rtn = "North America";
							}
						});

					if(!rtn)
						$.each(data.ST_AMERICA.continent,function(i, el){
							if(el.iso == iso){
								rtn = "South America";
							}
						});
					if(!rtn)
						$.each(data.ASIA.continent,function(i, el){
							if(el.iso == iso){
								rtn = "Asia";
							}
						});
					if(!rtn)
						$.each(data.AFRICA.continent,function(i, el){
							if(el.iso == iso){
								rtn = "Africa";
							}
						});
					if(!rtn)
						$.each(data.AUSTRALIA_OCEANIA.continent,function(i, el){
							if(el.iso == iso){
								rtn = "Australia and Oceania";
							}
						});
				
					return rtn;
				}
				var stay = false;
				var t;
				var hoverUp = function(){
					clearTimeout(t);
					
				
					$('#menu').show().stop().animate({width: 330, height: 150},400,function(){ $('#menuContent').show();});
					
				};
				var hoverDown = function(){
					t = setTimeout(function(){
						 	$('#menuContent').hide();
						 	$('#menu').stop().animate({width: 0, height: 0},400,function(){$('#menu').hide();});
					 	},100);
					
				};
				//MENU----------------------------------------------
				$('#menuBtn').hover(hoverUp,hoverDown);
				$('#menu').hover(hoverUp,hoverDown);

				$('.checkbox').click(function(e){
					switch($(this).attr('name')){
						case "map":  mapChart = $(this).is(':checked');
							break;
						case "bar":  barChart = $(this).is(':checked');
							break;
						case "pie":  pieChart = $(this).is(':checked');
							break;
					}
					getAjax("test");
					
				});
				
			});