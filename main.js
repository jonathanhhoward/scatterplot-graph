const datasetURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

d3.json(datasetURL)
  .then(dataset => {
    dataset.forEach(d => {
      d.dateYear = new Date(d3.timeParse('%Y')(d.Year));
      d.dateTime = new Date(d3.timeParse('%M:%S')(d.Time));
    });
    scatterplotGraph(dataset);
  })
  .catch(console.error);

function scatterplotGraph(dataset) {
  const svgWidth = window.innerWidth;
  const svgHeight = window.innerHeight * 0.97;
  const margin = { top: 100, right: 50, bottom: 50, left: 100 };

  const root = d3.select('#root');

  const svg = root.append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  svg.append('text')
    .attr('id', 'title')
    .attr('class', 'title')
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
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.dateYear))
    .attr('cy', d => yScale(d.dateTime))
    .attr('r', 5)
    .attr('fill', d => colorScale(d.Doping === ''))
    .attr('data-xvalue', d => d.dateYear)
    .attr('data-yvalue', d => d.dateTime)
    .on('mouseover', showTooltip)
    .on('mouseout', hideTooltip);

  const legend = chart.append('g')
    .attr('id', 'legend')
    .attr('class', 'legend')
    .attr('transform', `translate(${chartWidth - 200}, ${chartHeight - 100})`);

  const legendItems = legend.selectAll('g')
    .data(['Doping Allegations', 'No Doping Allegations'])
    .enter()
    .append('g');

  const itemSize = 10;
  const itemSpacing = 5;

  legendItems.append('rect')
    .attr('x', 0)
    .attr('y', (d, i) => i * (itemSize + itemSpacing))
    .attr('width', itemSize)
    .attr('height', itemSize)
    .attr('fill', d => colorScale(d));

  legendItems.append('text')
    .attr('x', itemSize + itemSpacing)
    .attr('y', (d, i) => i * (itemSize + itemSpacing))
    .attr('dy', '.71em')
    .text(d => d);

  const tooltip = root.append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip');

  function showTooltip(event, data) {
    const w = 200;
    const h = 100;
    const offset = 20;
    const x = event.pageX + offset;
    const y = event.pageY + offset;
    const { innerWidth, innerHeight } = window;
    const isOverflowX = x + w > innerWidth;
    const isOverflowY = y + h > innerHeight;

    tooltip.attr('data-year', data.dateYear)
      .html(
        `${data.Name}: ${data.Nationality}<br>` +
        `Year: ${data.Year} Time: ${data.Time}` +
        (data.Doping ? `<br><br>${data.Doping}` : ''),
      )
      .style('left', isOverflowX ? '' : `${x}px`)
      .style('top', isOverflowY ? '' : `${y}px`)
      .style('right', isOverflowX ? `${innerWidth - x}px` : '')
      .style('bottom', isOverflowY ? `${innerHeight - y}px` : '')
      .style('display', 'block');
  }

  function hideTooltip() {
    tooltip.style('display', 'none');
  }
}
