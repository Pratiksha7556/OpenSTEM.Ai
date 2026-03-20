import { useEffect, useRef, forwardRef, useState } from 'react'

const FunctionPlotSimulation = forwardRef(function FunctionPlotSimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)
  const [expr, setExpr] = useState(variables?.expression || 'x*x - 4')
  const [showDeriv, setShowDeriv] = useState(true)
  const [traceX, setTraceX] = useState(null)

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  const evalFn = (fn, x) => {
    try {
      const f = fn
        .replace(/sin/g,'Math.sin').replace(/cos/g,'Math.cos').replace(/tan/g,'Math.tan')
        .replace(/sqrt/g,'Math.sqrt').replace(/abs/g,'Math.abs').replace(/log/g,'Math.log')
        .replace(/exp/g,'Math.exp').replace(/\^/g,'**').replace(/π/g,'Math.PI')
        .replace(/e(?![A-Za-z])/g,'Math.E')
      // eslint-disable-next-line no-new-func
      return Function('x', `"use strict"; return (${f})`)(x)
    } catch { return NaN }
  }

  const derivative = (fn, x, h = 0.001) => (evalFn(fn, x + h) - evalFn(fn, x - h)) / (2 * h)

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current)

    const draw = () => {
      const W = cv.offsetWidth, H = 420; cv.width = W; cv.height = H
      const ctx = cv.getContext('2d')
      const dk  = matchMedia('(prefers-color-scheme: dark)').matches

      ctx.fillStyle = dk ? '#0a0d14' : '#f8f8f6'
      ctx.fillRect(0, 0, W, H)

      // ── Grid ──
      const xRange = 10, yRange = 8
      const toPx = (x, y) => [W/2 + x*(W/xRange/2), H/2 - y*(H/yRange/2)]

      ctx.strokeStyle = dk?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'; ctx.lineWidth=1
      for (let gx=-5;gx<=5;gx++) {
        const [px] = toPx(gx,0); ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,H); ctx.stroke()
      }
      for (let gy=-4;gy<=4;gy++) {
        const [,py] = toPx(0,gy); ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(W,py); ctx.stroke()
      }

      // ── Axes ──
      ctx.strokeStyle = dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.25)'; ctx.lineWidth=1.5
      const [ax0,ay0]=toPx(-5,0), [ax1]=toPx(5,0)
      ctx.beginPath(); ctx.moveTo(ax0,ay0); ctx.lineTo(ax1,ay0); ctx.stroke()
      const [bx,by0]=toPx(0,-4), [,by1]=toPx(0,4)
      ctx.beginPath(); ctx.moveTo(bx,by0); ctx.lineTo(bx,by1); ctx.stroke()

      // Axis labels
      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.3)'
      for (let gx=-4;gx<=4;gx++) {
        if (gx===0) continue
        const [px,py]=toPx(gx,0); ctx.fillText(gx, px-4, py+14)
      }
      ctx.fillText('x', W/2+W/xRange/2*5+6, H/2+4)
      ctx.fillText('y', W/2-8, H/2-H/yRange/2*4-6)

      // ── Function curve ──
      let firstF=true
      ctx.beginPath()
      for (let px=0;px<W;px++) {
        const x = (px-W/2)/(W/xRange/2)
        const y = evalFn(expr, x)
        if (!isFinite(y)||Math.abs(y)>20) { firstF=true; continue }
        const [,py]=toPx(x,y)
        if (firstF) { ctx.moveTo(px,py); firstF=false } else ctx.lineTo(px,py)
      }
      ctx.strokeStyle='#00d4ff'; ctx.lineWidth=2.5; ctx.stroke()

      // ── Derivative curve ──
      if (showDeriv) {
        let firstD=true; ctx.beginPath()
        for (let px=0;px<W;px++) {
          const x = (px-W/2)/(W/xRange/2)
          const dy = derivative(expr, x)
          if (!isFinite(dy)||Math.abs(dy)>20) { firstD=true; continue }
          const [,py]=toPx(x,dy)
          if (firstD) { ctx.moveTo(px,py); firstD=false } else ctx.lineTo(px,py)
        }
        ctx.strokeStyle='rgba(245,166,35,.7)'; ctx.lineWidth=1.5; ctx.stroke()
      }

      // ── Moving trace point ──
      const animX = runRef.current ? 4*Math.sin(tRef.current*0.6)-0.5 : (traceX||0)
      const animY = evalFn(expr, animX)
      const dY    = derivative(expr, animX)
      if (isFinite(animY)) {
        const [apx,apy] = toPx(animX,animY)
        // vertical dashed line
        ctx.setLineDash([3,3])
        ctx.beginPath(); ctx.moveTo(apx,apy); ctx.lineTo(apx,ay0)
        ctx.strokeStyle='rgba(0,212,255,.3)'; ctx.lineWidth=1; ctx.stroke()
        ctx.setLineDash([])
        // dot on curve
        ctx.beginPath(); ctx.arc(apx,apy,6,0,2*Math.PI)
        ctx.shadowBlur=14; ctx.shadowColor='rgba(0,212,255,.8)'
        ctx.fillStyle='#00d4ff'; ctx.fill(); ctx.shadowBlur=0
        // tangent line
        if (isFinite(dY) && showDeriv) {
          const tx0=animX-1, tx1=animX+1
          const ty0=animY+dY*(tx0-animX), ty1=animY+dY*(tx1-animX)
          const [tp0x,tp0y]=toPx(tx0,ty0), [tp1x,tp1y]=toPx(tx1,ty1)
          ctx.beginPath(); ctx.moveTo(tp0x,tp0y); ctx.lineTo(tp1x,tp1y)
          ctx.strokeStyle='rgba(245,166,35,.8)'; ctx.lineWidth=1.5; ctx.stroke()
        }
        // readout
        ctx.font='bold 12px monospace'
        ctx.fillStyle='rgba(0,212,255,.9)'
        ctx.fillText(`x = ${animX.toFixed(2)}`, apx+8, apy-18)
        ctx.fillText(`f(x) = ${animY.toFixed(3)}`, apx+8, apy-4)
        if (isFinite(dY) && showDeriv) {
          ctx.fillStyle='rgba(245,166,35,.9)'
          ctx.fillText(`f'(x) = ${dY.toFixed(3)}`, apx+8, apy+12)
        }
      }

      // ── Roots (zero crossings) ──
      const roots = []
      for (let xi=-4.9;xi<5;xi+=0.01) {
        const y0=evalFn(expr,xi), y1=evalFn(expr,xi+0.01)
        if (isFinite(y0)&&isFinite(y1)&&y0*y1<0) {
          const xr = xi - y0*(0.01/(y1-y0))
          roots.push(xr)
          const [rpx,rpy]=toPx(xr,0)
          ctx.beginPath(); ctx.arc(rpx,rpy,5,0,2*Math.PI)
          ctx.fillStyle='rgba(46,204,113,.9)'; ctx.fill()
          ctx.font='10px monospace'; ctx.fillStyle='rgba(46,204,113,.8)'
          ctx.fillText(`x=${xr.toFixed(2)}`,rpx+6,rpy-8)
        }
      }

      // ── Legend ──
      ctx.font='11px monospace'
      ctx.fillStyle='#00d4ff';          ctx.fillText(`f(x) = ${expr}`,12,18)
      if (showDeriv) {
        ctx.fillStyle='rgba(245,166,35,.8)'; ctx.fillText(`f'(x) = derivative`,12,34)
      }

      if (runRef.current) tRef.current += 0.02
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [expr, showDeriv])

  return (
    <div>
      <div className="flex gap-2 items-center mb-3 flex-wrap">
        <input
          value={expr} onChange={e=>setExpr(e.target.value)}
          placeholder="Enter function e.g. x^2-4, sin(x), x^3-3*x"
          style={{ flex:1, padding:'7px 12px', background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:8, color:'var(--t1)', fontSize:13, fontFamily:'var(--mono)', outline:'none', minWidth:180 }}
        />
        <button onClick={()=>setShowDeriv(s=>!s)}
          style={{ padding:'7px 12px', borderRadius:8, fontSize:12, cursor:'pointer',
            background:showDeriv?'rgba(245,166,35,.15)':'var(--surface)',
            border:`1px solid ${showDeriv?'rgba(245,166,35,.4)':'var(--border)'}`,
            color:showDeriv?'#f5a623':'var(--t3)' }}>
          {showDeriv?'Hide':'Show'} f'(x)
        </button>
      </div>
      <canvas ref={canvasRef} style={{ width:'100%', height:420, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
    </div>
  )
})

export default FunctionPlotSimulation
