import { useEffect, useRef, forwardRef, useState } from 'react'

const ELEMENTS = [
  {z:1,sym:'H',name:'Hydrogen',shells:[1]},
  {z:2,sym:'He',name:'Helium',shells:[2]},
  {z:3,sym:'Li',name:'Lithium',shells:[2,1]},
  {z:6,sym:'C',name:'Carbon',shells:[2,4]},
  {z:7,sym:'N',name:'Nitrogen',shells:[2,5]},
  {z:8,sym:'O',name:'Oxygen',shells:[2,6]},
  {z:10,sym:'Ne',name:'Neon',shells:[2,8]},
  {z:11,sym:'Na',name:'Sodium',shells:[2,8,1]},
  {z:17,sym:'Cl',name:'Chlorine',shells:[2,8,7]},
  {z:18,sym:'Ar',name:'Argon',shells:[2,8,8]},
  {z:19,sym:'K',name:'Potassium',shells:[2,8,8,1]},
  {z:20,sym:'Ca',name:'Calcium',shells:[2,8,8,2]},
]

const AtomicStructureSimulation = forwardRef(function AtomicStructureSimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)
  const [selZ, setSelZ] = useState(parseInt(variables?.atomic_number || 6))

  const elem = ELEMENTS.find(e=>e.z===selZ) || ELEMENTS[2]

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current); tRef.current = 0

    const draw = () => {
      const W=cv.offsetWidth, H=420; cv.width=W; cv.height=H
      const ctx=cv.getContext('2d')
      const dk=matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle=dk?'#06080f':'#f0f4f8'; ctx.fillRect(0,0,W,H)

      const cx=W*0.35, cy=H/2
      const shellColors=['#00d4ff','#f5a623','#2ecc71','#9b59b6','#e74c3c']

      // Nucleus
      const nucR=18+elem.z*0.3
      const ng=ctx.createRadialGradient(cx-4,cy-4,2,cx,cy,nucR)
      ng.addColorStop(0,'#ff8080'); ng.addColorStop(1,'#cc2200')
      ctx.beginPath(); ctx.arc(cx,cy,nucR,0,2*Math.PI)
      ctx.shadowBlur=20; ctx.shadowColor='rgba(255,80,0,.6)'
      ctx.fillStyle=ng; ctx.fill(); ctx.shadowBlur=0
      ctx.font=`bold ${Math.max(10,14-elem.z*0.1)}px monospace`
      ctx.fillStyle='#fff'; ctx.textAlign='center'
      ctx.fillText(elem.sym, cx, cy-3)
      ctx.font='9px monospace'
      ctx.fillText(`Z=${elem.z}`, cx, cy+9)
      ctx.textAlign='left'

      // Electron shells
      elem.shells.forEach((count, si) => {
        const r = (si+1)*(40+elem.z*0.5)
        if (cx-r<10||cx+r>W*0.62) return

        // Shell circle
        ctx.beginPath(); ctx.arc(cx,cy,r,0,2*Math.PI)
        ctx.strokeStyle=`${shellColors[si]}30`; ctx.lineWidth=1; ctx.stroke()

        // Shell label
        ctx.font='9px monospace'; ctx.fillStyle=`${shellColors[si]}60`
        ctx.textAlign='center'; ctx.fillText(`n=${si+1}`,cx+r,cy-4); ctx.textAlign='left'

        // Electrons on this shell
        for (let ei=0; ei<count; ei++) {
          const baseAngle = (ei/count)*2*Math.PI
          const animSpeed = 0.8/(si+1)
          const angle = baseAngle + (runRef.current ? tRef.current*animSpeed : tRef.current*animSpeed)
          const ex=cx+r*Math.cos(angle), ey=cy+r*Math.sin(angle)

          ctx.beginPath(); ctx.arc(ex,ey,5,0,2*Math.PI)
          ctx.shadowBlur=8; ctx.shadowColor=shellColors[si]+'80'
          ctx.fillStyle=shellColors[si]; ctx.fill(); ctx.shadowBlur=0

          // Electron label
          if (count<=4) {
            ctx.font='8px monospace'; ctx.fillStyle=shellColors[si]+'90'
            ctx.textAlign='center'; ctx.fillText('e⁻',ex,ey-8); ctx.textAlign='left'
          }
        }
      })

      // ── RIGHT: Element info + electron configuration ──
      const rx=W*0.62
      ctx.font='bold 18px monospace'; ctx.fillStyle=dk?'#fff':'#000'
      ctx.fillText(`${elem.sym} — ${elem.name}`,rx,40)
      ctx.font='13px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.6)':'rgba(0,0,0,.55)'
      ctx.fillText(`Atomic number: ${elem.z}`,rx,64)
      ctx.fillText(`Mass number: ~${elem.z*2} amu`,rx,82)
      ctx.fillText(`Electrons: ${elem.z}`,rx,100)
      ctx.fillText(`Protons: ${elem.z}`,rx,118)
      ctx.fillText(`Neutrons: ~${elem.z}`,rx,136)

      // Electron configuration
      ctx.font='bold 12px monospace'; ctx.fillStyle=dk?'rgba(0,212,255,.8)':'rgba(0,80,180,.7)'
      ctx.fillText('Electron configuration:',rx,164)
      const shells=['K','L','M','N','O']
      let config=''; elem.shells.forEach((c,i)=>{ config+=`${shells[i]}(${c}) ` })
      ctx.font='13px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.7)':'rgba(0,0,0,.6)'
      ctx.fillText(config.trim(),rx,182)

      // Valence electrons
      const valence=elem.shells[elem.shells.length-1]
      ctx.font='bold 12px monospace'
      ctx.fillStyle=valence===8||elem.z===2?'rgba(46,204,113,.9)':'rgba(245,166,35,.9)'
      ctx.fillText(`Valence electrons: ${valence}`,rx,208)
      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.4)':'rgba(0,0,0,.4)'
      if (valence===8||elem.z===2) ctx.fillText('Noble gas — stable configuration',rx,226)
      else if (valence<=3) ctx.fillText('Metal-like — loses electrons easily',rx,226)
      else ctx.fillText('Non-metal — gains electrons easily',rx,226)

      // Periods & Groups
      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.3)'
      ctx.fillText(`Period: ${elem.shells.length}   Group: ${valence}`,rx,252)

      // Energy levels  E_n = -13.6/n² eV
      ctx.font='bold 12px monospace'; ctx.fillStyle=dk?'rgba(155,89,182,.8)':'rgba(100,20,160,.7)'
      ctx.fillText('Energy levels:',rx,280)
      for (let n=1;n<=elem.shells.length;n++) {
        const E=-13.6/(n*n)
        ctx.font='11px monospace'; ctx.fillStyle=dk?`rgba(255,255,255,${0.2+n*0.1})`:`rgba(0,0,0,${0.2+n*0.1})`
        ctx.fillText(`n=${n}: E = ${E.toFixed(2)} eV`,rx+8,280+n*16)
      }

      if (runRef.current) tRef.current += 0.025
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [selZ, elem])

  return (
    <div>
      <div className="flex gap-2 items-center mb-3 flex-wrap">
        <span style={{ fontSize:12, color:'var(--t3)' }}>Element:</span>
        {ELEMENTS.map(e => (
          <button key={e.z} onClick={()=>setSelZ(e.z)}
            style={{ padding:'4px 10px', borderRadius:8, fontSize:12, cursor:'pointer',
              background:selZ===e.z?'rgba(0,212,255,.18)':'var(--surface)',
              border:`1px solid ${selZ===e.z?'rgba(0,212,255,.45)':'var(--border)'}`,
              color:selZ===e.z?'#00d4ff':'var(--t3)', fontFamily:'var(--mono)', fontWeight:600 }}>
            {e.sym}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} style={{ width:'100%', height:420, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
    </div>
  )
})

export default AtomicStructureSimulation
