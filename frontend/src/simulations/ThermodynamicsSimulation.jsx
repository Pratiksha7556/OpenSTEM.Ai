import { useEffect, useRef, forwardRef } from 'react'

const ThermodynamicsSimulation = forwardRef(function ThermodynamicsSimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)
  const molsRef   = useRef([])

  const T = parseFloat(variables?.temperature || 300)  // Kelvin
  const P = parseFloat(variables?.pressure    || 1)    // atm
  const V = parseFloat(variables?.volume      || 1)    // L

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current); tRef.current = 0; runRef.current = true

    // Init molecules
    const N = 18
    molsRef.current = Array.from({length:N}, (_, i) => ({
      x: 50 + Math.random()*160,
      y: 180 + Math.random()*150,
      vx: (Math.random()-0.5) * 3 * Math.sqrt(T/300),
      vy: (Math.random()-0.5) * 3 * Math.sqrt(T/300),
      r: 5,
    }))

    const draw = () => {
      const W=cv.offsetWidth, H=400; cv.width=W; cv.height=H
      const ctx=cv.getContext('2d')
      const dk=matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle=dk?'#06080f':'#f0f4f8'; ctx.fillRect(0,0,W,H)

      // ── LEFT: Gas Container with molecules ──
      const boxX=30, boxY=165, boxW=210, boxH=180

      // Container
      ctx.strokeStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.3)'; ctx.lineWidth=2
      ctx.strokeRect(boxX, boxY, boxW, boxH)

      // Heat indicator at bottom
      const heatColor = `rgba(255,${Math.max(0,150-T/3)},0,0.5)`
      ctx.fillStyle=heatColor; ctx.fillRect(boxX, boxY+boxH-8, boxW, 8)

      // Temperature label on box
      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,180,50,.7)':'rgba(180,80,0,.7)'
      ctx.fillText(`T = ${T} K`, boxX+4, boxY-8)
      ctx.fillText(`P = ${P} atm`, boxX+4, boxY+boxH+16)

      // Update & draw molecules
      const speed = Math.sqrt(T/300)
      molsRef.current.forEach(mol => {
        if (runRef.current) {
          mol.x += mol.vx; mol.y += mol.vy
          if (mol.x < boxX+mol.r || mol.x > boxX+boxW-mol.r) mol.vx *= -1
          if (mol.y < boxY+mol.r || mol.y > boxY+boxH-mol.r) mol.vy *= -1
        }
        // Color by speed
        const v = Math.sqrt(mol.vx**2+mol.vy**2)
        const hot = Math.min(v/5, 1)
        const r=Math.round(50+hot*205), g=Math.round(130-hot*80), b=Math.round(255-hot*200)
        ctx.beginPath(); ctx.arc(mol.x, mol.y, mol.r, 0, 2*Math.PI)
        ctx.fillStyle=`rgba(${r},${g},${b},.8)`; ctx.fill()
        // Velocity vector
        if (runRef.current) {
          ctx.beginPath(); ctx.moveTo(mol.x,mol.y); ctx.lineTo(mol.x+mol.vx*3,mol.y+mol.vy*3)
          ctx.strokeStyle=`rgba(${r},${g},${b},.3)`; ctx.lineWidth=1; ctx.stroke()
        }
      })

      // KE label
      ctx.font='10px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.3)'
      ctx.fillText('KE ∝ Temperature', boxX+4, H-8)

      // ── RIGHT: PV Diagram ──
      const pvX=W*0.52, pvY=30, pvW=W-pvX-20, pvH=H-60
      const pvR=pvX+pvW, pvB=pvY+pvH

      // Axes
      ctx.strokeStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.3)'; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.moveTo(pvX,pvY); ctx.lineTo(pvX,pvB); ctx.lineTo(pvR,pvB); ctx.stroke()

      // Axis labels
      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.4)':'rgba(0,0,0,.4)'
      ctx.textAlign='center'; ctx.fillText('Volume (V)', pvX+pvW/2, pvB+18)
      ctx.save(); ctx.translate(pvX-22, pvY+pvH/2); ctx.rotate(-Math.PI/2)
      ctx.fillText('Pressure (P)', 0, 0); ctx.restore(); ctx.textAlign='left'

      // Isothermal curves (PV = nRT = const)
      const temps = [200, 300, 400, 600]
      const colors = ['rgba(100,180,255,.5)','rgba(0,212,255,.7)','rgba(255,200,50,.6)','rgba(255,100,80,.6)']
      temps.forEach((Tc, i) => {
        const k = Tc/300
        ctx.beginPath()
        let first=true
        for (let vv=0.1; vv<=2; vv+=0.05) {
          const pp = k/vv
          const sx = pvX + (vv/2)*pvW, sy = pvB - (pp/3)*pvH
          if (sx>pvR||sy<pvY) continue
          if (first) { ctx.moveTo(sx,sy); first=false } else ctx.lineTo(sx,sy)
        }
        ctx.strokeStyle=colors[i]; ctx.lineWidth=Tc===T?2.5:1.2; ctx.stroke()
        ctx.font='9px monospace'; ctx.fillStyle=colors[i]
        ctx.fillText(`T=${Tc}K`, pvX+pvW*0.85, pvB-(k/3)*pvH-4)
      })

      // Current state point
      const stateV=1, stateP=T/300
      const sx=pvX+(stateV/2)*pvW, sy=pvB-(stateP/3)*pvH
      ctx.beginPath(); ctx.arc(sx, sy, 6, 0, 2*Math.PI)
      ctx.shadowBlur=12; ctx.shadowColor='rgba(0,212,255,.8)'
      ctx.fillStyle='#00d4ff'; ctx.fill(); ctx.shadowBlur=0
      ctx.font='10px monospace'; ctx.fillStyle='rgba(0,212,255,.8)'
      ctx.fillText(`(V,P)`, sx+8, sy-4)

      ctx.font='10px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.3)'
      ctx.fillText('PV = nRT  (Ideal Gas Law)', pvX, pvB+34)

      if (runRef.current) tRef.current += 0.02
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [T])

  return <canvas ref={canvasRef} style={{ width:'100%', height:400, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
})

export default ThermodynamicsSimulation
