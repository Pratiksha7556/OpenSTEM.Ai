import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function WaveSimulation({ data, variables, onVariableChange }) {
  const svgRef = useRef();
  const animRef = useRef();
  const tRef = useRef(0);
  const pauseRef = useRef(false);

  const [freq, setFreq] = useState(variables?.frequency || 2);
  const [amp, setAmp] = useState(variables?.amplitude || 1);
  const [speed, setSpeed] = useState(variables?.velocity || 4);
  const [paused, setPaused] = useState(false);
  const [showRef, setShowRef] = useState(true);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    cancelAnimationFrame(animRef.current);
    d3.select(el).selectAll("*").remove();

    const W = el.clientWidth || 640;
    const H = 300;
    const m = { top: 20, right: 20, bottom: 44, left: 52 };
    const iw = W - m.left - m.right;
    const ih = H - m.top - m.bottom;

    const svg = d3
      .select(el)
      .attr("viewBox", `0 0 ${W} ${H}`)
      .append("g")
      .attr("transform", `translate(${m.left},${m.top})`);

    const lambda = speed / freq;
    const SPANS = 3;

    const xs = d3
      .scaleLinear()
      .domain([0, SPANS * lambda])
      .range([0, iw]);
    const ys = d3
      .scaleLinear()
      .domain([-amp * 1.4, amp * 1.4])
      .range([ih, 0]);

    // Grid
    svg
      .append("g")
      .selectAll("line")
      .data(ys.ticks(5))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", iw)
      .attr("y1", (d) => ys(d))
      .attr("y2", (d) => ys(d))
      .attr("stroke", "#1a2535")
      .attr("stroke-width", 1);

    // Zero axis
    svg
      .append("line")
      .attr("x1", 0)
      .attr("x2", iw)
      .attr("y1", ys(0))
      .attr("y2", ys(0))
      .attr("stroke", "#243447")
      .attr("stroke-width", 1.5);

    // Axes
    const axisStyle = (g) => {
      g.select(".domain").attr("stroke", "#1d2d3f");
      g.selectAll(".tick line").attr("stroke", "none");
      g.selectAll(".tick text")
        .attr("fill", "#4a6278")
        .style("font-size", "10px")
        .style("font-family", "'IBM Plex Mono', monospace");
    };
    svg
      .append("g")
      .attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(xs).ticks(6))
      .call(axisStyle);
    svg.append("g").call(d3.axisLeft(ys).ticks(5)).call(axisStyle);

    const labelStyle = {
      fill: "#4a6278",
      fontSize: "10px",
      fontFamily: "'IBM Plex Mono', monospace",
    };
    svg
      .append("text")
      .attr("x", iw / 2)
      .attr("y", ih + 36)
      .attr("text-anchor", "middle")
      .style("fill", labelStyle.fill)
      .style("font-size", labelStyle.fontSize)
      .style("font-family", labelStyle.fontFamily)
      .text("Position x (m)");
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -ih / 2)
      .attr("text-anchor", "middle")
      .style("fill", labelStyle.fill)
      .style("font-size", labelStyle.fontSize)
      .style("font-family", labelStyle.fontFamily)
      .text("Displacement y (m)");

    const k = (2 * Math.PI) / lambda;
    const omega = 2 * Math.PI * freq;
    const xArr = d3.range(0, SPANS * lambda + 0.01, (SPANS * lambda) / 200);

    const line = d3
      .line()
      .x((d) => xs(d.x))
      .y((d) => ys(d.y))
      .curve(d3.curveCatmullRom);

    // Wave 1 (main)
    const path1 = svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#22d3ee")
      .attr("stroke-width", 2.5);
    // Wave 2 (reference, phase shifted 90°)
    const path2 = svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#a78bfa")
      .attr("stroke-width", 1.8)
      .attr("stroke-dasharray", "6 4")
      .attr("opacity", 0.7);

    // Wavelength annotation arrow
    const lambdaX = xs(lambda);
    svg
      .append("line")
      .attr("x1", 0)
      .attr("x2", lambdaX)
      .attr("y1", 10)
      .attr("y2", 10)
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);
    svg
      .append("text")
      .attr("x", lambdaX / 2)
      .attr("y", 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#f59e0b")
      .style("font-size", "9px")
      .style("font-family", "'IBM Plex Mono', monospace")
      .text(`λ = ${lambda.toFixed(2)}m`);

    const animate = () => {
      if (!pauseRef.current) {
        const pts1 = xArr.map((x) => ({
          x,
          y: amp * Math.sin(k * x - omega * tRef.current),
        }));
        const pts2 = xArr.map((x) => ({
          x,
          y: amp * Math.sin(k * x - omega * tRef.current + Math.PI / 2),
        }));
        path1.attr("d", line(pts1));
        if (showRef) path2.attr("d", line(pts2));
        else path2.attr("d", null);
        tRef.current += 0.018;
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animRef.current);
  }, [freq, amp, speed, showRef]);

  const handlePause = () => {
    pauseRef.current = !pauseRef.current;
    setPaused((p) => !p);
  };

  const wavelength = speed / freq;
  const period = 1 / freq;

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div
        className="grid grid-cols-3 gap-4 p-4 rounded-xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {[
          {
            label: "Frequency",
            unit: " Hz",
            min: 0.5,
            max: 8,
            step: 0.5,
            val: freq,
            set: (v) => {
              setFreq(v);
              onVariableChange({
                frequency: v,
                amplitude: amp,
                velocity: speed,
              });
            },
            color: "#22d3ee",
          },
          {
            label: "Amplitude",
            unit: " m",
            min: 0.2,
            max: 3,
            step: 0.1,
            val: amp,
            set: (v) => {
              setAmp(v);
              onVariableChange({
                frequency: freq,
                amplitude: v,
                velocity: speed,
              });
            },
            color: "#f59e0b",
          },
          {
            label: "Wave Speed",
            unit: " m/s",
            min: 1,
            max: 16,
            step: 1,
            val: speed,
            set: (v) => {
              setSpeed(v);
              onVariableChange({
                frequency: freq,
                amplitude: amp,
                velocity: v,
              });
            },
            color: "#a78bfa",
          },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-3)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {s.label}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: s.color,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 500,
                }}
              >
                {s.val}
                {s.unit}
              </span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.val}
              onChange={(e) => s.set(+e.target.value)}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handlePause}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all hover:scale-[1.02]"
          style={{
            background: paused
              ? "rgba(74,222,128,0.1)"
              : "rgba(248,113,113,0.1)",
            border: `1px solid ${paused ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
            color: paused ? "#4ade80" : "#f87171",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {paused ? "▶  Resume" : "⏸  Pause"}
        </button>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setShowRef((r) => !r)}
            className="w-9 h-5 rounded-full transition-colors relative flex items-center"
            style={{
              background: showRef ? "rgba(167,139,250,0.4)" : "var(--border)",
            }}
          >
            <span
              className="absolute w-3.5 h-3.5 rounded-full bg-white transition-all"
              style={{ left: showRef ? "18px" : "3px", top: "3px" }}
            />
          </div>
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-3)",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            90° ref wave
          </span>
        </label>
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        {[
          { color: "#22d3ee", label: "Wave (primary)", solid: true },
          { color: "#a78bfa", label: "Wave (90° shifted)", solid: false },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <svg width="24" height="10" viewBox="0 0 24 10">
              <line
                x1="0"
                y1="5"
                x2="24"
                y2="5"
                stroke={l.color}
                strokeWidth="2"
                strokeDasharray={l.solid ? "none" : "4 3"}
              />
            </svg>
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-3)",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {l.label}
            </span>
          </div>
        ))}
      </div>

      <svg
        ref={svgRef}
        className="w-full rounded-xl"
        style={{
          height: 300,
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      />
    </div>
  );
}
