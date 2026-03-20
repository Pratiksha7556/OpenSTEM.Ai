import { useState, useRef, useCallback } from 'react'

const EXAMPLES = [
  {
    label: 'Projectile',
    icon: '⟳',
    color: '#22d3ee',
    text: 'A ball is launched at 45° with initial velocity 35 m/s. Calculate range, max height, and time of flight.',
  },
  {
    label: 'Pendulum',
    icon: '◎',
    color: '#f59e0b',
    text: 'A simple pendulum of length 1.5m swings with an amplitude of 20 degrees. Find its period and frequency.',
  },
  {
    label: 'Wave',
    icon: '≈',
    color: '#a78bfa',
    text: 'A transverse wave has amplitude 2m, frequency 4Hz and wave speed 8 m/s. Visualize the wave.',
  },
  {
    label: 'Circuit',
    icon: '⚡',
    color: '#4ade80',
    text: 'An electric circuit has a 24V battery and a 330 ohm resistor. Find current, power and plot the IV curve.',
  },
  {
    label: 'Math',
    icon: 'f(x)',
    color: '#f87171',
    text: 'Plot the function f(x) = x³ - 4x² + 3x + 2, its derivative and compute the integral.',
  },
]

export default function ProblemInput({ onAnalyze, loading }) {
  const [text, setText] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const fileRef = useRef()
  const textareaRef = useRef()

  const handleTextChange = (e) => {
    setText(e.target.value)
    setCharCount(e.target.value.length)
  }

  const handleSubmit = useCallback(() => {
    if (!text.trim() || loading) return
    onAnalyze({ type: 'text', value: text.trim() })
  }, [text, loading, onAnalyze])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
  }

  const handleFile = (file) => {
    if (!file || loading) return
    if (!file.type.startsWith('image/')) return
    onAnalyze({ type: 'image', value: file })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleExample = (ex) => {
    setText(ex.text)
    setCharCount(ex.text.length)
    onAnalyze({ type: 'text', value: ex.text })
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Textarea ───────────────────────────────────────── */}
      <div className="relative group">
        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/60 rounded-tl-sm z-10 pointer-events-none" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/60 rounded-tr-sm z-10 pointer-events-none" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500/60 rounded-bl-sm z-10 pointer-events-none" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500/60 rounded-br-sm z-10 pointer-events-none" />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={'Enter a textbook problem...\n\ne.g. A ball is thrown at 45° with velocity 30 m/s. Find the range.'}
          rows={6}
          style={{
            background: 'var(--surface)',
            color: 'var(--text-1)',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '13px',
            lineHeight: '1.7',
            border: '1px solid var(--border)',
            caretColor: '#22d3ee',
          }}
          className="w-full resize-none rounded-lg p-4 pb-10 outline-none
                     focus:border-cyan-500/40 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.1)]
                     transition-all duration-200 placeholder:text-[#4a6278]"
        />

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between
                        border-t border-[var(--border)] rounded-b-lg"
          style={{ background: 'var(--surface-2)' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-3)', fontSize: '10px' }}>
            {charCount} chars · Ctrl+Enter to run
          </span>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold
                       transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: text.trim() && !loading ? 'rgba(34,211,238,0.12)' : 'transparent',
              color: '#22d3ee',
              border: '1px solid rgba(34,211,238,0.25)',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <span style={{ fontSize: '11px' }}>▶</span>
                Run
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Image Upload ───────────────────────────────────── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
                   border border-dashed transition-all duration-200"
        style={{
          borderColor: dragOver ? 'rgba(245,158,11,0.5)' : 'var(--border)',
          background: dragOver ? 'rgba(245,158,11,0.04)' : 'transparent',
        }}
      >
        <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>
            Upload image of textbook problem
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace" }}>
            PNG / JPG · drag & drop or click
          </p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => handleFile(e.target.files?.[0])} />
      </div>

      {/* ── Examples ───────────────────────────────────────── */}
      <div>
        <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Quick Examples
        </p>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleExample(ex)}
              disabled={loading}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs
                         transition-all duration-200 disabled:opacity-40 hover:scale-[1.02] active:scale-95"
              style={{
                background: `${ex.color}10`,
                border: `1px solid ${ex.color}25`,
                color: ex.color,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
              }}
            >
              <span style={{ fontSize: '10px' }}>{ex.icon}</span>
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
