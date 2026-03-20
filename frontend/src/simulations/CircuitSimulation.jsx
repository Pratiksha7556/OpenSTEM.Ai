import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

function CircuitDiagram({ voltage, resistance, current }) {
  const W = 280,
    H = 160;
  const c = { wire: "#243447", v: "#f59e0b", r: "#22d3ee", label: "#8ba0b8" };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{
        width: "100%",
        height: H,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
      }}
    >
      {/* Wires */}
      <rect
        x={40}
        y={20}
        width={200}
        height={120}
        rx={4}
        fill="none"
        stroke={c.wire}
        strokeWidth={2}
      />
      {/* Battery */}
      <rect
        x={28}
        y={60}
        width={24}
        height={40}
        rx={3}
        fill="rgba(245,158,11,0.08)"
        stroke={c.v}
        strokeWidth={1.5}
      />
      <text
        x={40}
        y={77}
        textAnchor="middle"
        fill={c.v}
        style={{ fontSize: "8px", fontFamily: "'IBM Plex Mono'" }}
      >
        +
      </text>
      <text
        x={40}
        y={93}
        textAnchor="middle"
        fill={c.v}
        style={{ fontSize: "8px", fontFamily: "'IBM Plex Mono'" }}
      >
        −
      </text>
      <text
        x={40}
        y={112}
        textAnchor="middle"
        fill={c.v}
        style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono'" }}
      >
        {voltage}V
      </text>
      {/* Resistor */}
      <rect
        x={175}
        y={60}
        width={60}
        height={40}
        rx={3}
        fill="rgba(34,211,238,0.06)"
        stroke={c.r}
        strokeWidth={1.5}
      />
      <text
        x={205}
        y={85}
        textAnchor="middle"
        fill={c.r}
        style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono'" }}
      >
        {resistance}Ω
      </text>
      {/* Current arrow */}
      <defs>
        <marker
          id="arr"
          viewBox="0 0 6 6"
          refX="3"
          refY="3"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="#4ade80" />
        </marker>
      </defs>
      <line
        x1={140}
        y1={20}
        x2={170}
        y2={20}
        stroke="#4ade80"
        strokeWidth={1.5}
        markerEnd="url(#arr)"
      />
      <text
        x={155}
        y={15}
        textAnchor="middle"
        fill="#4ade80"
        style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono'" }}
      >
        I={current}A
      </text>
      {/* Labels */}
      <text
        x={40}
        y={155}
        textAnchor="middle"
        fill={c.label}
        style={{ fontSize: "8px", fontFamily: "'IBM Plex Mono'" }}
      >
        Battery
      </text>
      <text
        x={205}
        y={155}
        textAnchor="middle"
        fill={c.label}
        style={{ fontSize: "8px", fontFamily: "'IBM Plex Mono'" }}
      >
        Resistor
      </text>
    </svg>
  );
}

export default function CircuitSimulation({
  data,
  variables,
  onVariableChange,
}) {
  const svgRef = useRef();
  const [voltage, setVoltage] = useState(variables?.voltage || 12);
  const [resistance, setResistance] = useState(variables?.resistance || 220);

  const current = voltage / resistance;
  const power = (voltage * voltage) / resistance;
  const energy = power; // watts

  const buildCurve = useCallback((v, rMax) => {
    return d3.range(10, rMax * 3, (rMax * 3) / 100).map((r) => ({
      r,
      i: v / r,
      p: (v * v) / r,
    }));
  }, []);

  const draw = useCallback(
    (v, r) => {
      const el = svgRef.current;
      if (!el) return;
      d3.select(el).selectAll("*").remove();

      const W = el.clientWidth || 580;
      const H = 280;
      const m = { top: 20, right: 24, bottom: 44, left: 56 };
      const iw = W - m.left - m.right;
      const ih = H - m.top - m.bottom;

      const curve = buildCurve(v, r);
      const svg = d3
        .select(el)
        .attr("viewBox", `0 0 ${W} ${H}`)
        .append("g")
        .attr("transform", `translate(${m.left},${m.top})`);

      const xs = d3
        .scaleLinear()
        .domain([0, d3.max(curve, (d) => d.r)])
        .range([0, iw]);
      const ys = d3
        .scaleLinear()
        .domain([0, d3.max(curve, (d) => d.i) * 1.1])
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
        .text("Resistance R (Ω)");
      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -46)
        .attr("x", -ih / 2)
        .attr("text-anchor", "middle")
        .style("fill", labelStyle.fill)
        .style("font-size", labelStyle.fontSize)
        .style("font-family", labelStyle.fontFamily)
        .text("Current I (A)");

      // Area fill under curve
      const area = d3
        .area()
        .x((d) => xs(d.r))
        .y0(ih)
        .y1((d) => ys(d.i))
        .curve(d3.curveCatmullRom);
      svg
        .append("path")
        .datum(curve)
        .attr("fill", "url(#areaGrad)")
        .attr("d", area)
        .attr("opacity", 0.15);

      svg
        .append("defs")
        .append("linearGradient")
        .attr("id", "areaGrad")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .selectAll("stop")
        .data([
          { offset: "0%", color: "#22d3ee", opacity: 0.5 },
          { offset: "100%", color: "#22d3ee", opacity: 0 },
        ])
        .enter()
        .append("stop")
        .attr("offset", (d) => d.offset)
        .attr("stop-color", (d) => d.color)
        .attr("stop-opacity", (d) => d.opacity);

      // IV Curve line
      const line = d3
        .line()
        .x((d) => xs(d.r))
        .y((d) => ys(d.i))
        .curve(d3.curveCatmullRom);
      const path = svg
        .append("path")
        .datum(curve)
        .attr("fill", "none")
        .attr("stroke", "#22d3ee")
        .attr("stroke-width", 2.5)
        .attr("d", line);
      const len = path.node().getTotalLength();
      path
        .attr("stroke-dasharray", len)
        .attr("stroke-dashoffset", len)
        .transition()
        .duration(800)
        .attr("stroke-dashoffset", 0);

      // Operating point
      const opR = r;
      const opI = v / opR;
      if (xs(opR) >= 0 && xs(opR) <= iw) {
        svg
          .append("line")
          .attr("x1", xs(opR))
          .attr("x2", xs(opR))
          .attr("y1", ih)
          .attr("y2", ys(opI))
          .attr("stroke", "#f87171")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4 3")
          .attr("opacity", 0.6);
        svg
          .append("line")
          .attr("x1", 0)
          .attr("x2", xs(opR))
          .attr("y1", ys(opI))
          .attr("y2", ys(opI))
          .attr("stroke", "#f87171")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4 3")
          .attr("opacity", 0.6);
        svg
          .append("circle")
          .attr("cx", xs(opR))
          .attr("cy", ys(opI))
          .attr("r", 7)
          .attr("fill", "#f87171")
          .style("filter", "drop-shadow(0 0 8px rgba(248,113,113,0.8))");
        svg
          .append("text")
          .attr("x", xs(opR) + 10)
          .attr("y", ys(opI) - 10)
          .attr("fill", "#f87171")
          .style("font-size", "10px")
          .style("font-family", "'IBM Plex Mono', monospace")
          .text(`(${opR}Ω, ${opI.toFixed(3)}A)`);
      }
    },
    [buildCurve],
  );

  useEffect(() => {
    draw(voltage, resistance);
  }, [voltage, resistance]);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div
        className="grid grid-cols-2 gap-4 p-4 rounded-xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {[
          {
            label: "Voltage",
            unit: " V",
            min: 1,
            max: 48,
            step: 1,
            val: voltage,
            set: (v) => {
              setVoltage(v);
              onVariableChange({ voltage: v, resistance });
            },
            color: "#f59e0b",
          },
          {
            label: "Resistance",
            unit: " Ω",
            min: 10,
            max: 2000,
            step: 10,
            val: resistance,
            set: (v) => {
              setResistance(v);
              onVariableChange({ voltage, resistance: v });
            },
            color: "#22d3ee",
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

      {/* Ohm's Law display */}
      <div
        className="flex items-center justify-center gap-2 p-3 rounded-xl"
        style={{
          background: "rgba(34,211,238,0.04)",
          border: "1px solid rgba(34,211,238,0.15)",
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "13px",
            color: "#22d3ee",
          }}
        >
          I = V / R = {voltage} / {resistance} ={" "}
          <strong>{current.toFixed(4)} A</strong>
        </span>
      </div>

      {/* Circuit diagram + IV chart side by side */}
      <div className="grid grid-cols-2 gap-3">
        <CircuitDiagram
          voltage={voltage}
          resistance={resistance}
          current={current.toFixed(4)}
        />
        <svg
          ref={svgRef}
          className="w-full rounded-xl"
          style={{
            height: 160,
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        />
      </div>

      {/* Full IV curve */}
      <svg ref={svgRef} className="w-full rounded-xl hidden" />
      <div>
        <p
          style={{
            fontSize: "10px",
            color: "var(--text-3)",
            fontFamily: "'IBM Plex Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "8px",
          }}
        >
          I-V Characteristic Curve
        </p>
        <svg
          ref={svgRef}
          className="w-full rounded-xl"
          style={{
            height: 280,
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        />
      </div>
    </div>
  );
}
