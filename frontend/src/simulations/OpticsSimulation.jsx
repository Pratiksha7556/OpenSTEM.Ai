import { useEffect, useRef, forwardRef } from 'react'

const OpticsSimulation = forwardRef(function OpticsSimulation({ variables, voicePlaying }, ref) {
  const canvasRef = useRef()
  const animRef   = useRef()
  const tRef      = useRef(0)
  const runRef    = useRef(true)

  const n1  = parseFloat(variables?.n1 || 1.0)    // refractive index medium 1
  const n2  = parseFloat(variables?.n2 || 1.5)    // refractive index medium 2
  const inc = parseFloat(variables?.angle || 40)   // incident angle
  const f   = parseFloat(variables?.focal_length || variables?.length || 80) // focal length px

  useEffect(() => { runRef.current = voicePlaying !== false }, [voicePlaying])

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return
    cancelAnimationFrame(animRef.current); tRef.current = 0; runRef.current = true

    const draw = () => {
      const W=cv.offsetWidth, H=400; cv.width=W; cv.height=H
      const ctx=cv.getContext('2d')
      const dk=matchMedia('(prefers-color-scheme: dark)').matches
      ctx.fillStyle=dk?'#06080f':'#f0f4f8'; ctx.fillRect(0,0,W,H)

      // ── LEFT: Refraction diagram ──
      const iW = W/2 - 10
      const interfaceX = iW/2, interfaceY = H/2

      // Two media
      ctx.fillStyle=dk?'rgba(0,30,80,.4)':'rgba(180,210,255,.3)'
      ctx.fillRect(0, 0, iW, interfaceY)
      ctx.fillStyle=dk?'rgba(0,60,40,.4)':'rgba(180,255,210,.25)'
      ctx.fillRect(0, interfaceY, iW, H-interfaceY)

      // Media labels
      ctx.font='11px monospace'
      ctx.fillStyle=dk?'rgba(100,180,255,.6)':'rgba(0,80,180,.5)'
      ctx.fillText(`n₁ = ${n1}`, 8, 20)
      ctx.fillStyle=dk?'rgba(100,255,160,.6)':'rgba(0,130,60,.5)'
      ctx.fillText(`n₂ = ${n2}`, 8, interfaceY+16)

      // Interface line
      ctx.beginPath(); ctx.moveTo(0,interfaceY); ctx.lineTo(iW,interfaceY)
      ctx.strokeStyle=dk?'rgba(255,255,255,.25)':'rgba(0,0,0,.2)'; ctx.lineWidth=1.5; ctx.stroke()

      // Normal line (dashed)
      ctx.setLineDash([4,4])
      ctx.beginPath(); ctx.moveTo(interfaceX,interfaceY-70); ctx.lineTo(interfaceX,interfaceY+70)
      ctx.strokeStyle=dk?'rgba(255,255,255,.2)':'rgba(0,0,0,.15)'; ctx.lineWidth=1; ctx.stroke()
      ctx.setLineDash([])

      // Incident ray
      const incRad = inc * Math.PI / 180
      const ix0 = interfaceX - 80*Math.sin(incRad), iy0 = interfaceY - 80*Math.cos(incRad)
      ctx.beginPath(); ctx.moveTo(ix0,iy0); ctx.lineTo(interfaceX,interfaceY)
      ctx.strokeStyle='rgba(255,220,50,.9)'; ctx.lineWidth=2; ctx.stroke()

      // Refracted ray (Snell's law: n1 sin θ1 = n2 sin θ2)
      const sinRef = Math.min(n1*Math.sin(incRad)/n2, 1)
      const refRad = Math.asin(sinRef)
      const rx1 = interfaceX + 80*Math.sin(refRad), ry1 = interfaceY + 80*Math.cos(refRad)
      ctx.beginPath(); ctx.moveTo(interfaceX,interfaceY); ctx.lineTo(rx1,ry1)
      ctx.strokeStyle='rgba(50,220,255,.9)'; ctx.lineWidth=2; ctx.stroke()

      // Reflected ray
      const rfx = interfaceX + 80*Math.sin(incRad), rfy = interfaceY - 80*Math.cos(incRad)
      ctx.beginPath(); ctx.moveTo(interfaceX,interfaceY); ctx.lineTo(rfx,rfy)
      ctx.strokeStyle='rgba(255,100,80,.7)'; ctx.lineWidth=1.5; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([])

      // Angle arcs
      ctx.beginPath(); ctx.arc(interfaceX,interfaceY,28,-(Math.PI/2+incRad),-Math.PI/2)
      ctx.strokeStyle='rgba(255,220,50,.5)'; ctx.lineWidth=1.5; ctx.stroke()
      ctx.beginPath(); ctx.arc(interfaceX,interfaceY,28,Math.PI/2,Math.PI/2+refRad)
      ctx.strokeStyle='rgba(50,220,255,.5)'; ctx.lineWidth=1.5; ctx.stroke()

      // Labels
      ctx.font='10px monospace'
      ctx.fillStyle='rgba(255,220,50,.8)'; ctx.fillText(`θ₁=${inc}°`, interfaceX-70, interfaceY-20)
      ctx.fillStyle='rgba(50,220,255,.8)'; ctx.fillText(`θ₂=${Math.round(refRad*180/Math.PI)}°`, interfaceX+8, interfaceY+35)
      ctx.fillStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.3)'
      ctx.fillText("n₁sinθ₁ = n₂sinθ₂  (Snell's Law)", 4, H-8)

      // ── RIGHT: Convex Lens ──
      const lx = W/2 + 10
      const lcx = lx + (W-lx)/2, lcy = H/2

      // Object
      const objX = lcx - 1.5*f, objH = 45
      ctx.beginPath(); ctx.moveTo(objX, lcy); ctx.lineTo(objX, lcy-objH)
      ctx.strokeStyle='rgba(255,220,50,.8)'; ctx.lineWidth=2; ctx.stroke()
      ctx.beginPath(); ctx.moveTo(objX-5, lcy-objH); ctx.lineTo(objX, lcy-objH-8); ctx.lineTo(objX+5, lcy-objH)
      ctx.fillStyle='rgba(255,220,50,.8)'; ctx.fill()
      ctx.font='10px monospace'; ctx.fillStyle='rgba(255,220,50,.6)'; ctx.fillText('O', objX-14, lcy-objH/2)

      // Principal axis
      ctx.beginPath(); ctx.moveTo(lx, lcy); ctx.lineTo(W, lcy)
      ctx.strokeStyle=dk?'rgba(255,255,255,.2)':'rgba(0,0,0,.15)'; ctx.lineWidth=1; ctx.stroke()

      // Lens
      ctx.beginPath()
      ctx.moveTo(lcx, lcy-70); ctx.bezierCurveTo(lcx+20,lcy-30, lcx+20,lcy+30, lcx,lcy+70)
      ctx.bezierCurveTo(lcx-20,lcy+30, lcx-20,lcy-30, lcx,lcy-70)
      ctx.strokeStyle='rgba(100,200,255,.7)'; ctx.lineWidth=2.5
      ctx.fillStyle='rgba(100,200,255,.08)'; ctx.fill(); ctx.stroke()

      // Focal points
      ctx.beginPath(); ctx.arc(lcx+f, lcy, 4, 0, 2*Math.PI); ctx.fillStyle='rgba(0,212,255,.6)'; ctx.fill()
      ctx.beginPath(); ctx.arc(lcx-f, lcy, 4, 0, 2*Math.PI); ctx.fillStyle='rgba(0,212,255,.6)'; ctx.fill()
      ctx.font='10px monospace'; ctx.fillStyle='rgba(0,212,255,.6)'
      ctx.fillText('F', lcx+f+6, lcy+4); ctx.fillText('F', lcx-f+6, lcy+4)

      // Image using lens formula: 1/v - 1/u = 1/f, u is negative
      const u = -(1.5*f)
      const vImg = 1/(1/f - 1/u) // image distance (+ means real)
      const magnif = -vImg/u
      const imgX = lcx + vImg
      const imgH = objH * Math.abs(magnif)

      // 3 principal rays
      // Ray 1: parallel to axis → through F'
      ctx.beginPath(); ctx.moveTo(objX, lcy-objH); ctx.lineTo(lcx, lcy-objH); ctx.lineTo(imgX, lcy-imgH*Math.sign(-vImg))
      ctx.strokeStyle='rgba(255,150,50,.6)'; ctx.lineWidth=1.5; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([])

      // Ray 2: through center
      ctx.beginPath(); ctx.moveTo(objX, lcy-objH); ctx.lineTo(imgX, lcy-imgH*Math.sign(-vImg))
      ctx.strokeStyle='rgba(50,255,150,.6)'; ctx.lineWidth=1.5; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([])

      // Image arrow
      if (imgX > lx && imgX < W) {
        ctx.beginPath(); ctx.moveTo(imgX, lcy); ctx.lineTo(imgX, lcy-imgH*Math.sign(-vImg))
        ctx.strokeStyle='rgba(255,100,80,.7)'; ctx.lineWidth=2; ctx.stroke()
        ctx.font='10px monospace'; ctx.fillStyle='rgba(255,100,80,.6)'; ctx.fillText('I', imgX+5, lcy-imgH/2*Math.sign(-vImg))
      }

      ctx.font='10px monospace'; ctx.fillStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.3)'
      ctx.fillText('1/v – 1/u = 1/f  (Lens formula)', lx+4, H-8)

      if (runRef.current) tRef.current += 0.02
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return <canvas ref={canvasRef} style={{ width:'100%', height:400, display:'block', borderRadius:16, border:'1px solid var(--border)' }}/>
})

export default OpticsSimulation
