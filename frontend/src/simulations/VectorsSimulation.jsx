import { useEffect, useRef, forwardRef } from 'react'

const VectorsSimulation = forwardRef(function VectorsSimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)

  const ax = parseFloat(variables?.ax || 3), ay = parseFloat(variables?.ay || 2)
  const bx = parseFloat(variables?.bx || 1), by = parseFloat(variables?.by || 4)

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  const drawArrow = (ctx, x0, y0, x1, y1, color, lw=2.5) => {
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1)
    ctx.strokeStyle=color; ctx.lineWidth=lw; ctx.stroke()
    const angle=Math.atan2(y1-y0,x1-x0)
    ctx.beginPath()
    ctx.moveTo(x1,y1)
    ctx.lineTo(x1-12*Math.cos(angle-0.3),y1-12*Math.sin(angle-0.3))
    ctx.lineTo(x1-12*Math.cos(angle+0.3),y1-12*Math.sin(angle+0.3))
    ctx.closePath(); ctx.fillStyle=color; ctx.fill()
  }

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current); tRef.current = 0

    const draw = () => {
      const W=cv.offsetWidth, H=420; cv.width=W; cv.height=H
      const ctx=cv.getContext('2d')
      const dk=matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle=dk?'#0a0d14':'#f8f8f6'; ctx.fillRect(0,0,W,H)

      const scale=40, ox=W*0.28, oy=H/2

      // Animate second vector angle
      const animBx = runRef.current ? 3*Math.cos(tRef.current*0.5+Math.PI/4) : bx
      const animBy = runRef.current ? 3*Math.sin(tRef.current*0.5+Math.PI/4) : by

      // Grid
      ctx.strokeStyle=dk?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)'; ctx.lineWidth=1
      for (let gx=-6;gx<=6;gx++) {
        ctx.beginPath(); ctx.moveTo(ox+gx*scale,oy-5*scale); ctx.lineTo(ox+gx*scale,oy+5*scale); ctx.stroke()
      }
      for (let gy=-5;gy<=5;gy++) {
        ctx.beginPath(); ctx.moveTo(ox-6*scale,oy+gy*scale); ctx.lineTo(ox+6*scale,oy+gy*scale); ctx.stroke()
      }
      // Axes
      ctx.strokeStyle=dk?'rgba(255,255,255,.2)':'rgba(0,0,0,.2)'; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.moveTo(ox-6*scale,oy); ctx.lineTo(ox+6*scale,oy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(ox,oy-5*scale); ctx.lineTo(ox,oy+5*scale); ctx.stroke()
      ctx.font='10px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.25)':'rgba(0,0,0,.25)'
      for (let i=-5;i<=5;i++) { if(i!==0) { ctx.textAlign='center'; ctx.fillText(i,ox+i*scale,oy+14); ctx.fillText(-i,ox-4,oy-i*scale+4) } }

      // ── Vector A ──
      const ax2=ox+ax*scale, ay2=oy-ay*scale
      drawArrow(ctx, ox, oy, ax2, ay2, '#00d4ff')
      ctx.shadowBlur=12; ctx.shadowColor='rgba(0,212,255,.6)'
      ctx.beginPath(); ctx.arc(ax2,ay2,5,0,2*Math.PI); ctx.fillStyle='#00d4ff'; ctx.fill(); ctx.shadowBlur=0
      ctx.font='bold 13px monospace'; ctx.fillStyle='#00d4ff'; ctx.textAlign='left'
      ctx.fillText(`A(${ax},${ay})`,ax2+8,ay2-8)

      // ── Vector B (animated) ──
      const bx2=ox+animBx*scale, by2=oy-animBy*scale
      drawArrow(ctx, ox, oy, bx2, by2, '#f5a623')
      ctx.font='bold 13px monospace'; ctx.fillStyle='#f5a623'
      ctx.fillText(`B(${animBx.toFixed(1)},${animBy.toFixed(1)})`,bx2+8,by2-8)

      // ── Resultant A+B ──
      const rx=ox+(ax+animBx)*scale, ry=oy-(ay+animBy)*scale
      if (isFinite(rx)&&isFinite(ry)) {
        drawArrow(ctx, ox, oy, rx, ry, 'rgba(46,204,113,.9)', 2)
        ctx.setLineDash([3,3])
        ctx.beginPath(); ctx.moveTo(ax2,ay2); ctx.lineTo(rx,ry)
        ctx.strokeStyle='rgba(245,166,35,.4)'; ctx.lineWidth=1; ctx.stroke()
        ctx.beginPath(); ctx.moveTo(bx2,by2); ctx.lineTo(rx,ry)
        ctx.strokeStyle='rgba(0,212,255,.4)'; ctx.lineWidth=1; ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle='rgba(46,204,113,.9)'; ctx.font='bold 12px monospace'
        ctx.fillText(`R(${(ax+animBx).toFixed(1)},${(ay+animBy).toFixed(1)})`,rx+8,ry-8)
      }

      // ── Info panel (right) ──
      const px=W*0.55
      const magA=Math.sqrt(ax*ax+ay*ay)
      const magB=Math.sqrt(animBx**2+animBy**2)
      const dot=ax*animBx+ay*animBy
      const cross=ax*animBy-ay*animBx  // z-component
      const cosT=dot/(magA*magB)
      const theta=Math.acos(Math.max(-1,Math.min(1,cosT)))*180/Math.PI
      const magR=Math.sqrt((ax+animBx)**2+(ay+animBy)**2)

      const info=[
        {l:'|A|',v:magA.toFixed(3),c:'#00d4ff'},
        {l:'|B|',v:magB.toFixed(3),c:'#f5a623'},
        {l:'|R| = |A+B|',v:magR.toFixed(3),c:'rgba(46,204,113,.9)'},
        {l:'A·B (dot)',v:dot.toFixed(3),c:'rgba(155,89,182,.9)'},
        {l:'|A×B| (cross)',v:Math.abs(cross).toFixed(3),c:'rgba(255,100,80,.9)'},
        {l:'Angle θ',v:`${theta.toFixed(1)}°`,c:'rgba(0,212,255,.7)'},
      ]
      ctx.textAlign='left'
      info.forEach((item,i)=>{
        ctx.font=i===0?'bold 12px monospace':'12px monospace'
        ctx.fillStyle=item.c
        ctx.fillText(`${item.l} = ${item.v}`,px,60+i*22)
      })

      // Formulas
      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.3)'
      ctx.fillText('A·B = |A||B|cosθ',px,60+info.length*22+14)
      ctx.fillText('|A×B| = |A||B|sinθ',px,60+info.length*22+30)
      ctx.fillText('|R|² = |A|²+|B|²+2A·B',px,60+info.length*22+46)

      if (runRef.current) tRef.current += 0.02
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [ax, ay, bx, by])

  return <canvas ref={canvasRef} style={{ width:'100%', height:420, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
})

export default VectorsSimulation
