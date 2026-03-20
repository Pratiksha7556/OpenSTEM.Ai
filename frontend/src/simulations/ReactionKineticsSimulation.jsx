import { useEffect, useRef, forwardRef, useState } from 'react'

const ReactionKineticsSimulation = forwardRef(function ReactionKineticsSimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)
  const [order,   setOrder]   = useState(1)
  const [k,       setK]       = useState(0.1)
  const [showEa,  setShowEa]  = useState(true)

  const Ea = parseFloat(variables?.activation_energy || 50000) // J/mol
  const R  = 8.314

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current); tRef.current = 0

    const draw = () => {
      const W = cv.offsetWidth, H = 420; cv.width = W; cv.height = H
      const ctx = cv.getContext('2d')
      const dk  = matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle = dk ? '#0a0d14' : '#f8f8f6'; ctx.fillRect(0, 0, W, H)

      // ── LEFT: Concentration vs Time ──
      const gx=40, gy=20, gw=(W-80)/2, gh=160
      ctx.strokeStyle=dk?'rgba(255,255,255,.15)':'rgba(0,0,0,.12)'; ctx.lineWidth=1
      ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx,gy+gh); ctx.lineTo(gx+gw,gy+gh); ctx.stroke()
      ctx.font='10px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.4)':'rgba(0,0,0,.4)'
      ctx.fillText('[A] vs Time',gx,gy-6)
      ctx.fillText('t →',gx+gw-20,gy+gh+14)
      ctx.fillText('[A]↑',gx-24,gy+8)

      // Concentration curves for different orders
      const tMax=30, C0=1.0
      const conc = (t) => {
        if (order===0) return Math.max(0, C0 - k*t)
        if (order===1) return C0*Math.exp(-k*t)
        if (order===2) return C0/(1+k*C0*t)
        return C0
      }

      ctx.beginPath()
      for (let px=0; px<=gw; px++) {
        const t = (px/gw)*tMax
        const c = conc(t)
        const y = gy+gh - c*gh*0.9
        px===0 ? ctx.moveTo(gx+px,y) : ctx.lineTo(gx+px,y)
      }
      ctx.strokeStyle='#00d4ff'; ctx.lineWidth=2.5; ctx.stroke()

      // Moving point
      const animT = (tRef.current/100)*tMax
      const animC = conc(animT)
      const animPx = gx+(animT/tMax)*gw, animPy=gy+gh-animC*gh*0.9
      ctx.beginPath(); ctx.arc(animPx,animPy,5,0,2*Math.PI)
      ctx.shadowBlur=10; ctx.shadowColor='rgba(0,212,255,.8)'
      ctx.fillStyle='#00d4ff'; ctx.fill(); ctx.shadowBlur=0
      ctx.font='10px monospace'; ctx.fillStyle='rgba(0,212,255,.8)'
      ctx.fillText(`[A]=${animC.toFixed(3)}`,animPx+6,animPy-6)

      // Half-life line
      const t_half = order===1 ? Math.log(2)/k : order===0 ? C0/(2*k) : 1/(k*C0)
      const half_x = gx+(t_half/tMax)*gw
      if (half_x < gx+gw) {
        ctx.setLineDash([3,3])
        ctx.beginPath(); ctx.moveTo(half_x,gy); ctx.lineTo(half_x,gy+gh)
        ctx.strokeStyle='rgba(245,166,35,.5)'; ctx.lineWidth=1; ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle='rgba(245,166,35,.7)'; ctx.font='9px monospace'
        ctx.fillText(`t½=${t_half.toFixed(1)}`,half_x+3,gy+20)
      }

      // Order label
      const orderLabels={0:'Zero order: [A]=[A]₀−kt',1:'First order: [A]=[A]₀e^(−kt)',2:'Second order: 1/[A]=1/[A]₀+kt'}
      ctx.font='10px monospace'; ctx.fillStyle='rgba(0,212,255,.7)'
      ctx.fillText(orderLabels[order],gx,gy+gh+28)

      // ── RIGHT: Arrhenius / Energy profile ──
      const ex=W/2+20, ey2=20, ew=W/2-30, eh=160

      if (showEa) {
        // Energy profile diagram (reaction coordinate)
        ctx.strokeStyle=dk?'rgba(255,255,255,.15)':'rgba(0,0,0,.12)'; ctx.lineWidth=1
        ctx.beginPath(); ctx.moveTo(ex,ey2); ctx.lineTo(ex,ey2+eh); ctx.lineTo(ex+ew,ey2+eh); ctx.stroke()
        ctx.font='10px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.4)':'rgba(0,0,0,.4)'
        ctx.fillText('Energy profile',ex,ey2-6)
        ctx.fillText('Reaction coordinate →',ex+ew*0.3,ey2+eh+14)

        const reactE=eh*0.75, prodE=eh*0.45, tsE=eh*0.08
        // Draw energy profile curve
        ctx.beginPath()
        for (let px=0; px<=ew; px++) {
          const x=px/ew
          // Bezier-like shape: reactants → TS → products
          let e
          if (x<0.1) e=reactE
          else if (x<0.4) e=reactE-(reactE-tsE)*((x-0.1)/0.3)
          else if (x<0.6) e=tsE+(prodE-tsE)*((x-0.4)/0.2)
          else e=prodE
          const y=ey2+e
          px===0?ctx.moveTo(ex,y):ctx.lineTo(ex+px,y)
        }
        ctx.strokeStyle='#e74c3c'; ctx.lineWidth=2.5; ctx.stroke()

        // Labels
        ctx.font='10px monospace'
        ctx.fillStyle='rgba(46,204,113,.8)'; ctx.fillText('Reactants',ex+4,ey2+reactE)
        ctx.fillStyle='rgba(255,100,80,.8)'; ctx.fillText('Transition\nstate',ex+ew*0.35,ey2+tsE-8)
        ctx.fillStyle='rgba(100,150,255,.8)'; ctx.fillText('Products',ex+ew*0.75,ey2+prodE)

        // Ea arrow
        ctx.beginPath(); ctx.moveTo(ex+ew*0.2,ey2+reactE); ctx.lineTo(ex+ew*0.2,ey2+tsE)
        ctx.strokeStyle='rgba(245,166,35,.7)'; ctx.lineWidth=1.5; ctx.stroke()
        ctx.fillStyle='rgba(245,166,35,.8)'; ctx.font='bold 10px monospace'
        ctx.fillText(`Ea=${(Ea/1000).toFixed(0)}kJ`,ex+ew*0.2+4,(ey2+reactE+ey2+tsE)/2)

        // ΔH arrow
        ctx.beginPath(); ctx.moveTo(ex+ew*0.85,ey2+reactE); ctx.lineTo(ex+ew*0.85,ey2+prodE)
        ctx.strokeStyle='rgba(0,212,255,.7)'; ctx.lineWidth=1.5; ctx.stroke()
        ctx.fillStyle='rgba(0,212,255,.8)'; ctx.font='10px monospace'
        ctx.fillText('ΔH<0',ex+ew*0.85+3,(ey2+reactE+ey2+prodE)/2)
      }

      // ── Rate law and k table ──
      const temps=[300,400,500,600,700]
      const A=1e13
      ctx.font='bold 11px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.5)':'rgba(0,0,0,.45)'
      ctx.fillText('Arrhenius: k = Ae^(−Ea/RT)',ex,ey2+eh+30)
      ctx.font='10px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.35)':'rgba(0,0,0,.3)'
      ctx.fillText('T(K)   k(s⁻¹)',ex,ey2+eh+46)
      temps.forEach((T,i)=>{
        const kVal=A*Math.exp(-Ea/(R*T))
        ctx.fillText(`${T}K  ${kVal.toExponential(2)}`,ex+8,ey2+eh+60+i*14)
      })

      // ── Bottom: rate laws ──
      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.35)':'rgba(0,0,0,.3)'
      ctx.fillText('Rate = k[A]ⁿ  |  t½(1st) = ln2/k  |  t½(2nd) = 1/k[A]₀',30,H-8)

      if (runRef.current && tRef.current < 100) tRef.current += 0.4
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [order, k, showEa, Ea])

  return (
    <div>
      <div className="flex gap-2 items-center mb-3 flex-wrap">
        <span style={{ fontSize:12, color:'var(--t3)' }}>Reaction order:</span>
        {[0,1,2].map(o=>(
          <button key={o} onClick={()=>{setOrder(o);tRef.current=0}}
            style={{ padding:'4px 12px', borderRadius:8, fontSize:12, cursor:'pointer',
              background:order===o?'rgba(0,212,255,.15)':'var(--surface)',
              border:`1px solid ${order===o?'rgba(0,212,255,.4)':'var(--border)'}`,
              color:order===o?'#00d4ff':'var(--t3)', fontFamily:'var(--mono)' }}>
            {o}{'ˢᵗⁿᵈ'[o] || 'rd'}
          </button>
        ))}
        <span style={{ fontSize:12, color:'var(--t3)', marginLeft:8 }}>k:</span>
        <input type="range" min="0.01" max="0.5" step="0.01" value={k}
          onChange={e=>{setK(+e.target.value);tRef.current=0}} style={{ width:80 }}/>
        <code style={{ fontSize:11, color:'var(--cyan)', fontFamily:'var(--mono)', minWidth:40 }}>{k}</code>
        <button onClick={()=>setShowEa(s=>!s)}
          style={{ padding:'4px 10px', borderRadius:8, fontSize:11, cursor:'pointer',
            background:showEa?'rgba(245,166,35,.15)':'var(--surface)',
            border:`1px solid ${showEa?'rgba(245,166,35,.4)':'var(--border)'}`,
            color:showEa?'#f5a623':'var(--t3)' }}>
          {showEa?'Hide':'Show'} Energy profile
        </button>
      </div>
      <canvas ref={canvasRef} style={{ width:'100%', height:420, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
    </div>
  )
})

export default ReactionKineticsSimulation
