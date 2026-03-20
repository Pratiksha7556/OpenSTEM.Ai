import { useEffect, useRef, forwardRef, useState } from 'react'

const ChemicalEquilibriumSimulation = forwardRef(function ChemicalEquilibriumSimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)
  const [perturb, setPerturb] = useState(null)

  const Kc = parseFloat(variables?.kc || 4.0)

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current); tRef.current = 0

    // Molecule counts
    let reactants = 60, products = 0, equilibrium = false

    const draw = () => {
      const W=cv.offsetWidth, H=420; cv.width=W; cv.height=H
      const ctx=cv.getContext('2d')
      const dk=matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle=dk?'#06080f':'#f0f4f8'; ctx.fillRect(0,0,W,H)

      const t = tRef.current
      // Sigmoid approach to equilibrium
      const progress = 1 / (1 + Math.exp(-0.1*(t-40)))
      const eqR=100/(1+Kc), eqP=100-eqR
      const curR = 100 - progress*(100-eqR)
      const curP = progress*eqP

      // ── TOP: Concentration-time graph ──
      const gx=30, gy=20, gw=W-60, gh=160
      ctx.strokeStyle=dk?'rgba(255,255,255,.15)':'rgba(0,0,0,.12)'; ctx.lineWidth=1
      ctx.strokeRect(gx,gy,gw,gh)
      // Grid lines
      for (let i=1;i<5;i++) {
        ctx.beginPath(); ctx.moveTo(gx+i*gw/5,gy); ctx.lineTo(gx+i*gw/5,gy+gh); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(gx,gy+i*gh/5); ctx.lineTo(gx+gw,gy+i*gh/5); ctx.stroke()
      }

      // Draw reactant curve
      ctx.beginPath()
      for (let px=0;px<=gw;px++) {
        const tp=px/gw*100
        const prog=1/(1+Math.exp(-0.1*(tp-40)))
        const y=gy+gh-(100-prog*(100-eqR))/100*gh
        px===0?ctx.moveTo(gx,y):ctx.lineTo(gx+px,y)
      }
      ctx.strokeStyle='#e74c3c'; ctx.lineWidth=2; ctx.stroke()

      // Draw product curve
      ctx.beginPath()
      for (let px=0;px<=gw;px++) {
        const tp=px/gw*100
        const prog=1/(1+Math.exp(-0.1*(tp-40)))
        const y=gy+gh-prog*eqP/100*gh
        px===0?ctx.moveTo(gx,y):ctx.lineTo(gx+px,y)
      }
      ctx.strokeStyle='#2ecc71'; ctx.lineWidth=2; ctx.stroke()

      // Current position marker
      const tCapped=Math.min(t,100)
      const markerX=gx+tCapped/100*gw
      ctx.setLineDash([3,3])
      ctx.beginPath(); ctx.moveTo(markerX,gy); ctx.lineTo(markerX,gy+gh)
      ctx.strokeStyle='rgba(0,212,255,.5)'; ctx.lineWidth=1.5; ctx.stroke(); ctx.setLineDash([])

      // Axis labels
      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.5)':'rgba(0,0,0,.45)'
      ctx.fillText('Concentration',gx,gy-6)
      ctx.fillText('Time →',gx+gw-40,gy+gh+14)
      ctx.fillStyle='#e74c3c'; ctx.fillText('Reactants',gx+6,gy+14)
      ctx.fillStyle='#2ecc71'; ctx.fillText('Products',gx+gw*0.3,gy+gh-8)

      // Equilibrium line
      if (t > 50) {
        ctx.setLineDash([5,5])
        ctx.beginPath(); ctx.moveTo(markerX,gy); ctx.lineTo(gx+gw,gy)
        ctx.strokeStyle='rgba(0,212,255,.3)'; ctx.lineWidth=1; ctx.stroke(); ctx.setLineDash([])
        ctx.font='10px monospace'; ctx.fillStyle='rgba(0,212,255,.6)'
        ctx.fillText('Equilibrium',gx+gw*0.7,gy+12)
      }

      // ── MIDDLE: Molecule container ──
      const bx=30, by=200, bw=W-60, bh=140
      ctx.strokeStyle=dk?'rgba(255,255,255,.2)':'rgba(0,0,0,.2)'; ctx.lineWidth=1.5
      ctx.strokeRect(bx,by,bw/2-5,bh)
      ctx.strokeRect(bx+bw/2+5,by,bw/2-5,bh)

      ctx.font='11px monospace'; ctx.fillStyle=dk?'rgba(255,100,80,.8)':'rgba(180,30,10,.7)'
      ctx.textAlign='center'; ctx.fillText(`Reactants: ${Math.round(curR)}%`,bx+bw/4,by-5)
      ctx.fillStyle=dk?'rgba(46,204,113,.8)':'rgba(0,120,50,.7)'
      ctx.fillText(`Products: ${Math.round(curP)}%`,bx+3*bw/4,by-5)
      ctx.textAlign='left'

      // Draw reactant molecules
      const nR=Math.round(curR/100*24)
      for (let i=0;i<nR;i++) {
        const mx=bx+10+(i%8)*(bw/2-20)/8, my=by+20+Math.floor(i/8)*40
        const bounce=runRef.current?Math.sin(tRef.current*2+i*0.7)*4:0
        ctx.beginPath(); ctx.arc(mx,my+bounce,8,0,2*Math.PI)
        ctx.shadowBlur=8; ctx.shadowColor='rgba(231,76,60,.6)'
        ctx.fillStyle='#e74c3c'; ctx.fill(); ctx.shadowBlur=0
        ctx.font='8px monospace'; ctx.fillStyle='#fff'; ctx.textAlign='center'
        ctx.fillText('A',mx,my+bounce+3); ctx.textAlign='left'
      }

      // Draw product molecules
      const nP=Math.round(curP/100*24)
      for (let i=0;i<nP;i++) {
        const mx=bx+bw/2+15+(i%8)*(bw/2-20)/8, my=by+20+Math.floor(i/8)*40
        const bounce=runRef.current?Math.sin(tRef.current*2+i*0.9+1)*4:0
        ctx.beginPath(); ctx.arc(mx,my+bounce,8,0,2*Math.PI)
        ctx.shadowBlur=8; ctx.shadowColor='rgba(46,204,113,.6)'
        ctx.fillStyle='#2ecc71'; ctx.fill(); ctx.shadowBlur=0
        ctx.font='8px monospace'; ctx.fillStyle='#fff'; ctx.textAlign='center'
        ctx.fillText('B',mx,my+bounce+3); ctx.textAlign='left'
      }

      // ── BOTTOM: Kc info ──
      ctx.font='12px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.5)':'rgba(0,0,0,.45)'
      ctx.fillText(`Kc = [Products]/[Reactants] = ${Kc}`,30,H-40)
      ctx.fillText(`At equilibrium: [R]=${eqR.toFixed(1)}%  [P]=${eqP.toFixed(1)}%`,30,H-22)
      ctx.fillText(`Qc ${curP/curR<Kc/1?'<':'>'} Kc → reaction proceeds ${curP/curR<Kc/1?'forward':'backward'}`,30,H-6)

      if (runRef.current && t<100) tRef.current += 0.3
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [Kc, perturb])

  return (
    <div>
      <div className="flex gap-2 items-center mb-3 flex-wrap">
        <span style={{ fontSize:12, color:'var(--t3)' }}>Le Chatelier perturbation:</span>
        {['Add reactant','Add product','Increase T','Decrease V'].map(p=>(
          <button key={p} onClick={()=>{ setPerturb(p); tRef.current=0 }}
            style={{ padding:'4px 10px', borderRadius:8, fontSize:11, cursor:'pointer',
              background:'var(--surface)', border:'1px solid var(--border)',
              color:'var(--t3)' }}>{p}</button>
        ))}
        <button onClick={()=>{ setPerturb(null); tRef.current=0 }}
          style={{ padding:'4px 10px', borderRadius:8, fontSize:11, cursor:'pointer',
            background:'rgba(0,212,255,.1)', border:'1px solid rgba(0,212,255,.3)', color:'var(--cyan)' }}>
          Reset
        </button>
      </div>
      <canvas ref={canvasRef} style={{ width:'100%', height:420, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
    </div>
  )
})

export default ChemicalEquilibriumSimulation
