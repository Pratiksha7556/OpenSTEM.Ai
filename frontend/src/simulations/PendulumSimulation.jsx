import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";

const PendulumSimulation = forwardRef(function PendulumSimulation(
  { data, variables, voicePlaying },
  ref,
) {
  const canvasRef = useRef();
  const animRef = useRef();
  const stateRef = useRef({ t: 0, running: true });
  const [liveData, setLiveData] = useState({
    theta: 0,
    height: 0,
    velocity: 0,
    period: 0,
  });

  const length = parseFloat(variables?.length || 1);
  const ampDeg = parseFloat(variables?.amplitude || 15);
  const g = 9.8;
  const omega = Math.sqrt(g / length);
  const period = ((2 * Math.PI) / omega).toFixed(2);
  const stats = data?.stats || {};

  // Stop/start animation based on voice
  useEffect(() => {
    stateRef.current.running = voicePlaying !== false;
  }, [voicePlaying]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      stateRef.current.t = 0;
    },
    pause: () => {
      stateRef.current.running = false;
    },
    play: () => {
      stateRef.current.running = true;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    stateRef.current.t = 0;
    stateRef.current.running = true;

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = 420;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");

      if (stateRef.current.running) stateRef.current.t += 0.025;

      const t = stateRef.current.t;
      const amp = (ampDeg * Math.PI) / 180;
      const theta = amp * Math.cos(omega * t);
      const SCALE = Math.min((H - 120) / (length + 0.2), 180);
      const pivotX = W / 2;
      const pivotY = 70;

      const bx = pivotX + SCALE * length * Math.sin(theta);
      const by = pivotY + SCALE * length * Math.cos(theta);

      // height of bob from lowest point
      const heightFromBottom = length * (1 - Math.cos(theta));
      // velocity at this point
      const velocity =
        Math.sqrt(2 * g * (length - length * Math.cos(theta) + 0.0001)) *
        (theta > 0 ? -1 : 1);

      // Update live readout every 3 frames
      if (Math.round(t * 40) % 3 === 0) {
        setLiveData({
          theta: ((theta * 180) / Math.PI).toFixed(1),
          height: heightFromBottom.toFixed(3),
          velocity: Math.abs(velocity).toFixed(2),
          period,
        });
      }

      // ── Draw ──────────────────────────────────
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "#0c1118";
      ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = "rgba(0,212,255,.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // ── Equilibrium dashed line ──
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(255,255,255,.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, pivotY + SCALE * length + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Arc (swing range) ──
      ctx.beginPath();
      ctx.arc(
        pivotX,
        pivotY,
        SCALE * length,
        Math.PI / 2 - amp,
        Math.PI / 2 + amp,
      );
      ctx.strokeStyle = "rgba(0,212,255,.12)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // ── Height indicator line (from bob to lowest point) ──
      const lowestY = pivotY + SCALE * length;
      if (Math.abs(theta) > 0.01) {
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = "rgba(245,166,35,.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx, lowestY);
        ctx.stroke();
        ctx.setLineDash([]);

        // height label on the line
        const midY = (by + lowestY) / 2;
        ctx.fillStyle = "rgba(245,166,35,.9)";
        ctx.font = "bold 11px JetBrains Mono, monospace";
        ctx.fillText(`h = ${heightFromBottom.toFixed(3)} m`, bx + 8, midY);
      }

      // ── Length indicator ──
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = "rgba(0,212,255,.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pivotX - 30, pivotY);
      ctx.lineTo(pivotX - 30, lowestY);
      ctx.stroke();
      ctx.setLineDash([]);
      // arrows
      ctx.fillStyle = "rgba(0,212,255,.6)";
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.fillText(`L = ${length} m`, pivotX - 68, (pivotY + lowestY) / 2 + 4);

      // ── Trail ──
      for (let i = 1; i <= 25; i++) {
        const tp = t - i * 0.025;
        const th = amp * Math.cos(omega * tp);
        const tx = pivotX + SCALE * length * Math.sin(th);
        const ty = pivotY + SCALE * length * Math.cos(th);
        const alpha = (1 - i / 25) * 0.25;
        ctx.beginPath();
        ctx.arc(tx, ty, 6 * (1 - i / 25), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${alpha})`;
        ctx.fill();
      }

      // ── Support bar ──
      ctx.fillStyle = "#1d2d3f";
      ctx.beginPath();
      ctx.roundRect(pivotX - 50, pivotY - 12, 100, 12, 4);
      ctx.fill();
      ctx.strokeStyle = "#2d4a63";
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── String ──
      const strGrad = ctx.createLinearGradient(pivotX, pivotY, bx, by);
      strGrad.addColorStop(0, "rgba(139,168,196,.8)");
      strGrad.addColorStop(1, "rgba(139,168,196,.3)");
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = strGrad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── Pivot ──
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#8ba0b8";
      ctx.fill();

      // ── Bob ──
      const ballGrad = ctx.createRadialGradient(bx - 4, by - 4, 1, bx, by, 14);
      ballGrad.addColorStop(0, "#7dd3fc");
      ballGrad.addColorStop(0.5, "#0ea5e9");
      ballGrad.addColorStop(1, "#0369a1");
      ctx.beginPath();
      ctx.arc(bx, by, 14, 0, Math.PI * 2);
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(14,165,233,.8)";
      ctx.fillStyle = ballGrad;
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── Velocity arrow at bob ──
      const vx_arrow = Math.cos(theta) * (theta > 0 ? -1 : 1);
      const vy_arrow = -Math.sin(theta) * (theta > 0 ? -1 : 1);
      const vMag = Math.abs(velocity);
      if (vMag > 0.05) {
        const arrowLen = Math.min(vMag * 15, 40);
        const ax = bx + vx_arrow * arrowLen;
        const ay = by + vy_arrow * arrowLen;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(ax, ay);
        ctx.strokeStyle = "rgba(46,204,113,.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = "10px JetBrains Mono, monospace";
        ctx.fillStyle = "rgba(46,204,113,.8)";
        ctx.fillText(`v=${Math.abs(velocity).toFixed(2)}`, ax + 4, ay);
      }

      // ── Status strip (when paused) ──
      if (!stateRef.current.running) {
        ctx.fillStyle = "rgba(0,0,0,.5)";
        ctx.fillRect(0, H / 2 - 20, W, 40);
        ctx.fillStyle = "rgba(255,255,255,.6)";
        ctx.font = "bold 13px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("⏸ Paused — Voice stopped", W / 2, H / 2 + 5);
        ctx.textAlign = "left";
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [length, ampDeg]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: 420,
        display: "block",
        borderRadius: "16px",
        border: "1px solid var(--border)",
      }}
    />
  );
});

export default PendulumSimulation;
