import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

const WordCloud = ({ words }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    // const width = +svg.attr('width');
    // const height = +svg.attr('height');
    const wrapper = d3.select(wrapperRef.current);
    const width = wrapper.node().getBoundingClientRect().width;
    const height = wrapper.node().getBoundingClientRect().height;

    svg.attr('width', width);
    svg.attr('height', height);

    const layout = cloud()
      .size([width, height])
      .words(words.map(word => ({ text: word.text, size: word.size })))
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .font('Impact')
      .fontSize(d => d.size)
      .on('end', draw);

    layout.start();

    function draw(words) {
      svg
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', d => `${d.size}px`)
        .style('font-family', 'Impact')
        .style('fill', (d, i) => d3.schemeSet3[i % 10])
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text(d => d.text);
    }

    return () => {
      svg.selectAll('*').remove(); // Clean up on unmount
    };
  }, [words]);

  // return <svg ref={svgRef} width="500" height="300"></svg>;

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '80%', paddingTop: '10px'}}>
      <svg ref={svgRef}></svg>
    </div>
  );
  
};

export default WordCloud;

