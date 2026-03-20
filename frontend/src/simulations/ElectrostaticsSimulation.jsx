import { useEffect, useRef, forwardRef } from 'react'

const ElectrostaticsSimulation = forwardRef(function ElectrostaticsSimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)

  const q1 = parseFloat(variables?.charge1 || variables?.voltage || 2)  // positive
  const q2 = parseFloat(variables?.charge2 || -1)  // negative

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current); tRef.current = 0; runRef.current = true

    const draw = () => {
      const W = cv.offsetWidth, H = 400; cv.width=W; cv.height=H
      const ctx = cv.getContext('2d')
      const dk  = matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle = dk?'#06080f':'#f0f4f8'; ctx.fillRect(0,0,W,H)

      const c1x=W*0.32, c1y=H/2, c2x=W*0.68, c2y=H/2

      // ── Electric field line tracing ──
      const numLines = 12
      const charges = [
        {x:c1x, y:c1y, q:1},   // positive
        {x:c2x, y:c2y, q:-1},  // negative
      ]

      const getField = (px, py) => {
        let ex=0, ey=0
        for (const c of charges) {
          const dx=px-c.x, dy=py-c.y, r2=dx*dx+dy*dy
          if (r2 < 100) continue
          const E = c.q / r2
          ex += E*dx/Math.sqrt(r2); ey += E*dy/Math.sqrt(r2)
        }
        return {ex, ey}
      }

      // Draw field lines from +ve charge
      for (let i = 0; i < numLines; i++) {
        const startAngle = (i / numLines) * 2 * Math.PI
        let px = c1x + 26*Math.cos(startAngle), py = c1y + 26*Math.sin(startAngle)
        ctx.beginPath(); ctx.moveTo(px, py)
        for (let step = 0; step < 200; step++) {
          const {ex, ey} = getField(px, py)
          const mag = Math.sqrt(ex*ex+ey*ey); if (mag<1e-8) break
          px += 4*ex/mag; py += 4*ey/mag
          ctx.lineTo(px, py)
          if (px<5||px>W-5||py<5||py>H-5) break
          if (Math.hypot(px-c2x, py-c2y)<22) break
          // Draw arrow midway
          if (step===60) {
            const angle = Math.atan2(ey, ex)
            ctx.save()
            ctx.translate(px, py); ctx.rotate(angle)
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-7,-4); ctx.lineTo(-7,4); ctx.closePath()
            ctx.fillStyle=dk?'rgba(255,100,80,.5)':'rgba(200,40,20,.4)'; ctx.fill()
            ctx.restore()
          }
        }
        ctx.strokeStyle = dk?'rgba(255,100,80,.4)':'rgba(200,40,20,.35)'
        ctx.lineWidth=1.2; ctx.stroke()
      }

      // ── Equipotential circles (dashed) ──
      for (let r = 40; r < 120; r += 40) {
        ctx.beginPath(); ctx.arc(c1x, c1y, r, 0, 2*Math.PI)
        ctx.setLineDash([3,5])
        ctx.strokeStyle=dk?'rgba(100,200,255,.15)':'rgba(0,100,200,.12)'
        ctx.lineWidth=1; ctx.stroke(); ctx.setLineDash([])
      }

      // ── Animated test charge ──
      const testAngle = tRef.current
      const testR = 90
      const tx = c1x + testR * Math.cos(testAngle), ty = c1y + testR * Math.sin(testAngle)
      ctx.beginPath(); ctx.arc(tx, ty, 6, 0, 2*Math.PI)
      ctx.fillStyle='rgba(255,220,0,.9)'; ctx.fill()
      ctx.font='9px monospace'; ctx.fillStyle=dk?'#fff':'#000'
      ctx.textAlign='center'; ctx.fillText('+', tx, ty+3); ctx.textAlign='left'

      // Force on test charge
      const {ex, ey} = getField(tx, ty)
      const mag = Math.sqrt(ex*ex+ey*ey)
      if (mag > 0) {
        const fLen = 35
        ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(tx+fLen*ex/mag, ty+fLen*ey/mag)
        ctx.strokeStyle='rgba(255,220,0,.7)'; ctx.lineWidth=2; ctx.stroke()
      }

      // ── Charges ──
      const drawCharge = (x, y, positive, label) => {
        const color = positive ? '#ef4444' : '#3b82f6'
        const glow  = positive ? 'rgba(239,68,68,.6)' : 'rgba(59,130,246,.6)'
        ctx.beginPath(); ctx.arc(x, y, 22, 0, 2*Math.PI)
        ctx.shadowBlur=20; ctx.shadowColor=glow; ctx.fillStyle=color; ctx.fill(); ctx.shadowBlur=0
        ctx.font='bold 16px monospace'; ctx.fillStyle='#fff'; ctx.textAlign='center'
        ctx.fillText(positive?'+':'-', x, y+6); ctx.textAlign='left'
        ctx.font='10px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.5)':'rgba(0,0,0,.4)'
        ctx.textAlign='center'; ctx.fillText(label, x, y+36); ctx.textAlign='left'
      }
      drawCharge(c1x, c1y, true,  `+q₁`)
      drawCharge(c2x, c2y, false, `-q₂`)

      // Force arrows between charges
      const dist = c2x - c1x
      const repelX = 50
      ctx.strokeStyle='rgba(255,100,80,.7)'; ctx.lineWidth=2
      // Force on +q due to -q (attraction, toward right)
      ctx.beginPath(); ctx.moveTo(c1x+25,c1y); ctx.lineTo(c1x+25+repelX,c1y)
      ctx.stroke()
      // Force on -q due to +q (attraction, toward left)
      ctx.beginPath(); ctx.moveTo(c2x-25,c2y); ctx.lineTo(c2x-25-repelX,c2y)
      ctx.stroke()

      // Labels
      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.35)':'rgba(0,0,0,.35)'
      ctx.fillText('F = kq₁q₂/r²', 12, H-24)
      ctx.fillText('E = kq/r²  (field strength)', 12, H-8)

      if (runRef.current) tRef.current += 0.02
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return <canvas ref={canvasRef} style={{ width:'100%', height:400, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
})

export default ElectrostaticsSimulation
