import { useEffect, useRef, forwardRef, useState } from 'react'

const StatisticsSimulation = forwardRef(function StatisticsSimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)
  const [dataset, setDataset] = useState('2,4,4,4,5,5,7,9')

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  const parseData = (s) => {
    try {
      return s.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x))
    } catch { return [2,4,4,4,5,5,7,9] }
  }

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current); tRef.current = 0

    const draw = () => {
      const W = cv.offsetWidth, H = 420; cv.width = W; cv.height = H
      const ctx = cv.getContext('2d')
      const dk  = matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle = dk ? '#0a0d14' : '#f8f8f6'; ctx.fillRect(0, 0, W, H)

      const data = parseData(dataset)
      if (data.length < 2) { animRef.current = requestAnimationFrame(draw); return }

      // Stats calculations
      const n    = data.length
      const sum  = data.reduce((a,b) => a+b, 0)
      const mean = sum / n
      const sorted = [...data].sort((a,b) => a-b)
      const median = n%2===0 ? (sorted[n/2-1]+sorted[n/2])/2 : sorted[Math.floor(n/2)]
      const freq = {}; data.forEach(x => freq[x]=(freq[x]||0)+1)
      const mode = Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0]
      const variance = data.reduce((a,x) => a+(x-mean)**2, 0) / n
      const std  = Math.sqrt(variance)
      const min  = sorted[0], max = sorted[n-1]

      // ── TOP: Histogram ──
      const hx=40, hy=30, hw=W-80, hh=160
      const bins = 8
      const binW = (max-min)/bins || 1
      const binCounts = Array(bins).fill(0)
      data.forEach(x => { const b = Math.min(Math.floor((x-min)/binW),bins-1); binCounts[b]++ })
      const maxCount = Math.max(...binCounts, 1)

      // Animate bars growing
      const fillPct = Math.min(tRef.current / 40, 1)

      ctx.strokeStyle = dk?'rgba(255,255,255,.1)':'rgba(0,0,0,.1)'; ctx.lineWidth=1
      ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hx,hy+hh); ctx.lineTo(hx+hw,hy+hh); ctx.stroke()

      binCounts.forEach((c,i) => {
        const bh = (c/maxCount)*hh*fillPct
        const bx = hx + i*(hw/bins), bw2 = hw/bins-2
        const bColor = i===Math.floor((mean-min)/binW) ? '#00d4ff' : 'rgba(0,212,255,.45)'
        ctx.fillStyle = bColor
        ctx.fillRect(bx+1, hy+hh-bh, bw2, bh)
        ctx.strokeStyle = 'rgba(0,212,255,.3)'; ctx.lineWidth=1
        ctx.strokeRect(bx+1, hy+hh-bh, bw2, bh)
        if (c>0) {
          ctx.font='10px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.5)':'rgba(0,0,0,.4)'
          ctx.textAlign='center'; ctx.fillText(c, bx+bw2/2+1, hy+hh-bh-4)
        }
        ctx.fillStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.3)'; ctx.textAlign='center'
        ctx.fillText((min+i*binW).toFixed(1), bx+bw2/2+1, hy+hh+14)
      })
      ctx.textAlign='left'

      // Mean line
      const meanPx = hx + (mean-min)/(max-min+0.001)*hw
      ctx.beginPath(); ctx.moveTo(meanPx, hy); ctx.lineTo(meanPx, hy+hh)
      ctx.strokeStyle='rgba(255,100,80,.8)'; ctx.lineWidth=2; ctx.setLineDash([4,4]); ctx.stroke()
      ctx.setLineDash([])
      ctx.font='10px monospace'; ctx.fillStyle='rgba(255,100,80,.8)'
      ctx.fillText(`μ=${mean.toFixed(2)}`, meanPx+4, hy+14)

      // Median line
      const medPx = hx + (median-min)/(max-min+0.001)*hw
      ctx.beginPath(); ctx.moveTo(medPx, hy); ctx.lineTo(medPx, hy+hh)
      ctx.strokeStyle='rgba(46,204,113,.8)'; ctx.lineWidth=2; ctx.setLineDash([3,3]); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle='rgba(46,204,113,.8)'
      ctx.fillText(`M=${median.toFixed(2)}`, medPx+4, hy+28)

      // ── MIDDLE: Normal distribution overlay ──
      const nx=40, ny=210, nw=W-80, nh=120
      const nPts = 200
      const gaussian = (x, mu, sig) => Math.exp(-0.5*((x-mu)/sig)**2) / (sig*Math.sqrt(2*Math.PI))

      ctx.beginPath()
      for (let i=0; i<=nPts; i++) {
        const x = min - std*2 + (max-min+std*4)*(i/nPts)
        const y = gaussian(x, mean, std||1)
        const px = nx + (x-(min-std*2))/(max-min+std*4)*nw
        const py = ny + nh - y*nh*std*(std>0?2.5:1)*fillPct
        i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
      }
      ctx.strokeStyle='rgba(155,89,182,.8)'; ctx.lineWidth=2; ctx.stroke()

      // Std deviation bands
      [-2,-1,1,2].forEach(k => {
        const xBand = hx + (mean+k*std-min)/(max-min+0.001)*hw
        if (xBand>=hx && xBand<=hx+hw) {
          ctx.beginPath(); ctx.moveTo(xBand,ny); ctx.lineTo(xBand,ny+nh)
          ctx.strokeStyle=`rgba(155,89,182,${Math.abs(k)===1?0.5:0.25})`; ctx.lineWidth=1
          ctx.setLineDash([2,3]); ctx.stroke(); ctx.setLineDash([])
          ctx.font='9px monospace'; ctx.fillStyle='rgba(155,89,182,.6)'; ctx.textAlign='center'
          ctx.fillText(`${k}σ`, xBand, ny-4)
        }
      })
      ctx.fillStyle='rgba(155,89,182,.5)'; ctx.font='10px monospace'; ctx.textAlign='left'
      ctx.fillText('Normal Distribution (μ ± σ)', nx, ny-8)

      // ── BOTTOM: Stats table ──
      const stats = [
        ['Mean (μ)',    mean.toFixed(3),    '#ef4444'],
        ['Median',      median.toFixed(3),  '#22c55e'],
        ['Mode',        mode,               '#f59e0b'],
        ['Std dev (σ)', std.toFixed(3),     '#8b5cf6'],
        ['Variance',    variance.toFixed(3),'#06b6d4'],
        ['Range',       (max-min).toFixed(3),'#64748b'],
        ['n',           n,                  '#94a3b8'],
      ]
      const colW = (W-40) / stats.length
      stats.forEach((s,i) => {
        ctx.fillStyle=dk?'rgba(255,255,255,.06)':'rgba(0,0,0,.04)'
        ctx.fillRect(20+i*colW, H-70, colW-4, 56)
        ctx.font='10px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.4)':'rgba(0,0,0,.4)'
        ctx.textAlign='center'; ctx.fillText(s[0], 20+i*colW+colW/2-2, H-54)
        ctx.font='bold 13px monospace'; ctx.fillStyle=s[2]
        ctx.fillText(s[1], 20+i*colW+colW/2-2, H-36)
        ctx.textAlign='left'
      })

      if (runRef.current) tRef.current += 0.6
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [dataset])

  return (
    <div>
      <div className="flex gap-2 items-center mb-3">
        <span style={{ fontSize:12, color:'var(--t3)' }}>Data:</span>
        <input value={dataset} onChange={e=>{setDataset(e.target.value);tRef.current=0}}
          placeholder="comma separated values"
          style={{ flex:1, padding:'6px 10px', background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:8, color:'var(--t1)', fontSize:12, fontFamily:'var(--mono)', outline:'none' }}/>
        <button onClick={()=>{setDataset('2,4,4,4,5,5,7,9');tRef.current=0}}
          style={{ padding:'5px 10px', borderRadius:8, fontSize:11, cursor:'pointer',
            background:'var(--surface)', border:'1px solid var(--border)', color:'var(--t3)' }}>Reset</button>
      </div>
      <canvas ref={canvasRef} style={{ width:'100%', height:420, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
    </div>
  )
})

export default StatisticsSimulation
