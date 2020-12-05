/* eslint-disable no-param-reassign */
/* global d3 */

// d3.csv('sample-tax-data.csv')
//   .then((data) => {
//     console.log(data);
//   });

const makeMap = (data) => {
  const height = 800;
  const width = 800;

  const demColor = d3.scaleQuantize()
    .domain([0.02, 0.05, 0.1, 0.2])
    .range(['#C8D9F9', '#91B3F2', '#5B8DEC', '#2468E5']);

  const repColor = d3.scaleQuantize()
    .domain([0.02, 0.05, 0.1, 0.2])
    .range(['#E28979', '#D75D47', '#B83E28', '#862D1D']);

  const projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2]);

  const path = d3.geoPath()
    .projection(projection);

  const mapGraph = d3.select('#map')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  d3.json('us-states.json')
    .then((json) => {
      const jsonData = { ...json };
      for (let i = 0; i < data.length; i += 1) {
        const dataState = data[i].state;
        const dataValue = (data[i].party === 'democrat')
          ? [{
            year: data[i].year,
            state: dataState,
            demVote: data[i].candidatevotes,
            demRep: data[i].candidate,
          }]
          : [{
            year: data[i].year,
            state: dataState,
            repVote: data[i].candidatevotes,
            repRep: data[i].candidate,
          }];

        for (let j = 0; j < json.features.length; j += 1) {
          const jsonState = json.features[j].properties.name;
          let inputted = false;
          if (dataState === jsonState) {
            if (jsonData.features[j].properties.value) {
              for (let k = 0; k < json.features[j].properties.value.length; k += 1) {
                if (jsonData.features[j].properties.value[k].year === dataValue[0].year) {
                  if (Object.prototype.hasOwnProperty.call(jsonData.features[j].properties.value[k], 'demVote')) {
                    jsonData.features[j].properties.value[k].repVote = dataValue[0].repVote;
                    jsonData.features[j].properties.value[k].repRep = dataValue[0].repRep;
                    inputted = true;
                  } else {
                    jsonData.features[j].properties.value[k].demVote = dataValue[0].demVote;
                    jsonData.features[j].properties.value[k].demRep = dataValue[0].demRep;
                    inputted = true;
                  }
                }
                // console.log(jsonData.features[j].properties.value[k]);
              }
              if (!inputted) {
                inputted = false;
                jsonData.features[j].properties.value = jsonData
                  .features[j].properties.value.concat(dataValue);
              }
            } else {
              jsonData.features[j].properties.value = dataValue;
            }
            break;
          }
        }
      }

      // get value from slider and filter data
      const slider = document.querySelector('#sliderContainer input');
      const sliderValue = document.querySelector('#sliderContainer p');
      sliderValue.innerHTML = `Year: ${+slider.value}`;

      slider.addEventListener('input', () => {
        const electionYear = +slider.value;
        sliderValue.innerHTML = `Year: ${electionYear}`;

        mapGraph.selectAll('path')
          .data(jsonData.features)
          .transition()
          .duration(300)
          .style('fill', (d) => {
            const { value } = d.properties;
            const yearChosen = value.filter((result) => result.year === electionYear);
            if (yearChosen[0].demVote < yearChosen[0].repVote) {
              return repColor((yearChosen[0].repVote - yearChosen[0].demVote)
                / (yearChosen[0].repVote + yearChosen[0].demVote));
            }
            return demColor((yearChosen[0].demVote - yearChosen[0].repVote)
                / (yearChosen[0].repVote + yearChosen[0].demVote));
          });

        mapGraph.selectAll('.state-info')
          .data(jsonData.features)
          .text((d) => {
            const { value } = d.properties;
            const yearChosen = value.filter((result) => result.year === +slider.value);
            if (yearChosen[0].demVote > yearChosen[0].repVote) {
              return `State: ${yearChosen[0].state}\nWinner: ${yearChosen[0].demRep}\nVotes: ${yearChosen[0].demVote}\nLead: ${(((yearChosen[0].demVote - yearChosen[0].repVote)
                / (yearChosen[0].repVote + yearChosen[0].demVote)) * 100).toFixed(2)}%`;
            }
            return `State: ${yearChosen[0].state}\nWinner: ${yearChosen[0].repRep}\nVotes: ${yearChosen[0].repVote}\nLead: ${(((yearChosen[0].repVote - yearChosen[0].demVote)
              / (yearChosen[0].repVote + yearChosen[0].demVote)) * 100).toFixed(2)}%`;
          });

        mapGraph.selectAll('.mapTitle')
          .text(`${electionYear} Presidential Election Map`);
      });

      mapGraph.selectAll('path')
        .data(jsonData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('fill', (d) => {
          const { value } = d.properties;
          const yearChosen = value.filter((result) => result.year === +slider.value);
          if (yearChosen[0].demVote < yearChosen[0].repVote) {
            return repColor((yearChosen[0].repVote - yearChosen[0].demVote)
              / (yearChosen[0].repVote + yearChosen[0].demVote));
          }
          return demColor((yearChosen[0].demVote - yearChosen[0].repVote)
              / (yearChosen[0].repVote + yearChosen[0].demVote));
        })
        .attr('stroke-width', 1)
        .attr('stroke', 'white')
        .append('title')
        .attr('class', 'state-info')
        .text((d) => {
          const { value } = d.properties;
          const yearChosen = value.filter((result) => result.year === +slider.value);
          if (yearChosen[0].demVote > yearChosen[0].repVote) {
            return `State: ${yearChosen[0].state}\nWinner: ${yearChosen[0].demRep}\nVotes: ${String(yearChosen[0].demVote).replace(/(.)(?=(\d{3})+$)/g, '$1,')}\nLead: ${(((yearChosen[0].demVote - yearChosen[0].repVote)
              / (yearChosen[0].repVote + yearChosen[0].demVote)) * 100).toFixed(2)}%`;
          }
          return `State: ${yearChosen[0].state}\nWinner: ${yearChosen[0].repRep}\nVotes: ${String(yearChosen[0].repVote).replace(/(.)(?=(\d{3})+$)/g, '$1,')}\nLead: ${(((yearChosen[0].repVote - yearChosen[0].demVote)
            / (yearChosen[0].repVote + yearChosen[0].demVote)) * 100).toFixed(2)}%`;
        });
    });

  // title
  const titleGroup = mapGraph.append('g')
    .attr('transform', `translate(${width / 2} ${height - 50})`);

  titleGroup.append('text')
    .style('font-size', '36px')
    .style('font-family', 'sans-serif')
    .attr('class', 'mapTitle')
    .attr('text-anchor', 'middle')
    .text('2016 Presidential Election Map');

  // legend
  const legend = mapGraph.append('g')
    .attr('transform', `translate(${130} ${130})`);

  legend.append('text')
    .attr('x', -50)
    .style('font-family', 'sans-serif')
    .style('font-size', '18px')
    .text('Leads in polls');

  legend.append('rect')
    .attr('fill', '#6495ED')
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 80)
    .attr('y', -20);
  legend.append('text')
    .attr('x', 95)
    .attr('y', -10)
    .style('font-family', 'sans-serif')
    .text('Democrat');

  legend.append('rect')
    .attr('fill', '#AF3C27')
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 80);
  legend.append('text')
    .attr('x', 95)
    .attr('y', 10)
    .style('font-family', 'sans-serif')
    .text('Republican');

  legend.append('rect')
    .attr('fill', '#C8D9F9')
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 210)
    .attr('y', -20);
  legend.append('rect')
    .attr('fill', '#E28979')
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 210)
    .attr('y', 0);
  legend.append('text')
    .attr('x', 225)
    .style('font-family', 'sans-serif')
    .text('< 2%');

  legend.append('rect')
    .attr('fill', '#91B3F2')
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 300)
    .attr('y', -20);
  legend.append('rect')
    .attr('fill', '#D75D47')
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 300)
    .attr('y', 0);
  legend.append('text')
    .attr('x', 315)
    .style('font-family', 'sans-serif')
    .text('2%-5%');

  legend.append('rect')
    .attr('fill', '#5B8DEC')
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 390)
    .attr('y', -20);
  legend.append('rect')
    .attr('fill', '#B83E28')
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 390)
    .attr('y', 0);
  legend.append('text')
    .attr('x', 405)
    .style('font-family', 'sans-serif')
    .text('5%-10%');

  legend.append('rect')
    .attr('fill', '#2468E5')
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 480)
    .attr('y', -20);
  legend.append('rect')
    .attr('fill', '#862D1D')
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 480)
    .attr('y', 0);
  legend.append('text')
    .attr('x', 495)
    .style('font-family', 'sans-serif')
    .text('> 10%');
};

d3.csv('1976-2016-president.csv')
  .then((data) => {
    data.forEach((d) => {
      d.year = parseInt(d.year, 10);
      d.candidatevotes = parseInt(d.candidatevotes, 10);
      d.totalvotes = parseInt(d.totalvotes, 10);
    });
    return data
      .filter((d) => d.party === 'democrat' || d.party === 'republican')
      .filter((d) => d.candidate !== '')
      .filter((d) => d.writein !== 'TRUE');
  })
  .then((data) => {
    makeMap(data);
  });
