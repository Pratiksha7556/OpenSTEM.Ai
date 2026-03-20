import { useEffect, useRef, forwardRef, useState } from 'react'

const ConicSectionsSimulation = forwardRef(function ConicSectionsSimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)
  const [type, setType] = useState('parabola')
  const [a, setA] = useState(2)
  const [b, setB] = useState(1.5)

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current); tRef.current = 0

    const draw = () => {
      const W = cv.offsetWidth, H = 420; cv.width = W; cv.height = H
      const ctx = cv.getContext('2d')
      const dk  = matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle = dk ? '#0a0d14' : '#f8f8f6'; ctx.fillRect(0, 0, W, H)

      const scale = 45, ox = W*0.38, oy = H/2

      // Grid
      ctx.strokeStyle = dk?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)'; ctx.lineWidth=1
      for (let gx=-7;gx<=7;gx++) { ctx.beginPath();ctx.moveTo(ox+gx*scale,0);ctx.lineTo(ox+gx*scale,H);ctx.stroke() }
      for (let gy=-5;gy<=5;gy++) { ctx.beginPath();ctx.moveTo(0,oy+gy*scale);ctx.lineTo(W,oy+gy*scale);ctx.stroke() }

      // Axes
      ctx.strokeStyle=dk?'rgba(255,255,255,.2)':'rgba(0,0,0,.2)'; ctx.lineWidth=1.5
      ctx.beginPath();ctx.moveTo(ox-7*scale,oy);ctx.lineTo(ox+7*scale,oy);ctx.stroke()
      ctx.beginPath();ctx.moveTo(ox,oy-5*scale);ctx.lineTo(ox,oy+5*scale);ctx.stroke()
      ctx.font='10px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.25)':'rgba(0,0,0,.2)'
      for (let i=-6;i<=6;i++) { if(i!==0){ctx.textAlign='center';ctx.fillText(i,ox+i*scale,oy+12)} }
      ctx.textAlign='left'

      // Animated highlight point
      const t = tRef.current
      let px2, py2, info = ''

      ctx.lineWidth = 2.5

      if (type === 'parabola') {
        // y² = 4ax  (horizontal parabola)
        const p4a = 4*a
        ctx.beginPath()
        for (let py=-5;py<=5;py+=0.02) {
          const px = (py*py*scale*scale)/(p4a*scale)
          if (Math.abs(px) > 6*scale) continue
          const sx=ox+px, sy=oy-py*scale
          Math.abs(py)<0.02 ? ctx.moveTo(sx,sy) : ctx.lineTo(sx,sy)
        }
        ctx.strokeStyle='#00d4ff'; ctx.stroke()
        // Focus
        ctx.beginPath();ctx.arc(ox+a*scale,oy,5,0,2*Math.PI)
        ctx.fillStyle='rgba(255,100,80,.8)';ctx.fill()
        ctx.font='10px monospace';ctx.fillStyle='rgba(255,100,80,.8)'
        ctx.fillText(`F(${a},0)`,ox+a*scale+6,oy-8)
        // Directrix
        ctx.beginPath();ctx.moveTo(ox-a*scale,oy-4*scale);ctx.lineTo(ox-a*scale,oy+4*scale)
        ctx.strokeStyle='rgba(245,166,35,.5)';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([])
        ctx.fillStyle='rgba(245,166,35,.7)';ctx.fillText(`x=−${a}`,ox-a*scale+4,oy-3*scale)
        // Moving point
        const animY = 3*Math.sin(t*0.04)
        px2 = ox+(animY*animY*scale)/(p4a)
        py2 = oy-animY*scale
        info = `y² = 4×${a}×x = ${p4a}x`
        info += `\nVertex:(0,0)  Focus:(${a},0)  Directrix: x=−${a}`
        info += `\nPoint:(${(animY**2/p4a).toFixed(2)},${animY.toFixed(2)})`

      } else if (type === 'ellipse') {
        // x²/a² + y²/b² = 1
        ctx.beginPath()
        for (let angle=0;angle<=2*Math.PI+0.01;angle+=0.02) {
          const x=a*Math.cos(angle), y=b*Math.sin(angle)
          const sx=ox+x*scale, sy=oy-y*scale
          angle<0.02?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy)
        }
        ctx.strokeStyle='#2ecc71'; ctx.stroke()
        const c=Math.sqrt(Math.abs(a*a-b*b))
        const isHoriz = a>=b
        const f1x=isHoriz?c:0, f1y=isHoriz?0:c, f2x=isHoriz?-c:0, f2y=isHoriz?0:-c
        // Foci
        [[f1x,f1y],[f2x,f2y]].forEach(([fx,fy])=>{
          ctx.beginPath();ctx.arc(ox+fx*scale,oy-fy*scale,5,0,2*Math.PI)
          ctx.fillStyle='rgba(255,100,80,.8)';ctx.fill()
        })
        ctx.font='10px monospace';ctx.fillStyle='rgba(255,100,80,.8)'
        ctx.fillText(`F₁(${f1x.toFixed(1)},0)`,ox+f1x*scale+6,oy-8)
        ctx.fillText(`F₂(${f2x.toFixed(1)},0)`,ox+f2x*scale+6,oy+14)
        // Moving point
        const animA = t*0.04
        px2=ox+a*Math.cos(animA)*scale; py2=oy-b*Math.sin(animA)*scale
        info = `x²/${a}² + y²/${b}² = 1`
        info += `\na=${a}, b=${b}, c=${c.toFixed(2)}`
        info += `\nEccentricity e=${(c/Math.max(a,b)).toFixed(3)}`

      } else if (type === 'hyperbola') {
        // x²/a² − y²/b² = 1
        const drawBranch = (sgn) => {
          ctx.beginPath()
          for (let t2=-2.5;t2<=2.5;t2+=0.04) {
            const x=a*Math.cosh(t2)*sgn, y=b*Math.sinh(t2)
            if (Math.abs(x)>7||Math.abs(y)>5) continue
            const sx=ox+x*scale, sy=oy-y*scale
            Math.abs(t2+2.5)<0.05?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy)
          }
          ctx.strokeStyle='#9b59b6'; ctx.stroke()
        }
        drawBranch(1); drawBranch(-1)
        // Asymptotes
        const slope=b/a
        ctx.setLineDash([4,4])
        ctx.beginPath();ctx.moveTo(ox-6*scale,oy+6*slope*scale);ctx.lineTo(ox+6*scale,oy-6*slope*scale)
        ctx.strokeStyle='rgba(155,89,182,.4)';ctx.lineWidth=1;ctx.stroke()
        ctx.beginPath();ctx.moveTo(ox-6*scale,oy-6*slope*scale);ctx.lineTo(ox+6*scale,oy+6*slope*scale)
        ctx.stroke();ctx.setLineDash([])
        ctx.font='10px monospace';ctx.fillStyle='rgba(155,89,182,.5)'
        ctx.fillText(`y=±(${b}/${a})x`,ox+3*scale,oy-3*slope*scale)
        const c=Math.sqrt(a*a+b*b)
        px2=ox+a*Math.cosh(t*0.04)*scale; py2=oy-b*Math.sinh(t*0.04)*scale
        info = `x²/${a}² − y²/${b}² = 1`
        info += `\na=${a}, b=${b}, c=${c.toFixed(2)}`

      } else { // circle
        ctx.beginPath();ctx.arc(ox,oy,a*scale,0,2*Math.PI)
        ctx.strokeStyle='#f5a623';ctx.stroke()
        px2=ox+a*Math.cos(t*0.04)*scale; py2=oy-a*Math.sin(t*0.04)*scale
        info = `x² + y² = ${a}²\nRadius = ${a}\nArea = π×${a}² = ${(Math.PI*a*a).toFixed(2)}`
      }

      // Animated point
      if (isFinite(px2)&&isFinite(py2)) {
        ctx.beginPath();ctx.arc(px2,py2,7,0,2*Math.PI)
        ctx.shadowBlur=12;ctx.shadowColor='rgba(255,220,0,.8)'
        ctx.fillStyle='#ffe040';ctx.fill();ctx.shadowBlur=0
      }

      // ── Right panel: properties ──
      const rx=W*0.72, ry=40
      ctx.font='bold 13px monospace'; ctx.fillStyle=dk?'#fff':'#000'
      ctx.fillText(type.charAt(0).toUpperCase()+type.slice(1),rx,ry)
      const lines=info.split('\n')
      ctx.font='11px monospace'
      lines.forEach((l,i)=>{
        ctx.fillStyle=dk?'rgba(255,255,255,.5)':'rgba(0,0,0,.45)'
        ctx.fillText(l,rx,ry+20+i*18)
      })

      if (runRef.current) tRef.current += 0.5
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [type, a, b])

  return (
    <div>
      <div className="flex gap-2 items-center mb-3 flex-wrap">
        {['parabola','ellipse','hyperbola','circle'].map(t=>(
          <button key={t} onClick={()=>{setType(t);tRef.current=0}}
            style={{ padding:'4px 12px', borderRadius:8, fontSize:12, cursor:'pointer',
              textTransform:'capitalize',
              background:type===t?'rgba(99,102,241,.18)':'var(--surface)',
              border:`1px solid ${type===t?'rgba(99,102,241,.45)':'var(--border)'}`,
              color:type===t?'#818cf8':'var(--t3)' }}>
            {t}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-2">
          <span style={{ fontSize:11, color:'var(--t3)' }}>a:</span>
          <input type="range" min="0.5" max="4" step="0.5" value={a}
            onChange={e=>setA(+e.target.value)} style={{ width:60 }}/>
          <code style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--cyan)', minWidth:24 }}>{a}</code>
          {type!=='circle' && type!=='parabola' && <>
            <span style={{ fontSize:11, color:'var(--t3)' }}>b:</span>
            <input type="range" min="0.5" max="4" step="0.5" value={b}
              onChange={e=>setB(+e.target.value)} style={{ width:60 }}/>
            <code style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--cyan)', minWidth:24 }}>{b}</code>
          </>}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ width:'100%', height:420, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
    </div>
  )
})

export default ConicSectionsSimulation
