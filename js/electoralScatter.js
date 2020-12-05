/* eslint-disable no-param-reassign */
/* global d3 */

const scatterGraph = (data) => {
  const padding = 100;
  const height = 500;
  const width = 600;
  const scalePopPadding = 500000;
  const scaleElePadding = 25;

  const demBlue = '#6495ED';
  const repRed = '#AF3C27';

  const slider = document.querySelector('#sliderContainer input');

  const eleScatter = d3.select('#analysis')
    .append('svg')
    .attr('height', height)
    .attr('width', width);

  const democrats = data.filter((d) => d.Party === 'Democratic');
  const republicans = data.filter((d) => d.Party === 'Republican');

  const minPopDems = d3.min(democrats.map((d) => d.PopularVotes));
  const maxPopDems = d3.max(democrats.map((d) => d.PopularVotes));
  const minPopReps = d3.min(republicans.map((d) => d.PopularVotes));
  const maxPopReps = d3.max(republicans.map((d) => d.PopularVotes));

  const minPopValue = (minPopReps < minPopDems)
    ? minPopReps - scalePopPadding
    : minPopDems - scalePopPadding;
  const maxPopValue = (maxPopReps > maxPopDems)
    ? maxPopReps + scalePopPadding
    : maxPopDems + scalePopPadding;

  const minEleDems = d3.min(democrats.map((d) => d.ElectoralVotes));
  const maxEleDems = d3.max(democrats.map((d) => d.ElectoralVotes));
  const minEleReps = d3.min(republicans.map((d) => d.ElectoralVotes));
  const maxEleReps = d3.max(republicans.map((d) => d.ElectoralVotes));

  const minEleValue = (minEleReps < minEleDems)
    ? minEleReps - scaleElePadding
    : minEleDems - scaleElePadding;
  const maxEleValue = (maxEleReps > maxEleDems)
    ? maxEleReps + scaleElePadding
    : maxEleDems + scaleElePadding;

  const xScale = d3.scaleLinear()
    .domain([minPopValue, maxPopValue])
    .range([padding, width - padding]);

  const yScale = d3.scaleLinear()
    .domain([minEleValue, maxEleValue])
    .rangeRound([height - padding, padding]);

  const demDotsArea = eleScatter.append('g');

  const demDots = demDotsArea.selectAll('circle').data(democrats);

  demDots.enter()
    .append('circle')
    .attr('cx', (d) => xScale(d.PopularVotes))
    .attr('cy', (d) => yScale(d.ElectoralVotes))
    .attr('r', (d) => {
      if (d.Year !== +slider.value) {
        return 5;
      }
      return 10;
    })
    .attr('class', 'dem-circle')
    .attr('fill', demBlue)
    .style('fill-opacity', (d) => {
      if (d.Year !== +slider.value) {
        return 0.5;
      }
      return 1;
    })
    .append('title')
    .text((d) => `Candidate: ${d.Candidate}\nPopular Votes: ${String(d.PopularVotes).replace(/(.)(?=(\d{3})+$)/g, '$1,')}\nElectoral Votes: ${d.ElectoralVotes}`);

  const repDotsArea = eleScatter.append('g');

  const repDots = repDotsArea.selectAll('circle').data(republicans);

  repDots.enter()
    .append('circle')
    .attr('cx', (d) => xScale(d.PopularVotes))
    .attr('cy', (d) => yScale(d.ElectoralVotes))
    .attr('r', (d) => {
      if (d.Year !== +slider.value) {
        return 5;
      }
      return 10;
    })
    .attr('class', 'rep-circle')
    .attr('fill', repRed)
    .style('fill-opacity', (d) => {
      if (d.Year !== +slider.value) {
        return 0.5;
      }
      return 1;
    })
    .append('title')
    .text((d) => `Candidate: ${d.Candidate}\nPopular Votes: ${String(d.PopularVotes).replace(/(.)(?=(\d{3})+$)/g, '$1,')}\nElectoral Votes: ${d.ElectoralVotes}`);

  // axes
  const xAxis = d3.axisBottom(xScale)
    .tickSize(-(height - padding * 2))
    .tickFormat((d) => `${d / 1000000}`);
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-(width - padding * 2));

  eleScatter.append('g')
    .attr('transform', `translate(${0} ${height - padding})`)
    .call(xAxis);
  eleScatter.append('g')
    .attr('transform', `translate(${padding} 0)`)
    .call(yAxis);

  // style the axes
  eleScatter.selectAll('line')
    .attr('style', 'opacity: 0.2');
  eleScatter.selectAll('.domain')
    .attr('style', 'opacity: 0');

  // x axis title
  eleScatter.append('text')
    .attr('transform', `translate(${width / 2} ${height - padding / 2})`)
    .style('font-size', '24px')
    .style('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
    .attr('class', 'x-axis-label')
    .text('Popular Votes (in millions)');

  // y axis title
  eleScatter.append('text')
    .attr('transform', `translate(${padding / 3} ${height / 2})rotate(-90)`)
    .style('font-size', '24px')
    .style('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
    .attr('class', 'y-axis-label')
    .text('Electoral Votes');

  // legend
  const legend = eleScatter.append('g')
    .attr('transform', `translate(${width - (padding * 3)} ${padding - 20})`);

  legend.append('circle')
    .attr('fill', demBlue)
    .attr('height', 10)
    .attr('width', 10)
    .attr('r', 5)
    .attr('cy', -5)
    .attr('cx', 5);
  legend.append('text')
    .attr('x', 15)
    .style('font-family', 'sans-serif')
    .text('Democrat');

  legend.append('circle')
    .attr('fill', repRed)
    .attr('height', 10)
    .attr('width', 10)
    .attr('r', 5)
    .attr('cy', -5)
    .attr('cx', 105);
  legend.append('text')
    .attr('x', 115)
    .style('font-family', 'sans-serif')
    .text('Republican');

  // get value from slider and filter data
  slider.addEventListener('input', () => {
    const electionYear = +slider.value;

    eleScatter.selectAll('.dem-circle')
      .data(democrats)
      .transition()
      .duration(300)
      .attr('r', (d) => {
        if (d.Year !== +slider.value) {
          return 5;
        }
        return 10;
      })
      .style('fill-opacity', (d) => {
        if (d.Year !== electionYear) {
          return 0.5;
        }
        return 1;
      });

    eleScatter.selectAll('.rep-circle')
      .data(republicans)
      .transition()
      .duration(300)
      .attr('r', (d) => {
        if (d.Year !== +slider.value) {
          return 5;
        }
        return 10;
      })
      .style('fill-opacity', (d) => {
        if (d.Year !== electionYear) {
          return 0.5;
        }
        return 1;
      });
  });
};

d3.csv('data/PresidentialElectoralVotes.csv')
  .then((data) => {
    data.forEach((ele) => {
      ele.Year = +ele.Year;
      ele.ElectoralVotes = +ele.ElectoralVotes;
      ele.PopularVotes = +ele.PopularVotes;
    });
    // console.log(data);
    scatterGraph(data);
  });
