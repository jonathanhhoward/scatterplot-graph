const datasetURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

d3.json(datasetURL)
  .then(dataset => {
    dataset.forEach(d => {
      d.dateYear = new Date(d3.timeParse('%Y')(d.Year));
      d.dateTime = new Date(d3.timeParse('%M:%S')(d.Time));
    });
    return dataset;
  })
  .then(scatterplotGraph)
  .catch(console.error);

function scatterplotGraph(dataset) {
  const svgWidth = window.innerWidth;
  const svgHeight = window.innerHeight * 0.99;
  const margin = { top: 100, right: 50, bottom: 80, left: 80 };

  const root = d3.select('#root');

  const svg = root.append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  svg.append('text')
    .attr('id', 'title')
    .attr('x', svgWidth * 0.5)
    .attr('y', margin.top * 0.5)
    .text('Doping in Professional Bicycle Racing');

  const chart = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const xScale = d3.scaleTime()
    .domain(d3.extent(dataset, d => d.dateYear))
    .range([0, chartWidth]);

  chart.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(xScale));

  const yScale = d3.scaleTime()
    .domain(d3.extent(dataset, data => data.dateTime))
    .range([chartHeight, 0]);

  chart.append('g')
    .attr('id', 'y-axis')
    .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S')));

  const colorScale = d3.scaleOrdinal(['blue', 'orange']);

  chart.selectAll('circle')
    .data(dataset)
    .join('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.dateYear))
    .attr('cy', d => yScale(d.dateTime))
    .attr('r', 5)
    .attr('fill', d => colorScale(d.Doping === ''))
    .attr('data-xvalue', d => d.dateYear)
    .attr('data-yvalue', d => d.dateTime)
    .on('mouseover', showTooltip)
    .on('mouseout', hideTooltip);

  const legend = svg.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${margin.left}, ${svgHeight - margin.bottom * 0.5})`);

  const legendItems = legend.selectAll('g')
    .data(['Doping Allegations', 'No Doping Allegations'])
    .join('g');

  const itemWidth = 150;
  const swatchSize = 10;
  const swatchSpacing = 5;

  legendItems.append('rect')
    .attr('x', (d, i) => i * itemWidth)
    .attr('y', 0)
    .attr('width', swatchSize)
    .attr('height', swatchSize)
    .attr('fill', d => colorScale(d));

  legendItems.append('text')
    .attr('x', (d, i) => i * itemWidth + swatchSize + swatchSpacing)
    .attr('y', 0)
    .attr('dy', '.71em')
    .text(d => d);

  const tooltip = root.append('div')
    .attr('id', 'tooltip');

  function showTooltip(event, data) {
    const w = 200;
    const h = 100;
    const offset = 20;
    const { pageX, pageY } = event;
    const left = pageX + offset;
    const top = pageY + offset;
    const right = (svgWidth - pageX) + offset;
    const bottom = (svgHeight - pageY) + offset;
    const isOverflowX = left + w > svgWidth;
    const isOverflowY = top + h > svgHeight;

    tooltip.attr('data-year', data.dateYear)
      .html(
        `${data.Name}: ${data.Nationality}<br>` +
        `Year: ${data.Year} Time: ${data.Time}` +
        (data.Doping ? `<br><br>${data.Doping}` : ''),
      )
      .style('left', isOverflowX ? '' : `${left}px`)
      .style('top', isOverflowY ? '' : `${top}px`)
      .style('right', isOverflowX ? `${right}px` : '')
      .style('bottom', isOverflowY ? `${bottom}px` : '')
      .style('display', 'block');
  }

  function hideTooltip() {
    tooltip.style('display', 'none');
  }
}
