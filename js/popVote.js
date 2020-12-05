/* eslint-disable no-param-reassign */
/* global d3 */

// need to figure out how to find winner and display

const electionGraph = (data) => {
  const padding = 100;
  const height = 500;
  const width = 700;
  const scalePopPadding = 500000;
  const scaleElePadding = 25;
  let counter = 0;

  const demBlue = '#6495ED';
  const repRed = '#AF3C27';

  const eleGraph = d3.select('#bar-graph')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('cursor', 'pointer');

  const slider = document.querySelector('#sliderContainer input');

  let sums = [];

  const democrats = data.filter((d) => d.Party === 'Democratic');
  const republicans = data.filter((d) => d.Party === 'Republican');

  for (let i = 0; i < democrats.length; i += 1) {
    sums = sums.concat([{
      year: democrats[i].Year,
      popSum: democrats[i].PopularVotes + republicans[i].PopularVotes,
      eleSum: democrats[i].ElectoralVotes + republicans[i].ElectoralVotes,
      demPopVotes: democrats[i].PopularVotes,
      repPopVotes: republicans[i].PopularVotes,
      demEleVotes: democrats[i].ElectoralVotes,
      repEleVotes: republicans[i].ElectoralVotes,
      demCandidate: democrats[i].Candidate,
      repCandidate: republicans[i].Candidate,
    }]);
  }

  const dataset1 = {
    key: 0,
    values: {
      democrats,
      republicans,
    },
  };

  const dataset2 = {
    key: 1,
    values: {
      sums,
    },
  };

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

  const xScale = d3.scaleBand()
    .domain(data.map((d) => d.Year))
    .rangeRound([padding, width - padding])
    .paddingInner(0.8);

  const popScale = d3.scaleLinear()
    .domain([minPopValue, maxPopValue])
    .range([height - padding, padding]);

  const eleScale = d3.scaleLinear()
    .domain([minEleValue, maxEleValue])
    .range([height - padding, padding]);

  const demGroup = eleGraph.append('g');
  const demRects = demGroup.selectAll('rect').data(dataset1.values.democrats);

  demRects.enter()
    .append('rect')
    .attr('x', (d) => xScale(d.Year) - xScale.bandwidth() / 2)
    .attr('y', (d) => popScale(d.PopularVotes))
    .attr('height', (d) => height - padding - popScale(d.PopularVotes))
    .attr('width', xScale.bandwidth())
    .attr('fill', demBlue)
    .attr('class', 'dem-pop-rect')
    .style('fill-opacity', (d) => {
      if (d.Year !== +slider.value) {
        return 0.5;
      }
      return 1;
    })
    .append('title')
    .text((d) => `Candidate: ${d.Candidate}\nPopular Vote: ${String(d.PopularVotes).replace(/(.)(?=(\d{3})+$)/g, '$1,')}`);

  demRects.enter()
    .append('rect')
    .attr('x', (d) => xScale(d.Year) - ((3 * xScale.bandwidth()) / 2))
    .attr('y', (d) => eleScale(d.ElectoralVotes))
    .attr('height', (d) => height - padding - eleScale(d.ElectoralVotes))
    .attr('width', xScale.bandwidth())
    .attr('stroke', demBlue)
    .attr('stroke-width', 2)
    .attr('fill', 'transparent')
    .attr('class', 'dem-ele-rect')
    .style('stroke-opacity', (d) => {
      if (d.Year !== +slider.value) {
        return 0.5;
      }
      return 1;
    })
    .append('title')
    .text((d) => `Candidate: ${d.Candidate}\nElectoral Vote: ${d.ElectoralVotes}`);

  const repGroup = eleGraph.append('g');
  const repRects = repGroup.selectAll('rect').data(dataset1.values.republicans);

  repRects.enter()
    .append('rect')
    .attr('x', (d) => xScale(d.Year) + xScale.bandwidth() / 2)
    .attr('y', (d) => popScale(d.PopularVotes))
    .attr('height', (d) => height - padding - popScale(d.PopularVotes))
    .attr('width', xScale.bandwidth())
    .attr('fill', repRed)
    .attr('class', 'rep-pop-rect')
    .style('fill-opacity', (d) => {
      if (d.Year !== +slider.value) {
        return 0.5;
      }
      return 1;
    })
    .append('title')
    .text((d) => `Candidate: ${d.Candidate}\nPopular Vote: ${String(d.PopularVotes).replace(/(.)(?=(\d{3})+$)/g, '$1,')}`);

  repRects.enter()
    .append('rect')
    .attr('x', (d) => xScale(d.Year) + ((3 * xScale.bandwidth()) / 2))
    .attr('y', (d) => eleScale(d.ElectoralVotes))
    .attr('height', (d) => height - padding - eleScale(d.ElectoralVotes))
    .attr('width', xScale.bandwidth())
    .attr('stroke', repRed)
    .attr('stroke-width', 2)
    .attr('fill', 'transparent')
    .attr('class', 'rep-ele-rect')
    .style('stroke-opacity', (d) => {
      if (d.Year !== +slider.value) {
        return 0.5;
      }
      return 1;
    })
    .append('title')
    .text((d) => `Candidate: ${d.Candidate}\nElectoral Vote: ${d.ElectoralVotes}`);

  // axes
  const xAxis = d3.axisBottom(xScale)
    .tickSize(0);
  const popAxis = d3.axisLeft(popScale)
    .ticks(5)
    .tickSize(-(width - padding * 1.7))
    .tickFormat((d) => `${d / 1000000}`);
  const eleAxis = d3.axisRight(eleScale)
    .ticks(5)
    .tickSize(-(width - padding * 1.7));
  eleGraph.append('g')
    .attr('class', 'x-axis')
    .call(xAxis)
    .attr('transform', `translate(0, ${height - padding})`);
  eleGraph.append('g')
    .attr('class', 'pop-axis')
    .call(popAxis)
    .attr('transform', `translate(${padding - (3 * xScale.bandwidth()) / 2}, 0)`);
  eleGraph.append('g')
    .attr('class', 'ele-axis')
    .call(eleAxis)
    .attr('transform', `translate(${width - padding + (3 * xScale.bandwidth()) / 2}, 0)`);

  // style the axes
  eleGraph.selectAll('line')
    .attr('style', 'opacity: 0.2');
  eleGraph.selectAll('.domain')
    .attr('style', 'opacity: 0');

  // y axis title
  eleGraph.append('text')
    .attr('transform', `translate(${padding / 3} ${height / 2})rotate(-90)`)
    .style('font-size', '24px')
    .style('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
    .attr('class', 'pop-axis-label')
    .text('Popular Votes (in millions)');

  eleGraph.append('text')
    .attr('transform', `translate(${width - padding / 3} ${height / 2})rotate(90)`)
    .style('font-size', '24px')
    .style('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
    .attr('class', 'ele-axis-label')
    .text('Electoral Votes');

  // legend
  const legend = eleGraph.append('g')
    .attr('transform', `translate(${padding} ${padding - 20})`);

  legend.append('rect')
    .attr('fill', demBlue)
    .attr('height', 10)
    .attr('width', 10)
    .attr('y', -10);
  legend.append('text')
    .attr('x', 15)
    .style('font-family', 'sans-serif')
    .text('Democrat');

  legend.append('rect')
    .attr('fill', repRed)
    .attr('height', 10)
    .attr('width', 10)
    .attr('y', -10)
    .attr('x', 100);
  legend.append('text')
    .attr('x', 115)
    .style('font-family', 'sans-serif')
    .text('Republican');

  legend.append('rect')
    .attr('fill', demBlue)
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 210)
    .attr('y', -20);
  legend.append('rect')
    .attr('fill', repRed)
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 210)
    .attr('y', 0);
  legend.append('text')
    .attr('x', 230)
    .style('font-family', 'sans-serif')
    .text('Popular Vote');

  legend.append('rect')
    .attr('fill', 'transparent')
    .attr('stroke', demBlue)
    .attr('stroke-width', 2)
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 350)
    .attr('y', -20);
  legend.append('rect')
    .attr('fill', 'transparent')
    .attr('stroke', repRed)
    .attr('stroke-width', 2)
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 350)
    .attr('y', 0);
  legend.append('text')
    .attr('x', 370)
    .style('font-family', 'sans-serif')
    .text('Electoral Vote');

  // title
  const titleGroup = eleGraph.append('g')
    .attr('transform', `translate(${width / 2} ${height - padding / 2})`);

  titleGroup.append('text')
    .style('font-size', '24px')
    .style('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
    .text('Presidential Election Results from 1976-2016');

  // get value from slider and filter data
  slider.addEventListener('input', () => {
    const electionYear = +slider.value;

    eleGraph.selectAll('.dem-pop-rect')
      .data(dataset1.values.democrats)
      .transition()
      .duration(300)
      .style('fill-opacity', (d) => {
        if (d.Year !== electionYear) {
          return 0.5;
        }
        return 1;
      });
    eleGraph.selectAll('.dem-ele-rect')
      .data(dataset1.values.democrats)
      .transition()
      .duration(300)
      .style('stroke-opacity', (d) => {
        if (d.Year !== electionYear) {
          return 0.5;
        }
        return 1;
      });

    eleGraph.selectAll('.rep-pop-rect')
      .data(dataset1.values.republicans)
      .transition()
      .duration(300)
      .style('fill-opacity', (d) => {
        if (d.Year !== electionYear) {
          return 0.5;
        }
        return 1;
      });
    eleGraph.selectAll('.rep-ele-rect')
      .data(dataset1.values.republicans)
      .transition()
      .duration(300)
      .style('stroke-opacity', (d) => {
        if (d.Year !== electionYear) {
          return 0.5;
        }
        return 1;
      });
  });

  d3.select('#bar-graph')
    .on('click', () => {
      counter = (counter + 1) % 2;

      if (counter === 0) {
        popScale.domain([minPopValue, maxPopValue]);
        eleScale.domain([minEleValue, maxEleValue]);
        xScale.paddingInner(0.8);

        // update rectangles
        eleGraph.selectAll('.dem-pop-rect')
          .data(dataset1.values.democrats)
          .transition()
          .duration(1000)
          .attr('x', (d) => xScale(d.Year) - xScale.bandwidth() / 2)
          .attr('y', (d) => popScale(d.PopularVotes))
          .attr('height', (d) => height - padding - popScale(d.PopularVotes))
          .attr('width', xScale.bandwidth());
        eleGraph.selectAll('.dem-ele-rect')
          .data(dataset1.values.democrats)
          .transition()
          .duration(1000)
          .attr('x', (d) => xScale(d.Year) - (3 * xScale.bandwidth()) / 2)
          .attr('y', (d) => eleScale(d.ElectoralVotes))
          .attr('height', (d) => height - padding - eleScale(d.ElectoralVotes))
          .attr('width', xScale.bandwidth());
        eleGraph.selectAll('.rep-pop-rect')
          .data(dataset1.values.republicans)
          .transition()
          .duration(1000)
          .attr('x', (d) => xScale(d.Year) + xScale.bandwidth() / 2)
          .attr('y', (d) => popScale(d.PopularVotes))
          .attr('height', (d) => height - padding - popScale(d.PopularVotes))
          .attr('width', xScale.bandwidth());
        eleGraph.selectAll('.rep-ele-rect')
          .data(dataset1.values.republicans)
          .transition()
          .duration(1000)
          .attr('x', (d) => xScale(d.Year) + (3 * xScale.bandwidth()) / 2)
          .attr('y', (d) => eleScale(d.ElectoralVotes))
          .attr('height', (d) => height - padding - eleScale(d.ElectoralVotes))
          .attr('width', xScale.bandwidth());

        // update axes
        const newPopAxis = d3.axisLeft(popScale)
          .ticks(5)
          .tickSize(-(width - padding * 1.7))
          .tickFormat((d) => `${d / 1000000}`);
        const newEleAxis = d3.axisRight(eleScale)
          .ticks(5)
          .tickSize(-(width - padding * 1.7));
        const newXAxis = d3.axisBottom(xScale)
          .tickSize(0);
        eleGraph.select('.pop-axis')
          .call(newPopAxis);
        eleGraph.select('.ele-axis')
          .call(newEleAxis);
        eleGraph.select('.x-axis')
          .call(newXAxis);

        // style the axes
        eleGraph.selectAll('line')
          .attr('style', 'opacity: 0.2');
        eleGraph.selectAll('.domain')
          .attr('style', 'opacity: 0');

        eleGraph.selectAll('.pop-axis-label')
          .text('Popular Vote (in millions)');
      } else if (counter === 1) {
        // update scales
        popScale.domain([0, 100]);
        eleScale.domain([0, 100]);
        xScale.paddingInner(0.6);

        // update rectangles
        eleGraph.selectAll('.dem-pop-rect')
          .data(dataset2.values.sums)
          .transition()
          .duration(1000)
          .attr('x', (d) => xScale(d.year) - xScale.bandwidth() / 2)
          .attr('y', (d) => popScale((d.demPopVotes / d.popSum) * 100))
          .attr('height', (d) => height - padding - popScale((d.demPopVotes / d.popSum) * 100))
          .attr('width', xScale.bandwidth());
        eleGraph.selectAll('.dem-ele-rect')
          .data(dataset2.values.sums)
          .transition()
          .duration(1000)
          .attr('x', (d) => xScale(d.year) + xScale.bandwidth() / 2)
          .attr('y', (d) => eleScale((d.demEleVotes / d.eleSum) * 100))
          .attr('height', (d) => height - padding - eleScale((d.demEleVotes / d.eleSum) * 100))
          .attr('width', xScale.bandwidth());
        eleGraph.selectAll('.rep-pop-rect')
          .data(dataset2.values.sums)
          .transition()
          .duration(1000)
          .attr('x', (d) => xScale(d.year) - xScale.bandwidth() / 2)
          .attr('y', (d) => popScale((d.repPopVotes / d.popSum) * 100) - (height - padding - popScale((d.demPopVotes / d.popSum) * 100)))
          .attr('height', (d) => height - padding - popScale((d.repPopVotes / d.popSum) * 100))
          .attr('width', xScale.bandwidth());
        eleGraph.selectAll('.rep-ele-rect')
          .data(dataset2.values.sums)
          .transition()
          .duration(1000)
          .attr('x', (d) => xScale(d.year) + xScale.bandwidth() / 2)
          .attr('y', (d) => eleScale((d.repEleVotes / d.eleSum) * 100) - (height - padding - eleScale((d.demEleVotes / d.eleSum) * 100)))
          .attr('height', (d) => height - padding - eleScale((d.repEleVotes / d.eleSum) * 100))
          .attr('width', xScale.bandwidth());

        // update axes
        const newPopAxis = d3.axisLeft(popScale)
          .tickValues([0, 25, 50, 75, 100])
          .tickSize(-(width - padding * 1.7))
          .tickFormat((tick) => `${tick}%`);
        const newEleAxis = d3.axisRight(eleScale)
          .tickValues([0, 25, 50, 75, 100])
          .tickSize(-(width - padding * 1.7))
          .tickFormat((tick) => `${tick}%`);
        const newXAxis = d3.axisBottom(xScale)
          .tickSize(0);
        eleGraph.select('.pop-axis')
          .call(newPopAxis);
        eleGraph.select('.ele-axis')
          .call(newEleAxis);
        eleGraph.select('.x-axis')
          .call(newXAxis);

        // style the axes
        eleGraph.selectAll('line')
          .attr('style', 'opacity: 0.2');
        eleGraph.selectAll('.domain')
          .attr('style', 'opacity: 0');

        eleGraph.selectAll('.pop-axis-label')
          .text('Popular Vote Percentage');
        eleGraph.selectAll('.ele-axis-label')
          .text('Electoral Vote Percentage');
      }
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
    electionGraph(data);
  });
