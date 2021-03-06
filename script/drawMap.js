var filteredItem
var loadedMapData
var selectedYear = 1992;

var mapSvg = d3.select('#map')
              .append('svg');
var projection = d3.geoEquirectangular();

$(document).ready(function() {
  loadMapData();
  loadRadarData(1992);
  loadLineBarData(1992);
  setupMap();

  $('#selectedYearForRadar').text(YEAR);

  // $("#mapdropdown").change( function () {
  //               selectedYear = $(this).val();
  //               console.log(selectedYear);
  //               findDataItem(loadedMapData, selectedYear)
  //               visulizeCountryDots(filteredItem);
  //
  //               loadRadarData(parseInt(selectedYear));
  //               drawYearLine(parseInt(selectedYear));
  //
  //               YEAR = selectedYear;
  //
  //               $('#selectedYearForRadar').text(YEAR);
  //
  // });


  //slider

  var yearsWithData = [1992, 2000, 2008, 2016, 2017, 2018];


  var mapYearSlider = d3.sliderHorizontal()
                        .min(d3.min(yearsWithData))
                        .max(d3.max(yearsWithData))
                        .width(450)
                        // .tickFormat(d3.format('.2%'))
                        .marks(yearsWithData)
                        // .ticks(5)
                        // .default(1992)
                        .on('onchange', val => {
                            d3.select("p#mapYeatValue").text(val);

                            selectedYear = val;
                            // console.log(selectedYear);
                            findDataItem(loadedMapData, selectedYear)
                            visulizeCountryDots(filteredItem);

                            loadRadarData(parseInt(selectedYear));
                            drawYearLine(parseInt(selectedYear));

                            YEAR = selectedYear;

                            $('#selectedYearForRadar').text(YEAR);
                        });

  // var handle = mapYearSlider.insert("circle", ".track-overlay")
  //     // .attr("class", "handle")
  //     .attr("r", 9);


  var mapYearSliderGroup = d3.select("div#mapYearSlider").append("svg")
                                .attr("width", 500)
                                .attr("height", 60)
                                .append("g")
                                .attr("transform", "translate(30,30)");

  console.log(mapYearSliderGroup)


  mapYearSliderGroup.call(mapYearSlider);

  d3.select('.parameter-value')
    .append('circle')
    .attr('r', 8)
    .style('opacity', 0.95)
    .style('fill', '#FEC061');

  d3.select("p#mapYeatValue").text(mapYearSlider.value())


})



function setupMap(){
  var w = $(window).width();
  var h = $(window).height()*2/3;


  var path = d3.geoPath()
    .projection(projection);

  mapSvg.attr('width', w)
      .attr('height', h)



  mapSvg.append('rect')
    .attr('width', w)
    .attr('height', h)
    .attr('fill', 'white');

  var mapG = mapSvg.append('g')
                    .attr('id', 'mapG');



  d3.json('https://d3js.org/world-50m.v1.json', function(error, data) {
    if (error) console.error(error);
    mapG.append('path')
        .datum(topojson.feature(data, data.objects.countries))
        .attr('d', path)


    // zoom effect
    // var zoom = d3.zoom()
    //   .on("zoom", function() {
    //     g.attr("transform", d3.event.transform);
    //     g.selectAll("path")
    //       .attr("d", path.projection(projection));
    //   });
    // mapSvg.call(zoom);
  });
}




function visulizeCountryDots(mydata){
      var locations = mydata

      var hue = 0;

      var g = mapSvg.append("g")
                    .attr("id", "countryDots");

      // console.log( locations)

      locations.map(function(d) {
        hue += 0.36
        d.color = "#FFB533"
        // d.color = "#E7540D"
        // d.color = 'hsl(' + hue + ', 100%, 50%)';
      });

      g.selectAll('circle')

        .data(locations)
        .enter()
        .append('circle') //show the circles
        .attr('cx', function(d) {
          // console.log(projection([d.Latitude,d.Longtitude]))
          if ( projection([d.Longtitude, d.Latitude])) {
             // console.log([d.Latitude, d.Longtitude])
            return projection([d.Longtitude, d.Latitude])[0];
          }
        })
        .attr('cy', function(d) {
          if (projection([d.Longtitude, d.Latitude])) {

            return projection([d.Longtitude, d.Latitude])[1];
          }
        })
         .attr('r',
          function(d) {
          if (d["Global Hunger Index"]) {
            return Math.pow(parseInt(d["Global Hunger Index"]), 1 /1.5);
          }
        }
        )
        // .attr('r', d["Duration (Seconds)"]/10)
        .style('fill', function(d) {
          return d.color;
        })
         .style('opacity', 0.6)



      //mouseover

        .on('mouseover', function(d) {

          // console.log(d3.select(this).node().cx.baseVal.value)
          // console.log(d["Global Hunger Index"])

          d3.select(this)
            .transition()
            .duration(200)
            .style('fill', 'red');
          d3.select('#country').text(d.Entity);
          d3.select('#ghi').text(d["Global Hunger Index"]);

          d3.select('#mapTooltip')
            .style('left', () => {
              if(d3.event.pageX <= $(window).width() * 9/10){
                return (d3.select(this).node().cx.baseVal.value + 35) + 'px';
              } else{

                return (d3.select(this).node().cx.baseVal.value - 60) + 'px'
              }
            })
            .style('top', (d3.select(this).node().cy.baseVal.value + 140) + 'px')
            .transition()
            .duration(200)
            .style('opacity', 0.8);
        })

        //Add Event Listeners | mouseout
        .on('mouseout', function(d) {
          d3.select(this)
            .transition()
            .duration(100)
            .style('fill', d.color);
          d3.select('#mapTooltip')
            .transition()
            .duration(100)
            .style('opacity', 0)
        });
}



function loadMapData(){
    d3.json('assets/data/map.json', function(error, data) {
        if (error) console.error(error);

        loadedMapData = data
        // console.log(loadedMapData)

        filteredItem = loadedMapData.filter(function (d) {
              if (d.Year==1992) {return d}
        })

        visulizeCountryDots(filteredItem);

    })
}

 // console.log(filteredItem)




function findDataItem(data, year){

   d3.select("#countryDots")
    .remove();

      filteredItem = data.filter(function (d) {

      // console.log(year)


      if (d.Year==year) {return d}
      // console.log(d)
      // console.log(filteredItem)
      })
}
