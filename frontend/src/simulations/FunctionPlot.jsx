import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// Safe evaluator using Function constructor for basic math expressions
function safeEval(exprRaw, xVal) {
  try {
    // Convert Python-style to JS
    const expr = exprRaw
      .replace(/\*\*/g, "**") // keep as-is, use eval
      .replace(/\bsin\b/g, "Math.sin")
      .replace(/\bcos\b/g, "Math.cos")
      .replace(/\btan\b/g, "Math.tan")
      .replace(/\bsqrt\b/g, "Math.sqrt")
      .replace(/\babs\b/g, "Math.abs")
      .replace(/\bexp\b/g, "Math.exp")
      .replace(/\blog\b/g, "Math.log")
      .replace(/\bpi\b/g, "Math.PI")
      .replace(/\be\b/g, "Math.E");
    // eslint-disable-next-line no-new-func
    return new Function("x", `return ${expr}`)(xVal);
  } catch {
    return NaN;
  }
}

function numericalDerivative(expr, x, h = 1e-5) {
  return (safeEval(expr, x + h) - safeEval(expr, x - h)) / (2 * h);
}

const PRESETS = [
  { label: "Cubic", expr: "x**3 - 3*x + 2" },
  { label: "Sine", expr: "Math.sin(x)" },
  { label: "Parabola", expr: "x**2 - 4" },
  { label: "Gaussian", expr: "Math.exp(-x**2)" },
  { label: "Rational", expr: "1/x" },
];

export default function FunctionPlot({ data, variables, onVariableChange }) {
  const svgRef = useRef();
  const [expr, setExpr] = useState(variables?.expression || "x**3 - 3*x + 2");
  const [inputVal, setInputVal] = useState(
    variables?.expression || "x**3 - 3*x + 2",
  );
  const [showDeriv, setShowDeriv] = useState(true);
  const [xRange, setXRange] = useState([-6, 6]);
  const [hoverX, setHoverX] = useState(null);
  const [stats, setStats] = useState(data?.stats || null);

  useEffect(() => {
    drawChart(expr, xRange);
  }, [expr, xRange, showDeriv]);

  const drawChart = (expression, [x0, x1]) => {
    const el = svgRef.current;
    if (!el) return;
    d3.select(el).selectAll("*").remove();

    const W = el.clientWidth || 620;
    const H = 320;
    const m = { top: 20, right: 20, bottom: 44, left: 56 };
    const iw = W - m.left - m.right;
    const ih = H - m.top - m.bottom;

    const xArr = d3.range(x0, x1 + 0.01, (x1 - x0) / 300);
    const ys_raw = xArr
      .map((x) => safeEval(expression, x))
      .filter((y) => isFinite(y));
    if (!ys_raw.length) return;

    const yMin = Math.max(d3.min(ys_raw), -50);
    const yMax = Math.min(d3.max(ys_raw), 50);
    const pad = (yMax - yMin) * 0.12 || 1;

    const xs = d3.scaleLinear().domain([x0, x1]).range([0, iw]);
    const ys = d3
      .scaleLinear()
      .domain([yMin - pad, yMax + pad])
      .range([ih, 0]);

    const svg = d3
      .select(el)
      .attr("viewBox", `0 0 ${W} ${H}`)
      .append("g")
      .attr("transform", `translate(${m.left},${m.top})`);

    // Grid
    svg
      .append("g")
      .selectAll("line")
      .data(ys.ticks(6))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", iw)
      .attr("y1", (d) => ys(d))
      .attr("y2", (d) => ys(d))
      .attr("stroke", "#1a2535")
      .attr("stroke-width", 1);
    svg
      .append("g")
      .selectAll("line")
      .data(xs.ticks(8))
      .enter()
      .append("line")
      .attr("x1", (d) => xs(d))
      .attr("x2", (d) => xs(d))
      .attr("y1", 0)
      .attr("y2", ih)
      .attr("stroke", "#1a2535")
      .attr("stroke-width", 1);

    // Axes (zero lines)
    if (ys.domain()[0] < 0 && ys.domain()[1] > 0) {
      svg
        .append("line")
        .attr("x1", 0)
        .attr("x2", iw)
        .attr("y1", ys(0))
        .attr("y2", ys(0))
        .attr("stroke", "#243447")
        .attr("stroke-width", 1.5);
    }
    if (xs.domain()[0] < 0 && xs.domain()[1] > 0) {
      svg
        .append("line")
        .attr("x1", xs(0))
        .attr("x2", xs(0))
        .attr("y1", 0)
        .attr("y2", ih)
        .attr("stroke", "#243447")
        .attr("stroke-width", 1.5);
    }

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
      .call(d3.axisBottom(xs).ticks(8))
      .call(axisStyle);
    svg.append("g").call(d3.axisLeft(ys).ticks(6)).call(axisStyle);

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
      .text("x");
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -46)
      .attr("x", -ih / 2)
      .attr("text-anchor", "middle")
      .style("fill", labelStyle.fill)
      .style("font-size", labelStyle.fontSize)
      .style("font-family", labelStyle.fontFamily)
      .text("f(x)");

    // Area fill
    const areaFn = d3
      .area()
      .defined((d) => isFinite(d.y))
      .x((d) => xs(d.x))
      .y0(ys(0))
      .y1((d) => ys(d.y))
      .curve(d3.curveCatmullRom);
    const pts = xArr
      .map((x) => ({ x, y: safeEval(expression, x) }))
      .filter((d) => isFinite(d.y) && Math.abs(d.y) < 50);
    svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "fnGrad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%")
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#f87171", opacity: 0.3 },
        { offset: "100%", color: "#f87171", opacity: 0 },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color)
      .attr("stop-opacity", (d) => d.opacity);
    svg
      .append("path")
      .datum(pts)
      .attr("fill", "url(#fnGrad)")
      .attr("d", areaFn)
      .attr("opacity", 0.4);

    // f(x) line
    const line = d3
      .line()
      .defined((d) => isFinite(d.y) && Math.abs(d.y) < 50)
      .x((d) => xs(d.x))
      .y((d) => ys(d.y))
      .curve(d3.curveCatmullRom);
    const pathEl = svg
      .append("path")
      .datum(pts)
      .attr("fill", "none")
      .attr("stroke", "#f87171")
      .attr("stroke-width", 2.5)
      .attr("d", line);
    const len = pathEl.node().getTotalLength();
    pathEl
      .attr("stroke-dasharray", len)
      .attr("stroke-dashoffset", len)
      .transition()
      .duration(900)
      .attr("stroke-dashoffset", 0);

    // f'(x) line
    if (showDeriv) {
      const dpts = xArr
        .map((x) => ({ x, y: numericalDerivative(expression, x) }))
        .filter((d) => isFinite(d.y) && Math.abs(d.y) < 50);
      svg
        .append("path")
        .datum(dpts)
        .attr("fill", "none")
        .attr("stroke", "#4ade80")
        .attr("stroke-width", 1.8)
        .attr("stroke-dasharray", "6 4")
        .attr("d", line);
    }

    // Hover overlay
    const overlay = svg
      .append("rect")
      .attr("width", iw)
      .attr("height", ih)
      .attr("fill", "transparent")
      .style("cursor", "crosshair");

    const hoverLine = svg
      .append("line")
      .attr("y1", 0)
      .attr("y2", ih)
      .attr("stroke", "#4a6278")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 3")
      .attr("opacity", 0);
    const hoverDot = svg
      .append("circle")
      .attr("r", 5)
      .attr("fill", "#f87171")
      .attr("opacity", 0);
    const hoverTip = svg
      .append("text")
      .attr("fill", "#e2eaf4")
      .style("font-size", "10px")
      .style("font-family", "'IBM Plex Mono', monospace")
      .attr("opacity", 0);

    overlay.on("mousemove", function (event) {
      const [mx] = d3.pointer(event);
      const xv = xs.invert(mx);
      const yv = safeEval(expression, xv);
      if (!isFinite(yv) || Math.abs(yv) > 50) return;
      hoverLine.attr("x1", mx).attr("x2", mx).attr("opacity", 0.5);
      hoverDot.attr("cx", mx).attr("cy", ys(yv)).attr("opacity", 1);
      const tx = mx > iw - 120 ? mx - 120 : mx + 8;
      hoverTip
        .attr("x", tx)
        .attr("y", ys(yv) - 10)
        .attr("opacity", 1)
        .text(`(${xv.toFixed(2)}, ${yv.toFixed(3)})`);
      setHoverX(xv.toFixed(3));
    });
    overlay.on("mouseleave", () => {
      hoverLine.attr("opacity", 0);
      hoverDot.attr("opacity", 0);
      hoverTip.attr("opacity", 0);
      setHoverX(null);
    });
  };

  const handlePlot = () => {
    setExpr(inputVal);
    onVariableChange({ expression: inputVal });
    setStats(data?.stats || null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: "#f87171",
              fontSize: "13px",
            }}
          >
            f(x) =
          </span>
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePlot();
            }}
            placeholder="x**3 - 3*x + 2"
            className="w-full rounded-lg py-2.5 pl-14 pr-4 text-sm outline-none transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-1)",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "13px",
            }}
          />
        </div>
        <button
          onClick={handlePlot}
          className="px-5 py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95"
          style={{
            background: "rgba(248,113,113,0.1)",
            border: "1px solid rgba(248,113,113,0.25)",
            color: "#f87171",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          Plot
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setInputVal(p.expr);
              setExpr(p.expr);
              onVariableChange({ expression: p.expr });
            }}
            className="px-2.5 py-1 rounded-md text-xs transition-all hover:scale-[1.02]"
            style={{
              background: "rgba(248,113,113,0.06)",
              border: "1px solid rgba(248,113,113,0.15)",
              color: "#f87171",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Options */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setShowDeriv((d) => !d)}
            className="w-9 h-5 rounded-full transition-colors relative flex items-center"
            style={{
              background: showDeriv ? "rgba(74,222,128,0.4)" : "var(--border)",
            }}
          >
            <span
              className="absolute w-3.5 h-3.5 rounded-full bg-white transition-all"
              style={{ left: showDeriv ? "18px" : "3px", top: "3px" }}
            />
          </div>
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-3)",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Show f'(x)
          </span>
        </label>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-3)",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            x range:
          </span>
          {[
            [-10, 10],
            [-6, 6],
            [-3, 3],
          ].map(([a, b]) => (
            <button
              key={`${a}${b}`}
              onClick={() => setXRange([a, b])}
              className="px-2 py-0.5 rounded text-xs transition-all"
              style={{
                background:
                  xRange[0] === a ? "rgba(34,211,238,0.12)" : "transparent",
                border: `1px solid ${xRange[0] === a ? "rgba(34,211,238,0.3)" : "var(--border)"}`,
                color: xRange[0] === a ? "#22d3ee" : "var(--text-3)",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "10px",
              }}
            >
              [{a},{b}]
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        {[
          { color: "#f87171", label: "f(x)", solid: true },
          { color: "#4ade80", label: "f'(x)  derivative", solid: false },
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
                strokeDasharray={l.solid ? "none" : "5 3"}
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

      {/* Chart */}
      <svg
        ref={svgRef}
        className="w-full rounded-xl"
        style={{
          height: 320,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          cursor: "crosshair",
        }}
      />

      {/* Hover readout */}
      {hoverX && (
        <div
          className="flex gap-4 px-3 py-2 rounded-lg animate-fade-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-3)",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            x = {hoverX}
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "#f87171",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            f(x) = {safeEval(expr, parseFloat(hoverX))?.toFixed(4)}
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "#4ade80",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            f'(x) = {numericalDerivative(expr, parseFloat(hoverX))?.toFixed(4)}
          </span>
        </div>
      )}

      {/* AI stats from backend */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Expression", value: stats.expression, color: "#f87171" },
            { label: "Derivative", value: stats.derivative, color: "#4ade80" },
            { label: "Integral", value: stats.integral, color: "#a78bfa" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-0.5 p-3 rounded-lg"
              style={{
                background: `${s.color}08`,
                border: `1px solid ${s.color}20`,
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--text-3)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {s.label}
              </span>
              <span
                className="truncate"
                style={{
                  fontSize: "12px",
                  color: s.color,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 500,
                }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
