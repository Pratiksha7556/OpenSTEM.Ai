import { useEffect, useRef, forwardRef } from 'react'

const GravitationSimulation = forwardRef(function GravitationSimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)

  const M = parseFloat(variables?.mass1 || variables?.mass || 5.97e24)
  const m = parseFloat(variables?.mass2 || 1)
  const r = parseFloat(variables?.radius || variables?.length || 200) // px scale
  const G = 6.674e-11

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current)
    tRef.current = 0; runRef.current = true

    const draw = () => {
      const W = cv.offsetWidth, H = 400
      cv.width = W; cv.height = H
      const ctx = cv.getContext('2d')
      const dk  = matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle = dk ? '#060a10' : '#f0f4f8'; ctx.fillRect(0, 0, W, H)

      // Star field
      if (dk) {
        for (let i = 0; i < 60; i++) {
          const sx = (i * 137.5) % W, sy = (i * 89.3) % H
          ctx.beginPath(); ctx.arc(sx, sy, 0.8, 0, 2*Math.PI)
          ctx.fillStyle = `rgba(255,255,255,${0.2+Math.sin(i)*0.15})`; ctx.fill()
        }
      }

      const cx = W/2, cy = H/2
      const orbitR = Math.min(W, H) * 0.35

      // ── Gravitational field lines (radial) ──
      for (let a = 0; a < 360; a += 30) {
        const rad = a * Math.PI / 180
        const x1 = cx + 28 * Math.cos(rad)
        const y1 = cy + 28 * Math.sin(rad)
        const x2 = cx + orbitR * 0.85 * Math.cos(rad)
        const y2 = cy + orbitR * 0.85 * Math.sin(rad)
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
        ctx.strokeStyle = dk ? 'rgba(100,160,255,.12)' : 'rgba(30,80,180,.1)'
        ctx.lineWidth = 1; ctx.stroke()
        // arrowhead pointing inward (gravity pulls toward center)
        const midX = x1 + (x2-x1)*0.5, midY = y1 + (y2-y1)*0.5
        const angle = Math.atan2(y1-y2, x1-x2)
        ctx.beginPath()
        ctx.moveTo(midX + 5*Math.cos(angle-0.4), midY + 5*Math.sin(angle-0.4))
        ctx.lineTo(midX, midY)
        ctx.lineTo(midX + 5*Math.cos(angle+0.4), midY + 5*Math.sin(angle+0.4))
        ctx.strokeStyle = dk ? 'rgba(100,160,255,.25)' : 'rgba(30,80,180,.2)'
        ctx.lineWidth = 1; ctx.stroke()
      }

      // ── Orbit path ──
      ctx.beginPath(); ctx.arc(cx, cy, orbitR, 0, 2*Math.PI)
      ctx.strokeStyle = dk ? 'rgba(0,212,255,.2)' : 'rgba(0,100,200,.15)'
      ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([])

      // ── Central mass (planet/sun) ──
      const sunGrad = ctx.createRadialGradient(cx-6, cy-6, 1, cx, cy, 24)
      sunGrad.addColorStop(0, '#ffe066'); sunGrad.addColorStop(0.5, '#f5a623'); sunGrad.addColorStop(1, '#c47c00')
      ctx.beginPath(); ctx.arc(cx, cy, 24, 0, 2*Math.PI)
      ctx.shadowBlur = 30; ctx.shadowColor = 'rgba(245,166,35,.6)'
      ctx.fillStyle = sunGrad; ctx.fill(); ctx.shadowBlur = 0
      ctx.fillStyle = dk?'rgba(255,255,255,.6)':'rgba(0,0,0,.5)'; ctx.font='bold 10px monospace'
      ctx.textAlign='center'; ctx.fillText('M', cx, cy+4); ctx.textAlign='left'

      // ── Orbiting body ──
      const bodyAngle = runRef.current ? tRef.current * 0.9 : tRef.current * 0.9
      const bx = cx + orbitR * Math.cos(bodyAngle)
      const by = cy + orbitR * Math.sin(bodyAngle)

      // Trail
      for (let i = 1; i <= 30; i++) {
        const ta = bodyAngle - i * 0.06
        const tx = cx + orbitR * Math.cos(ta), ty = cy + orbitR * Math.sin(ta)
        ctx.beginPath(); ctx.arc(tx, ty, 4*(1-i/30), 0, 2*Math.PI)
        ctx.fillStyle = `rgba(0,212,255,${0.12*(1-i/30)})`; ctx.fill()
      }

      // Gravity force arrow (toward center)
      const fx = cx - bx, fy = cy - by
      const fLen = Math.sqrt(fx*fx+fy*fy), fScale = 40/fLen
      ctx.beginPath()
      ctx.moveTo(bx, by); ctx.lineTo(bx+fx*fScale, by+fy*fScale)
      ctx.strokeStyle='rgba(255,100,100,.8)'; ctx.lineWidth=2; ctx.stroke()
      // arrowhead
      const fAngle = Math.atan2(fy, fx)
      ctx.beginPath()
      ctx.moveTo(bx+fx*fScale, by+fy*fScale)
      ctx.lineTo(bx+fx*fScale - 8*Math.cos(fAngle-0.4), by+fy*fScale - 8*Math.sin(fAngle-0.4))
      ctx.lineTo(bx+fx*fScale - 8*Math.cos(fAngle+0.4), by+fy*fScale - 8*Math.sin(fAngle+0.4))
      ctx.closePath(); ctx.fillStyle='rgba(255,100,100,.8)'; ctx.fill()

      // Velocity arrow (tangential)
      const vAngle = bodyAngle + Math.PI/2
      ctx.beginPath()
      ctx.moveTo(bx, by); ctx.lineTo(bx+35*Math.cos(vAngle), by+35*Math.sin(vAngle))
      ctx.strokeStyle='rgba(0,230,120,.8)'; ctx.lineWidth=2; ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(bx+35*Math.cos(vAngle), by+35*Math.sin(vAngle))
      ctx.lineTo(bx+35*Math.cos(vAngle)-8*Math.cos(vAngle-0.4), by+35*Math.sin(vAngle)-8*Math.sin(vAngle-0.4))
      ctx.lineTo(bx+35*Math.cos(vAngle)-8*Math.cos(vAngle+0.4), by+35*Math.sin(vAngle)-8*Math.sin(vAngle+0.4))
      ctx.closePath(); ctx.fillStyle='rgba(0,230,120,.8)'; ctx.fill()

      // Body
      ctx.beginPath(); ctx.arc(bx, by, 10, 0, 2*Math.PI)
      ctx.shadowBlur=16; ctx.shadowColor='rgba(0,212,255,.7)'
      ctx.fillStyle='#0ea5e9'; ctx.fill(); ctx.shadowBlur=0
      ctx.fillStyle=dk?'rgba(255,255,255,.6)':'rgba(0,0,0,.5)'; ctx.font='bold 9px monospace'
      ctx.textAlign='center'; ctx.fillText('m', bx, by+3); ctx.textAlign='left'

      // Radius line
      ctx.setLineDash([3,3])
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by)
      ctx.strokeStyle=dk?'rgba(255,255,255,.15)':'rgba(0,0,0,.1)'; ctx.lineWidth=1; ctx.stroke()
      ctx.setLineDash([])

      // Labels
      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,100,100,.85)':'rgba(180,20,20,.8)'
      ctx.fillText('F (gravity)', bx+fx*fScale*0.5+6, by+fy*fScale*0.5)
      ctx.fillStyle=dk?'rgba(0,230,120,.85)':'rgba(0,140,60,.8)'
      ctx.fillText('v (velocity)', bx+35*Math.cos(vAngle)+6, by+35*Math.sin(vAngle))

      // Formula overlay
      ctx.fillStyle=dk?'rgba(255,255,255,.35)':'rgba(0,0,0,.3)'; ctx.font='11px monospace'
      ctx.fillText('F = GMm/r²', 12, H-24)
      ctx.fillText(`T = 2π√(r³/GM)`, 12, H-8)

      if (runRef.current) tRef.current += 0.022
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return <canvas ref={canvasRef} style={{ width:'100%', height:400, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
})

export default GravitationSimulation
