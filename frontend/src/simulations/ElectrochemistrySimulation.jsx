import { useEffect, useRef, forwardRef, useState } from 'react'

const ElectrochemistrySimulation = forwardRef(function ElectrochemistrySimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)
  const [mode, setMode] = useState('galvanic')

  const voltage = parseFloat(variables?.voltage || 1.1)

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current); tRef.current = 0

    const draw = () => {
      const W=cv.offsetWidth, H=420; cv.width=W; cv.height=H
      const ctx=cv.getContext('2d')
      const dk=matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle=dk?'#06080f':'#f0f4f8'; ctx.fillRect(0,0,W,H)

      const isGalvanic = mode === 'galvanic'

      // ── Electrodes ──
      const ax=W*0.18, bx=W*0.82, ey=H*0.32, eh=H*0.38

      // Anode (oxidation — left)
      const anodeColor = isGalvanic ? '#e74c3c' : '#3b82f6'
      ctx.fillStyle=anodeColor; ctx.fillRect(ax-12,ey-eh/2,24,eh)
      ctx.strokeStyle=dk?'rgba(255,255,255,.2)':'rgba(0,0,0,.2)'; ctx.lineWidth=1
      ctx.strokeRect(ax-12,ey-eh/2,24,eh)
      ctx.font='bold 11px monospace'; ctx.fillStyle='#fff'; ctx.textAlign='center'
      ctx.fillText(isGalvanic?'Zn':'C',ax,ey+4)
      ctx.fillText('Anode',ax,ey+eh/2+20)
      ctx.fillText('(−)',ax,ey+eh/2+34)
      ctx.fillStyle=anodeColor; ctx.font='10px monospace'
      ctx.fillText('Oxidation',ax,ey-eh/2-8)

      // Cathode (reduction — right)
      const cathodeColor = isGalvanic ? '#3b82f6' : '#e74c3c'
      ctx.fillStyle=cathodeColor; ctx.fillRect(bx-12,ey-eh/2,24,eh)
      ctx.strokeStyle=dk?'rgba(255,255,255,.2)':'rgba(0,0,0,.2)'
      ctx.strokeRect(bx-12,ey-eh/2,24,eh)
      ctx.fillStyle='#fff'; ctx.font='bold 11px monospace'
      ctx.fillText(isGalvanic?'Cu':'Cu',bx,ey+4)
      ctx.fillText('Cathode',bx,ey+eh/2+20)
      ctx.fillText('(+)',bx,ey+eh/2+34)
      ctx.fillStyle=cathodeColor; ctx.font='10px monospace'
      ctx.fillText('Reduction',bx,ey-eh/2-8)
      ctx.textAlign='left'

      // ── Beakers / electrolyte ──
      const beakerW=W*0.25
      // Left beaker
      ctx.strokeStyle=dk?'rgba(255,255,255,.2)':'rgba(0,0,0,.2)'; ctx.lineWidth=1.5
      ctx.strokeRect(ax-beakerW/2,ey-eh/2,beakerW,eh+40)
      ctx.fillStyle='rgba(30,80,200,.12)'; ctx.fillRect(ax-beakerW/2+1,ey-eh/2+1,beakerW-2,eh+38)
      ctx.font='10px monospace'; ctx.fillStyle='rgba(100,150,255,.7)'; ctx.textAlign='center'
      ctx.fillText(isGalvanic?'ZnSO₄':'CuSO₄',ax,ey+eh/2+50)

      // Right beaker
      ctx.strokeStyle=dk?'rgba(255,255,255,.2)':'rgba(0,0,0,.2)'
      ctx.strokeRect(bx-beakerW/2,ey-eh/2,beakerW,eh+40)
      ctx.fillStyle='rgba(30,160,80,.1)'; ctx.fillRect(bx-beakerW/2+1,ey-eh/2+1,beakerW-2,eh+38)
      ctx.fillStyle='rgba(100,200,100,.7)'; ctx.font='10px monospace'
      ctx.fillText('CuSO₄',bx,ey+eh/2+50); ctx.textAlign='left'

      // ── Salt bridge ──
      const sbY=ey-eh/2+20, sbX0=ax+beakerW/2, sbX1=bx-beakerW/2
      ctx.strokeStyle=dk?'rgba(255,220,0,.5)':'rgba(180,140,0,.5)'; ctx.lineWidth=8
      ctx.strokeRect(sbX0,sbY,sbX1-sbX0,20)
      ctx.font='10px monospace'; ctx.fillStyle='rgba(255,220,0,.6)'; ctx.textAlign='center'
      ctx.fillText('Salt bridge (KCl/KNO₃)',(sbX0+sbX1)/2,sbY-5); ctx.textAlign='left'

      // ── External wire ──
      const wireY=ey-eh/2-30
      ctx.beginPath()
      ctx.moveTo(ax,ey-eh/2); ctx.lineTo(ax,wireY)
      ctx.lineTo(W/2,wireY-20); ctx.lineTo(bx,wireY); ctx.lineTo(bx,ey-eh/2)
      ctx.strokeStyle=dk?'rgba(255,255,255,.5)':'rgba(0,0,0,.4)'; ctx.lineWidth=2; ctx.stroke()

      // Battery/voltmeter symbol
      ctx.beginPath(); ctx.arc(W/2,wireY-30,18,0,2*Math.PI)
      ctx.fillStyle=dk?'#1a1f2a':'#e8e8e8'; ctx.fill()
      ctx.strokeStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.2)'; ctx.lineWidth=1; ctx.stroke()
      ctx.font='bold 10px monospace'; ctx.fillStyle=dk?'#fff':'#000'; ctx.textAlign='center'
      ctx.fillText(isGalvanic?`${voltage}V`:'EMF',W/2,wireY-26)
      ctx.textAlign='left'

      // ── Animated electrons (external circuit) ──
      const numE=8
      for (let i=0;i<numE;i++) {
        const phase = ((tRef.current*0.04 + i/numE) % 1)
        let ex, ey2
        const dir = isGalvanic ? phase : 1-phase
        if (dir<0.2)      { ex=ax+(dir/0.2)*(W/2-ax); ey2=wireY+(wireY-30-wireY)*dir/0.2 }
        else if (dir<0.4) { ex=W/2+(dir-0.2)/0.2*(bx-W/2); ey2=(wireY-30)+(wireY-(wireY-30))*(dir-0.2)/0.2 }
        else               { ex=bx; ey2=wireY }

        if (isFinite(ex)&&isFinite(ey2)) {
          ctx.beginPath(); ctx.arc(ex, ey2, 4, 0, 2*Math.PI)
          ctx.shadowBlur=8; ctx.shadowColor='rgba(255,220,50,.8)'
          ctx.fillStyle='#ffe040'; ctx.fill(); ctx.shadowBlur=0
          ctx.font='8px monospace'; ctx.fillStyle='rgba(255,220,50,.7)'; ctx.textAlign='center'
          ctx.fillText('e⁻',ex,ey2-6); ctx.textAlign='left'
        }
      }

      // ── Animated ions in solution ──
      for (let i=0;i<6;i++) {
        const phase=(tRef.current*0.02+i*0.16)%1
        // Cations (Zn²⁺) moving right in left beaker
        const ionX=ax-beakerW/2+10+phase*(beakerW-20)
        const ionY=ey+10+Math.sin(phase*Math.PI)*20
        ctx.beginPath(); ctx.arc(ionX,ionY,5,0,2*Math.PI)
        ctx.fillStyle='rgba(255,150,100,.7)'; ctx.fill()
        ctx.font='8px monospace'; ctx.fillStyle='rgba(255,150,100,.8)'; ctx.textAlign='center'
        ctx.fillText('Zn²⁺',ionX,ionY-7); ctx.textAlign='left'
      }

      // ── Info ──
      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.35)':'rgba(0,0,0,.3)'
      if (isGalvanic) {
        ctx.fillText('Galvanic cell: Chemical → Electrical energy',12,H-38)
        ctx.fillText('Anode: Zn → Zn²⁺ + 2e⁻  (oxidation)',12,H-22)
        ctx.fillText('Cathode: Cu²⁺ + 2e⁻ → Cu  (reduction)',12,H-6)
      } else {
        ctx.fillText('Electrolytic cell: Electrical → Chemical energy',12,H-38)
        ctx.fillText('Cathode (−): Cu²⁺ + 2e⁻ → Cu  (reduction)',12,H-22)
        ctx.fillText('Anode (+): H₂O → O₂ + H⁺ + e⁻  (oxidation)',12,H-6)
      }

      if (runRef.current) tRef.current += 0.8
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [mode, voltage])

  return (
    <div>
      <div className="flex gap-2 items-center mb-3">
        <span style={{ fontSize:12, color:'var(--t3)' }}>Cell type:</span>
        {['galvanic','electrolytic'].map(m=>(
          <button key={m} onClick={()=>setMode(m)}
            style={{ padding:'5px 14px', borderRadius:8, fontSize:12, cursor:'pointer',
              textTransform:'capitalize',
              background:mode===m?'rgba(0,212,255,.15)':'var(--surface)',
              border:`1px solid ${mode===m?'rgba(0,212,255,.4)':'var(--border)'}`,
              color:mode===m?'var(--cyan)':'var(--t3)' }}>
            {m}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} style={{ width:'100%', height:420, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
    </div>
  )
})

export default ElectrochemistrySimulation
