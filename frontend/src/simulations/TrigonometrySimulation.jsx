import { useEffect, useRef, forwardRef } from 'react'

const TrigonometrySimulation = forwardRef(function TrigonometrySimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current); tRef.current = 0

    const draw = () => {
      const W = cv.offsetWidth, H = 420; cv.width = W; cv.height = H
      const ctx = cv.getContext('2d')
      const dk  = matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle = dk?'#0a0d14':'#f8f8f6'; ctx.fillRect(0,0,W,H)

      const angle = runRef.current ? tRef.current : tRef.current

      // ── LEFT: Unit Circle ──
      const cx = W*0.3, cy = H/2, R = Math.min(W*0.22, H*0.38)

      // Circle
      ctx.beginPath(); ctx.arc(cx,cy,R,0,2*Math.PI)
      ctx.strokeStyle=dk?'rgba(255,255,255,.2)':'rgba(0,0,0,.15)'; ctx.lineWidth=1.5; ctx.stroke()

      // Axes
      ctx.strokeStyle=dk?'rgba(255,255,255,.2)':'rgba(0,0,0,.15)'; ctx.lineWidth=1
      ctx.beginPath(); ctx.moveTo(cx-R-20,cy); ctx.lineTo(cx+R+20,cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx,cy-R-20); ctx.lineTo(cx,cy+R+20); ctx.stroke()

      // Special angle markers
      const specials = [0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330]
      specials.forEach(deg => {
        const rad = deg*Math.PI/180
        const mx=cx+R*Math.cos(rad), my=cy-R*Math.sin(rad)
        ctx.beginPath(); ctx.arc(mx,my,2,0,2*Math.PI)
        ctx.fillStyle=dk?'rgba(255,255,255,.25)':'rgba(0,0,0,.2)'; ctx.fill()
      })

      // Current point
      const px=cx+R*Math.cos(angle), py=cy-R*Math.sin(angle)

      // Radius line
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,py)
      ctx.strokeStyle='#00d4ff'; ctx.lineWidth=2.5; ctx.stroke()

      // sin projection (vertical) — green
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px,cy)
      ctx.strokeStyle='rgba(46,204,113,.8)'; ctx.lineWidth=2; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([])
      // cos projection (horizontal) — amber
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,cy)
      ctx.strokeStyle='rgba(245,166,35,.8)'; ctx.lineWidth=2; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([])

      // Angle arc
      ctx.beginPath(); ctx.arc(cx,cy,R*0.22,0,-angle,angle<0)
      ctx.strokeStyle='rgba(0,212,255,.5)'; ctx.lineWidth=1.5; ctx.stroke()

      // Point dot
      ctx.beginPath(); ctx.arc(px,py,7,0,2*Math.PI)
      ctx.shadowBlur=14; ctx.shadowColor='rgba(0,212,255,.8)'
      ctx.fillStyle='#00d4ff'; ctx.fill(); ctx.shadowBlur=0

      // Angle label
      const degVal = ((angle*180/Math.PI)%360+360)%360
      ctx.font='bold 12px monospace'; ctx.textAlign='center'
      ctx.fillStyle='rgba(0,212,255,.8)'; ctx.fillText(`${Math.round(degVal)}°`,cx+R*0.35*Math.cos(angle/2),cy-R*0.35*Math.sin(angle/2))

      // Values box
      const sin=Math.sin(angle), cos=Math.cos(angle), tan=Math.tan(angle)
      ctx.textAlign='left'; ctx.font='12px monospace'
      const vals=[
        {l:'sin θ',v:sin.toFixed(4),c:'rgba(46,204,113,.9)'},
        {l:'cos θ',v:cos.toFixed(4),c:'rgba(245,166,35,.9)'},
        {l:'tan θ',v:Math.abs(tan)<100?tan.toFixed(4):'∞',c:'rgba(155,89,182,.9)'},
        {l:'cot θ',v:Math.abs(sin)>0.01?(cos/sin).toFixed(3):'∞',c:'rgba(0,212,255,.7)'},
        {l:'sec θ',v:Math.abs(cos)>0.01?(1/cos).toFixed(3):'∞',c:'rgba(255,100,80,.7)'},
        {l:'csc θ',v:Math.abs(sin)>0.01?(1/sin).toFixed(3):'∞',c:'rgba(255,180,50,.7)'},
      ]
      vals.forEach((v,i)=>{
        ctx.fillStyle=v.c; ctx.fillText(`${v.l} = ${v.v}`,12,16+i*18)
      })

      // ── RIGHT: Sine & Cosine Waves ──
      const gx=W*0.55, gw=W*0.42, gy=H*0.12, gh=H*0.35
      const periods = 2, pxPerPeriod = gw/periods

      // Grid
      ctx.strokeStyle=dk?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)'; ctx.lineWidth=1
      for (let i=0;i<=8;i++) {
        const x=gx+i*gw/8; ctx.beginPath(); ctx.moveTo(x,gy); ctx.lineTo(x,gy+gh); ctx.stroke()
      }
      ctx.beginPath(); ctx.moveTo(gx,gy+gh/2); ctx.lineTo(gx+gw,gy+gh/2); ctx.stroke()

      // Sine wave
      ctx.beginPath()
      for (let px2=0;px2<=gw;px2++) {
        const t=(px2/gw)*periods*2*Math.PI
        const y=gy+gh/2 - Math.sin(t)*(gh*0.4)
        px2===0?ctx.moveTo(gx+px2,y):ctx.lineTo(gx+px2,y)
      }
      ctx.strokeStyle='rgba(46,204,113,.8)'; ctx.lineWidth=2; ctx.stroke()

      // Cosine wave
      ctx.beginPath()
      for (let px2=0;px2<=gw;px2++) {
        const t=(px2/gw)*periods*2*Math.PI
        const y=gy+gh/2 - Math.cos(t)*(gh*0.4)
        px2===0?ctx.moveTo(gx+px2,y):ctx.lineTo(gx+px2,y)
      }
      ctx.strokeStyle='rgba(245,166,35,.7)'; ctx.lineWidth=1.5; ctx.stroke()

      // Moving marker on waves
      const wAngle=((angle%(2*Math.PI))+2*Math.PI)%(2*Math.PI)
      const markerX=gx+(wAngle/(2*Math.PI*periods))*gw
      if (markerX>=gx && markerX<=gx+gw) {
        const sy=gy+gh/2-sin*(gh*0.4), cosy=gy+gh/2-cos*(gh*0.4)
        ctx.beginPath(); ctx.arc(markerX,sy,5,0,2*Math.PI)
        ctx.fillStyle='rgba(46,204,113,.9)'; ctx.fill()
        ctx.beginPath(); ctx.arc(markerX,cosy,5,0,2*Math.PI)
        ctx.fillStyle='rgba(245,166,35,.9)'; ctx.fill()
        ctx.setLineDash([2,3])
        ctx.beginPath(); ctx.moveTo(markerX,gy); ctx.lineTo(markerX,gy+gh)
        ctx.strokeStyle='rgba(0,212,255,.3)'; ctx.lineWidth=1; ctx.stroke(); ctx.setLineDash([])
      }

      // Wave labels
      ctx.font='11px monospace'; ctx.textAlign='left'
      ctx.fillStyle='rgba(46,204,113,.8)'; ctx.fillText('sin(θ)',gx,gy-4)
      ctx.fillStyle='rgba(245,166,35,.8)'; ctx.fillText('cos(θ)',gx+gw*0.35,gy-4)

      // x-axis labels
      const xlabels=['0','π/2','π','3π/2','2π','5π/2','3π']
      xlabels.forEach((l,i)=>{
        const x=gx+i*(gw/6)
        ctx.fillStyle=dk?'rgba(255,255,255,.25)':'rgba(0,0,0,.25)'
        ctx.textAlign='center'; ctx.fillText(l,x,gy+gh+14)
      })

      // Identity box
      ctx.textAlign='left'; ctx.font='11px monospace'
      ctx.fillStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.3)'
      ctx.fillText('sin²θ + cos²θ = 1',gx,H-24)
      ctx.fillText(`Verification: ${(sin*sin+cos*cos).toFixed(4)}`,gx,H-8)

      if (runRef.current) tRef.current += 0.025
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return <canvas ref={canvasRef} style={{ width:'100%', height:420, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
})

export default TrigonometrySimulation
