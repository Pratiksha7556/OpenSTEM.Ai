import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as d3 from "d3";

const ProjectileSimulation = forwardRef(function ProjectileSimulation(
  { data, variables, voicePlaying },
  ref,
) {
  const svgRef = useRef();
  const animRef = useRef();
  const stateRef = useRef({ idx: 0, running: true, drawn: false });
  const [live, setLive] = useState({ x: 0, y: 0, t: 0 });

  const vel = parseFloat(variables?.velocity || 20);
  const angle = parseFloat(variables?.angle || 45);
  const g = 9.8;
  const stats = data?.stats || {};

  useEffect(() => {
    stateRef.current.running = voicePlaying !== false;
  }, [voicePlaying]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      stateRef.current.idx = 0;
    },
    play: () => {
      stateRef.current.running = true;
    },
    pause: () => {
      stateRef.current.running = false;
    },
  }));

  useEffect(() => {
    const el = svgRef.current;
    if (!el || !data?.points?.length) return;
    cancelAnimationFrame(animRef.current);
    stateRef.current.idx = 0;
    stateRef.current.running = true;

    const pts = data.points;
    d3.select(el).selectAll("*").remove();

    const W = el.clientWidth || 620;
    const H = 360;
    const m = { top: 30, right: 24, bottom: 50, left: 54 };
    const iw = W - m.left - m.right;
    const ih = H - m.top - m.bottom;

    const xMax = d3.max(pts, (d) => d.x) || 1;
    const yMax = d3.max(pts, (d) => d.y) || 1;
    const xs = d3
      .scaleLinear()
      .domain([0, xMax * 1.05])
      .range([0, iw]);
    const ys = d3
      .scaleLinear()
      .domain([0, yMax * 1.3])
      .range([ih, 0]);

    const svg = d3
      .select(el)
      .attr("viewBox", `0 0 ${W} ${H}`)
      .append("g")
      .attr("transform", `translate(${m.left},${m.top})`);

    // Grid
    svg
      .selectAll(".gx")
      .data(xs.ticks(6))
      .enter()
      .append("line")
      .attr("x1", (d) => xs(d))
      .attr("x2", (d) => xs(d))
      .attr("y1", 0)
      .attr("y2", ih)
      .attr("stroke", "rgba(0,212,255,.04)")
      .attr("stroke-width", 1);
    svg
      .selectAll(".gy")
      .data(ys.ticks(5))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", iw)
      .attr("y1", (d) => ys(d))
      .attr("y2", (d) => ys(d))
      .attr("stroke", "rgba(0,212,255,.04)")
      .attr("stroke-width", 1);

    // Ground
    svg
      .append("line")
      .attr("x1", 0)
      .attr("x2", iw)
      .attr("y1", ih)
      .attr("y2", ih)
      .attr("stroke", "rgba(0,212,255,.3)")
      .attr("stroke-width", 2);

    // Axes
    const aStyle = (g) => {
      g.select(".domain").attr("stroke", "#1d2d3f");
      g.selectAll(".tick line").remove();
      g.selectAll(".tick text")
        .attr("fill", "#3d5a73")
        .style("font-size", "10px")
        .style("font-family", "JetBrains Mono,monospace");
    };
    svg
      .append("g")
      .attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(xs).ticks(6))
      .call(aStyle);
    svg.append("g").call(d3.axisLeft(ys).ticks(5)).call(aStyle);

    // Axis labels
    const lStyle = {
      fill: "#3d5a73",
      fontSize: "11px",
      fontFamily: "JetBrains Mono,monospace",
    };
    svg
      .append("text")
      .attr("x", iw / 2)
      .attr("y", ih + 40)
      .attr("text-anchor", "middle")
      .style("fill", lStyle.fill)
      .style("font-size", lStyle.fontSize)
      .style("font-family", lStyle.fontFamily)
      .text("Horizontal Distance (m)");
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -42)
      .attr("x", -ih / 2)
      .attr("text-anchor", "middle")
      .style("fill", lStyle.fill)
      .style("font-size", lStyle.fontSize)
      .style("font-family", lStyle.fontFamily)
      .text("Height (m)");

    // Ghost trajectory (full path)
    const line = d3
      .line()
      .x((d) => xs(d.x))
      .y((d) => ys(d.y))
      .curve(d3.curveCatmullRom);
    svg
      .append("path")
      .datum(pts)
      .attr("fill", "none")
      .attr("stroke", "rgba(0,212,255,.1)")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // Max height marker
    const maxPt = pts.reduce((a, b) => (a.y > b.y ? a : b));
    svg
      .append("line")
      .attr("x1", xs(maxPt.x))
      .attr("x2", xs(maxPt.x))
      .attr("y1", ys(0))
      .attr("y2", ys(maxPt.y))
      .attr("stroke", "rgba(245,166,35,.4)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 3");
    svg
      .append("text")
      .attr("x", xs(maxPt.x) + 5)
      .attr("y", ys(maxPt.y) - 6)
      .attr("fill", "rgba(245,166,35,.8)")
      .style("font-size", "11px")
      .style("font-family", "JetBrains Mono,monospace")
      .text(`H = ${maxPt.y.toFixed(1)} m`);

    // Range label
    const lastPt = pts[pts.length - 1];
    svg
      .append("text")
      .attr("x", xs(lastPt.x) - 5)
      .attr("y", ih + 14)
      .attr("text-anchor", "end")
      .attr("fill", "rgba(46,204,113,.7)")
      .style("font-size", "11px")
      .style("font-family", "JetBrains Mono,monospace")
      .text(`R = ${lastPt.x.toFixed(1)} m`);

    // Live path (drawn progressively)
    const livePath = svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#00d4ff")
      .attr("stroke-width", 2.5);

    // Ball
    const ball = svg
      .append("circle")
      .attr("r", 10)
      .attr("fill", "#0ea5e9")
      .attr("cx", xs(pts[0].x))
      .attr("cy", ys(pts[0].y))
      .style("filter", "drop-shadow(0 0 10px rgba(14,165,233,.8))");

    // Live labels (attach once, update positions)
    const xLabel = svg
      .append("text")
      .attr("fill", "#00d4ff")
      .style("font-size", "11px")
      .style("font-family", "JetBrains Mono,monospace");
    const yLabel = svg
      .append("text")
      .attr("fill", "#f5a623")
      .style("font-size", "11px")
      .style("font-family", "JetBrains Mono,monospace");
    const vLabel = svg
      .append("text")
      .attr("fill", "rgba(46,204,113,.9)")
      .style("font-size", "11px")
      .style("font-family", "JetBrains Mono,monospace");

    // Paused overlay
    const pauseRect = svg
      .append("rect")
      .attr("x", 0)
      .attr("y", ih / 2 - 20)
      .attr("width", iw)
      .attr("height", 40)
      .attr("fill", "rgba(0,0,0,.5)")
      .attr("opacity", 0);
    const pauseText = svg
      .append("text")
      .attr("x", iw / 2)
      .attr("y", ih / 2 + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,.7)")
      .style("font-size", "13px")
      .style("font-family", "Outfit,sans-serif")
      .attr("opacity", 0)
      .text("⏸ Paused — Voice stopped");

    const animate = () => {
      const running = stateRef.current.running;
      if (running && stateRef.current.idx < pts.length - 1) {
        stateRef.current.idx = Math.min(
          stateRef.current.idx + 1,
          pts.length - 1,
        );
      }
      if (running && stateRef.current.idx >= pts.length - 1) {
        stateRef.current.idx = 0; // loop
      }

      const i = stateRef.current.idx;
      const pt = pts[i];
      const drawnPts = pts.slice(0, i + 1);

      livePath.datum(drawnPts).attr("d", line);
      ball.attr("cx", xs(pt.x)).attr("cy", ys(pt.y));

      xLabel
        .attr("x", xs(pt.x) + 12)
        .attr("y", ys(pt.y) + 4)
        .text(`x=${pt.x.toFixed(1)}m`);
      yLabel
        .attr("x", xs(pt.x) + 12)
        .attr("y", ys(pt.y) + 16)
        .text(`y=${pt.y.toFixed(1)}m`);

      // velocity calc
      const angRad = (angle * Math.PI) / 180;
      const t = pt.t || 0;
      const vy = vel * Math.sin(angRad) - g * t;
      const vx = vel * Math.cos(angRad);
      const v = Math.sqrt(vx * vx + vy * vy);
      vLabel
        .attr("x", xs(pt.x) + 12)
        .attr("y", ys(pt.y) + 28)
        .text(`v=${v.toFixed(1)}m/s`);

      setLive({
        x: pt.x.toFixed(1),
        y: pt.y.toFixed(1),
        t: (pt.t || 0).toFixed(2),
      });

      pauseRect.attr("opacity", running ? 0 : 1);
      pauseText.attr("opacity", running ? 0 : 1);

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animRef.current);
  }, [data]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: "100%",
        height: 360,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
      }}
    />
  );
});

export default ProjectileSimulation;
