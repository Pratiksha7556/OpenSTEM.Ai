import { useEffect, useRef, forwardRef } from 'react'

const ModernPhysicsSimulation = forwardRef(function ModernPhysicsSimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)
  const photonRef = useRef({ x:0, y:0, active:false, timer:0 })

  const n1_level = parseInt(variables?.n1 || 3)  // upper level
  const n2_level = parseInt(variables?.n2 || 2)  // lower level
  const Z  = parseInt(variables?.atomic_number || 1)  // hydrogen

  // Energy levels: E_n = -13.6/n² eV (hydrogen)
  const E = n => -13.6 / (n*n)

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current); tRef.current = 0; runRef.current = true

    const draw = () => {
      const W=cv.offsetWidth, H=400; cv.width=W; cv.height=H
      const ctx=cv.getContext('2d')
      const dk=matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle=dk?'#06080f':'#f0f4f8'; ctx.fillRect(0,0,W,H)

      // ── LEFT: Bohr Model ──
      const cx=W*0.28, cy=H/2

      // Nucleus
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, 2*Math.PI)
      ctx.shadowBlur=20; ctx.shadowColor='rgba(255,80,80,.7)'
      ctx.fillStyle='#ef4444'; ctx.fill(); ctx.shadowBlur=0
      ctx.font='9px monospace'; ctx.fillStyle='#fff'; ctx.textAlign='center'
      ctx.fillText('+Ze', cx, cy+3); ctx.textAlign='left'

      // Electron orbits (shells n=1 to 4)
      const shells = [1,2,3,4]
      const rScale = 28
      shells.forEach(n => {
        const r = n*n*rScale
        if (cx+r > W/2-10) return
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2*Math.PI)
        ctx.strokeStyle = n===n1_level||n===n2_level
          ? (n===n1_level?'rgba(255,220,50,.6)':'rgba(100,220,255,.6)')
          : dk?'rgba(255,255,255,.1)':'rgba(0,0,0,.1)'
        ctx.lineWidth = n===n1_level||n===n2_level ? 1.5 : 1
        ctx.setLineDash(n===n1_level||n===n2_level?[]:[3,4])
        ctx.stroke(); ctx.setLineDash([])

        // n label
        ctx.font='9px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.4)':'rgba(0,0,0,.3)'
        ctx.textAlign='center'; ctx.fillText(`n=${n}`, cx+r, cy-4); ctx.textAlign='left'
      })

      // Electron on n1 orbit
      const r1 = n1_level*n1_level*rScale
      if (cx+r1 <= W/2-10) {
        const ea = tRef.current * 1.5
        const ex=cx+r1*Math.cos(ea), ey=cy+r1*Math.sin(ea)
        ctx.beginPath(); ctx.arc(ex, ey, 5, 0, 2*Math.PI)
        ctx.shadowBlur=12; ctx.shadowColor='rgba(100,220,255,.8)'
        ctx.fillStyle='#7dd3fc'; ctx.fill(); ctx.shadowBlur=0
      }

      // Electron on n2 orbit
      const r2 = n2_level*n2_level*rScale
      if (cx+r2 <= W/2-10) {
        const ea2 = -tRef.current * 2.5
        const ex2=cx+r2*Math.cos(ea2), ey2=cy+r2*Math.sin(ea2)
        ctx.beginPath(); ctx.arc(ex2, ey2, 5, 0, 2*Math.PI)
        ctx.shadowBlur=12; ctx.shadowColor='rgba(100,220,255,.8)'
        ctx.fillStyle='#7dd3fc'; ctx.fill(); ctx.shadowBlur=0
      }

      // ── RIGHT: Energy Level Diagram ──
      const elx = W/2 + 20, elR = W - 30
      const eMin = E(5), eMax = 0
      const eRange = eMax - eMin
      const toY = en => H*0.05 + (eMax-en)/eRange*(H*0.88)

      // Ground state
      ctx.fillStyle=dk?'rgba(255,255,255,.15)':'rgba(0,0,0,.12)'
      ctx.fillRect(elx, toY(-13.6), elR-elx, 1.5)

      // Energy levels n=1 to 5
      for (let n=1; n<=5; n++) {
        const en = E(n)
        const y  = toY(en)
        const active = n===n1_level||n===n2_level
        ctx.fillStyle = active
          ? (n===n1_level ? 'rgba(255,220,50,.7)' : 'rgba(100,220,255,.7)')
          : dk?'rgba(255,255,255,.2)':'rgba(0,0,0,.18)'
        ctx.fillRect(elx, y, elR-elx, active?2:1.5)

        ctx.font='10px monospace'
        ctx.fillStyle=dk?'rgba(255,255,255,.5)':'rgba(0,0,0,.45)'
        ctx.textAlign='right'
        ctx.fillText(`n=${n}  ${en.toFixed(2)} eV`, elR-4, y-3)
        ctx.textAlign='left'
      }

      // Photon emission arrow
      const y1 = toY(E(n1_level)), y2 = toY(E(n2_level))
      const arrowX = elx + (elR-elx)*0.5

      // Animated dashed photon line
      const phase = (tRef.current*3) % 1
      ctx.setLineDash([4,4])
      ctx.lineDashOffset = -phase*8
      ctx.beginPath(); ctx.moveTo(arrowX, y1); ctx.lineTo(arrowX, y2)
      ctx.strokeStyle='rgba(255,200,0,.8)'; ctx.lineWidth=2; ctx.stroke()
      ctx.setLineDash([]); ctx.lineDashOffset=0

      // Arrow at top
      ctx.beginPath()
      ctx.moveTo(arrowX, y2)
      ctx.lineTo(arrowX-8, y2+12); ctx.lineTo(arrowX+8, y2+12)
      ctx.closePath(); ctx.fillStyle='rgba(255,200,0,.8)'; ctx.fill()

      // ΔE label
      const dE = Math.abs(E(n1_level)-E(n2_level))
      ctx.font='11px monospace'; ctx.fillStyle='rgba(255,200,0,.8)'; ctx.textAlign='center'
      ctx.fillText(`ΔE=${dE.toFixed(2)}eV`, arrowX+40, (y1+y2)/2)
      ctx.fillText(`hν=${dE.toFixed(2)}eV`, arrowX+40, (y1+y2)/2+16)
      ctx.textAlign='left'

      // Animated photon moving out
      photonRef.current.timer += 0.03
      if (photonRef.current.timer > 2) { photonRef.current.timer=0 }
      const phProgress = Math.min(photonRef.current.timer/1.5, 1)
      if (phProgress < 1) {
        const phX = arrowX + phProgress*80
        const phY = (y1+y2)/2
        ctx.beginPath(); ctx.arc(phX, phY, 5, 0, 2*Math.PI)
        ctx.shadowBlur=14; ctx.shadowColor='rgba(255,220,0,.8)'
        ctx.fillStyle='rgba(255,220,0,.9)'; ctx.fill(); ctx.shadowBlur=0
        ctx.font='8px monospace'; ctx.fillStyle='rgba(255,220,0,.7)'
        ctx.textAlign='center'; ctx.fillText('γ', phX, phY+3); ctx.textAlign='left'
      }

      // Formula
      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.35)':'rgba(0,0,0,.3)'
      ctx.fillText(`E_n = -13.6/n²  (eV)   hν = E_n₁ – E_n₂`, 12, H-8)

      if (runRef.current) tRef.current += 0.022
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return <canvas ref={canvasRef} style={{ width:'100%', height:400, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
})

export default ModernPhysicsSimulation
