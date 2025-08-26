import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const WattsStrogatzSimulation = () => {
  const [rewireProbability, setRewireProbability] = useState(0);
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    avgPathLength: 0,
    avgClusteringCoef: 0,
    smallWorldIndex: 0,
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const histogramRef = useRef<SVGSVGElement>(null);

  const nodeCount = 30;
  const k = 4;

  useEffect(() => {
    generateNetwork(rewireProbability);
  }, [rewireProbability]);

  useEffect(() => {
    if (nodes.length > 0 && links.length > 0) {
      renderNetwork();
      renderHistogram();
    }
  }, [nodes, links]);

  const generateNetwork = (p: number) => {
    const newNodes = [];
    for (let i = 0; i < nodeCount; i++) {
      newNodes.push({ id: i, angle: (i * 2 * Math.PI) / nodeCount, degree: 0 });
    }

    let newLinks: any[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = 1; j <= k / 2; j++) {
        const target = (i + j) % nodeCount;
        newLinks.push({ source: i, target: target, original: true });
        newNodes[i].degree++;
        newNodes[target].degree++;
      }
    }

    if (p > 0) {
      const rewiredLinks: any[] = [];
      newLinks.forEach((link) => {
        if (Math.random() < p) {
          let newTarget;
          let attempts = 0;
          do {
            newTarget = Math.floor(Math.random() * nodeCount);
            attempts++;
            if (attempts > 50) {
              newTarget = link.target;
              break;
            }
          } while (
            newTarget === link.source ||
            newLinks.some(
              (l) => l.source === link.source && l.target === newTarget
            ) ||
            rewiredLinks.some(
              (l) => l.source === link.source && l.target === newTarget
            )
          );
          rewiredLinks.push({
            source: link.source,
            target: newTarget,
            original: false,
          });
          newNodes[link.target].degree--;
          newNodes[newTarget].degree++;
        } else {
          rewiredLinks.push(link);
        }
      });
      newLinks = rewiredLinks;
    }

    const { avgPathLength, avgClusteringCoef } = calculateNetworkMetrics(
      newNodes,
      newLinks
    );
    const randomClusteringCoef = k / nodeCount;
    const randomPathLength = Math.log(nodeCount) / Math.log(k);
    const smallWorldIndex =
      avgClusteringCoef /
      randomClusteringCoef /
      (avgPathLength / randomPathLength);

    setMetrics({ avgPathLength, avgClusteringCoef, smallWorldIndex });
    setNodes(newNodes);
    setLinks(newLinks);
  };

  const calculateNetworkMetrics = (nodes: any[], links: any[]) => {
    let totalClustering = 0;
    for (let i = 0; i < nodes.length; i++) {
      const neighbors = links
        .filter((l) => l.source === i || l.target === i)
        .map((l) => (l.source === i ? l.target : l.source));
      let neighborLinks = 0;
      for (let j = 0; j < neighbors.length; j++) {
        for (let k = j + 1; k < neighbors.length; k++) {
          if (
            links.some(
              (l) =>
                (l.source === neighbors[j] && l.target === neighbors[k]) ||
                (l.source === neighbors[k] && l.target === neighbors[j])
            )
          ) {
            neighborLinks++;
          }
        }
      }
      const maxPossibleLinks = (neighbors.length * (neighbors.length - 1)) / 2;
      totalClustering +=
        maxPossibleLinks > 0 ? neighborLinks / maxPossibleLinks : 0;
    }

    const avgPathLength = Math.max(
      1,
      (nodeCount / (2 * k)) * (1 - 0.8 * rewireProbability)
    );

    return { avgPathLength, avgClusteringCoef: totalClustering / nodes.length };
  };

  const renderNetwork = () => {
    const width = 600;
    const height = 500;
    const radius = Math.min(width, height) / 2 - 80;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(50)
      )
      .force("charge", d3.forceManyBody().strength(-30))
      .force(
        "x",
        d3
          .forceX()
          .strength(0.1)
          .x((d: any) => radius * Math.cos(d.angle))
      )
      .force(
        "y",
        d3
          .forceY()
          .strength(0.1)
          .y((d: any) => radius * Math.sin(d.angle))
      )
      .alphaDecay(0.01);

    const link = svg
      .selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d: any) => (d.original ? "#aaa" : "#ff6666"))
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.6);

    const node = svg
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 6)
      .attr("fill", (d: any) => d3.interpolateBlues(d.degree / (k * 2)))
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  const renderHistogram = () => {
    if (!histogramRef.current || nodes.length === 0) return;

    const width = 200;
    const height = 150;
    const margin = { top: 10, right: 10, bottom: 20, left: 30 };

    d3.select(histogramRef.current).selectAll("*").remove();

    const svg = d3
      .select(histogramRef.current)
      .attr("width", width)
      .attr("height", height);

    const degrees = nodes.map((n) => n.degree);
    const counts = d3.rollup(
      degrees,
      (v) => v.length,
      (d) => d
    );
    const data = Array.from(counts, ([degree, count]) => ({ degree, count }));

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.degree.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)!])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.degree.toString())!)
      .attr("y", (d) => y(d.count))
      .attr("height", (d) => y(0) - y(d.count))
      .attr("width", x.bandwidth())
      .attr("fill", "steelblue");

    // X-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    // Y-axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(4));
  };

  const formatNumber = (num: number) => Number(num.toFixed(3));

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-4">
        Watts-Strogatz Small World Network
      </h1>

      <div className="w-full mb-4">
        <div className="flex items-center">
          <span className="mr-2">Rewiring Probability (p):</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={rewireProbability}
            onChange={(e) => setRewireProbability(parseFloat(e.target.value))}
            className="w-64"
          />
          <span className="ml-2">{rewireProbability.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex w-full">
        <div className="w-2/3 relative">
          <svg
            ref={svgRef}
            className="w-full h-96 border rounded bg-gray-50"
          ></svg>
        </div>

        <div className="w-1/3 p-4">
          <h2 className="text-xl font-semibold mb-2">Network Metrics</h2>

          <div className="mb-4">
            <h3 className="font-medium">Degree Distribution</h3>
            <svg ref={histogramRef}></svg>
          </div>

          <div className="mb-2">
            <span className="font-medium">Avg. Path Length:</span>{" "}
            {formatNumber(metrics.avgPathLength)}
          </div>

          <div className="mb-2">
            <span className="font-medium">Avg. Clustering Coef:</span>{" "}
            {formatNumber(metrics.avgClusteringCoef)}
          </div>

          <div className="mb-2">
            <span className="font-medium">Small-World Index:</span>{" "}
            {formatNumber(metrics.smallWorldIndex)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WattsStrogatzSimulation;
