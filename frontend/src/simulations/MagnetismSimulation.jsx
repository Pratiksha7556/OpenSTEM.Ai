import { useEffect, useRef, forwardRef } from 'react'

const MagnetismSimulation = forwardRef(function MagnetismSimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)

  const B    = parseFloat(variables?.magnetic_field || variables?.frequency || 1)  // Tesla
  const q    = parseFloat(variables?.charge || 1)
  const v    = parseFloat(variables?.velocity || 80)

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current); tRef.current = 0; runRef.current = true

    const draw = () => {
      const W=cv.offsetWidth, H=400; cv.width=W; cv.height=H
      const ctx=cv.getContext('2d')
      const dk=matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle=dk?'#06080f':'#f0f4f8'; ctx.fillRect(0,0,W,H)

      // ── Magnetic field dots/crosses (field into screen) ──
      ctx.font='14px monospace'; ctx.textAlign='center'
      for (let x=30; x<W-10; x+=50) {
        for (let y=30; y<H-30; y+=50) {
          ctx.fillStyle=dk?'rgba(130,100,255,.4)':'rgba(80,50,200,.3)'
          ctx.fillText('×', x, y+5)  // × means B into page
        }
      }
      ctx.textAlign='left'

      // B label
      ctx.font='12px monospace'; ctx.fillStyle=dk?'rgba(130,100,255,.7)':'rgba(80,50,200,.6)'
      ctx.fillText('B (into page)', W-120, 20)

      // ── Circular motion of charged particle ──
      const cx=W/2, cy=H/2
      const radius = Math.min(W,H)*0.28

      // Draw orbit (circular due to Lorentz force)
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, 2*Math.PI)
      ctx.strokeStyle=dk?'rgba(0,212,255,.2)':'rgba(0,100,200,.15)'
      ctx.setLineDash([4,4]); ctx.lineWidth=1; ctx.stroke(); ctx.setLineDash([])

      // Particle
      const angle = runRef.current ? -tRef.current : -tRef.current
      const px = cx + radius*Math.cos(angle), py = cy + radius*Math.sin(angle)

      // Velocity (tangential)
      const vAngle = angle + Math.PI/2
      const vLen = 50
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+vLen*Math.cos(vAngle), py+vLen*Math.sin(vAngle))
      ctx.strokeStyle='rgba(0,230,120,.9)'; ctx.lineWidth=2.5; ctx.stroke()
      // arrowhead
      ctx.beginPath()
      ctx.moveTo(px+vLen*Math.cos(vAngle), py+vLen*Math.sin(vAngle))
      ctx.lineTo(px+vLen*Math.cos(vAngle)-9*Math.cos(vAngle-0.4), py+vLen*Math.sin(vAngle)-9*Math.sin(vAngle-0.4))
      ctx.lineTo(px+vLen*Math.cos(vAngle)-9*Math.cos(vAngle+0.4), py+vLen*Math.sin(vAngle)-9*Math.sin(vAngle+0.4))
      ctx.closePath(); ctx.fillStyle='rgba(0,230,120,.9)'; ctx.fill()

      // Magnetic force (centripetal — toward center)
      const fAngle = Math.atan2(cy-py, cx-px)
      const fLen = 45
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+fLen*Math.cos(fAngle), py+fLen*Math.sin(fAngle))
      ctx.strokeStyle='rgba(255,100,80,.9)'; ctx.lineWidth=2.5; ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(px+fLen*Math.cos(fAngle), py+fLen*Math.sin(fAngle))
      ctx.lineTo(px+fLen*Math.cos(fAngle)-9*Math.cos(fAngle-0.4), py+fLen*Math.sin(fAngle)-9*Math.sin(fAngle-0.4))
      ctx.lineTo(px+fLen*Math.cos(fAngle)-9*Math.cos(fAngle+0.4), py+fLen*Math.sin(fAngle)-9*Math.sin(fAngle+0.4))
      ctx.closePath(); ctx.fillStyle='rgba(255,100,80,.9)'; ctx.fill()

      // Trail
      for (let i=1; i<=25; i++) {
        const ta=angle+i*0.07
        const tx=cx+radius*Math.cos(ta), ty=cy+radius*Math.sin(ta)
        ctx.beginPath(); ctx.arc(tx,ty,4*(1-i/25),0,2*Math.PI)
        ctx.fillStyle=`rgba(0,212,255,${0.15*(1-i/25)})`; ctx.fill()
      }

      // Particle ball
      ctx.beginPath(); ctx.arc(px,py,11,0,2*Math.PI)
      ctx.shadowBlur=16; ctx.shadowColor='rgba(0,212,255,.7)'
      ctx.fillStyle='#0ea5e9'; ctx.fill(); ctx.shadowBlur=0
      ctx.font='bold 9px monospace'; ctx.fillStyle='#fff'; ctx.textAlign='center'
      ctx.fillText('+q', px, py+3); ctx.textAlign='left'

      // Vector labels
      ctx.font='11px monospace'
      ctx.fillStyle='rgba(0,230,120,.85)'
      ctx.fillText('v', px+vLen*Math.cos(vAngle)+6, py+vLen*Math.sin(vAngle))
      ctx.fillStyle='rgba(255,100,80,.85)'
      ctx.fillText('F = qv×B', px+fLen*Math.cos(fAngle)+5, py+fLen*Math.sin(fAngle))

      // Center cross
      ctx.beginPath(); ctx.arc(cx,cy,3,0,2*Math.PI); ctx.fillStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.2)'; ctx.fill()

      // Radius label
      ctx.setLineDash([2,4])
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,py)
      ctx.strokeStyle=dk?'rgba(255,255,255,.1)':'rgba(0,0,0,.1)'; ctx.lineWidth=1; ctx.stroke()
      ctx.setLineDash([])

      // Formula
      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.35)':'rgba(0,0,0,.3)'
      ctx.fillText('F = qvB (Lorentz force)', 12, H-24)
      ctx.fillText('r = mv/(qB)  (radius of circular motion)', 12, H-8)

      if (runRef.current) tRef.current += 0.025
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return <canvas ref={canvasRef} style={{ width:'100%', height:400, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
})

export default MagnetismSimulation
