import { useState, useEffect, useRef } from 'react'

const TABS = [
  { id: 'simulation', label: 'Simulation',  icon: '◈' },
  { id: 'steps',      label: 'Step-by-Step',icon: '①' },
  { id: 'formulas',   label: 'Formulas',    icon: '∑' },
  { id: 'laws',       label: 'Laws Used',   icon: '⚖' },
  { id: 'results',    label: 'Results',     icon: '◉' },
  { id: 'voice',      label: 'Voice',       icon: '🔊' },
]

const LANG_META = {
  english: { label: 'English',  flag: '🇬🇧', color: '#22d3ee' },
  hindi:   { label: 'हिंदी',    flag: '🇮🇳', color: '#f59e0b' },
  marathi: { label: 'मराठी',    flag: '🇮🇳', color: '#a78bfa' },
}

const DIFF_COLOR = { easy: '#4ade80', medium: '#f59e0b', hard: '#f87171' }

// ── Step Card ──────────────────────────────────────────────────
function StepCard({ step, index, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl transition-all duration-200 overflow-hidden"
      style={{
        border: `1px solid ${active ? 'rgba(34,211,238,0.4)' : 'var(--border)'}`,
        background: active ? 'rgba(34,211,238,0.04)' : 'var(--surface)',
        boxShadow: active ? '0 0 16px rgba(34,211,238,0.08)' : 'none',
      }}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
          style={{
            background: active ? 'rgba(34,211,238,0.15)' : 'var(--surface-2)',
            border: `1px solid ${active ? 'rgba(34,211,238,0.3)' : 'var(--border)'}`,
            color: active ? '#22d3ee' : 'var(--text-3)',
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
          {step.number}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: '13px', fontWeight: 600, color: active ? '#e2eaf4' : 'var(--text-2)',
            fontFamily: "'Syne', sans-serif" }}>
            {step.title}
          </p>
          {!active && step.result && (
            <p className="truncate" style={{ fontSize: '11px', color: 'var(--text-3)',
              fontFamily: "'IBM Plex Mono', monospace", marginTop: '2px' }}>
              → {step.result}
            </p>
          )}
        </div>
        <span style={{ color: active ? '#22d3ee' : 'var(--text-3)', fontSize: '12px' }}>
          {active ? '▼' : '▶'}
        </span>
      </div>

      {active && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.7' }}>
            {step.explanation}
          </p>
          {step.formula && (
            <div className="p-3 rounded-lg"
              style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Formula</p>
              <p style={{ fontSize: '13px', color: '#c4b5fd', fontFamily: "'IBM Plex Mono', monospace" }}>
                {step.formula}
              </p>
            </div>
          )}
          {step.calculation && (
            <div className="p-3 rounded-lg"
              style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Calculation</p>
              <p style={{ fontSize: '13px', color: '#22d3ee', fontFamily: "'IBM Plex Mono', monospace" }}>
                {step.calculation}
              </p>
            </div>
          )}
          {step.result && (
            <div className="flex items-center gap-2 p-3 rounded-lg"
              style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
              <span style={{ color: '#4ade80', fontSize: '14px' }}>✓</span>
              <p style={{ fontSize: '13px', color: '#4ade80', fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 500 }}>
                {step.result}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Voice Panel ────────────────────────────────────────────────
function VoicePanel({ narration }) {
  const [speaking, setSpeaking]   = useState(false)
  const [lang,     setLang]       = useState('english')
  const [supported, setSupported] = useState(true)
  const utterRef = useRef(null)

  useEffect(() => {
    if (!window.speechSynthesis) setSupported(false)
    return () => { window.speechSynthesis?.cancel() }
  }, [])

  const speak = (text, langCode) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = langCode
    utter.rate = 0.85
    utter.pitch = 1
    utter.onstart  = () => setSpeaking(true)
    utter.onend    = () => setSpeaking(false)
    utter.onerror  = () => setSpeaking(false)
    utterRef.current = utter
    window.speechSynthesis.speak(utter)
  }

  const stop = () => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }

  const LANG_CODES = { english: 'en-US', hindi: 'hi-IN', marathi: 'mr-IN' }

  if (!supported) return (
    <div className="text-center py-8" style={{ color: 'var(--text-3)', fontSize: '13px' }}>
      Voice not supported in this browser. Try Chrome or Edge.
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {Object.entries(LANG_META).map(([key, meta]) => (
          <button key={key} onClick={() => setLang(key)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            style={{
              background: lang === key ? `${meta.color}15` : 'var(--surface)',
              border: `1px solid ${lang === key ? `${meta.color}40` : 'var(--border)'}`,
              color: lang === key ? meta.color : 'var(--text-3)',
              fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace",
            }}>
            <span>{meta.flag}</span> {meta.label}
          </button>
        ))}
      </div>

      {/* Narration text display */}
      <div className="p-4 rounded-xl relative overflow-hidden"
        style={{ background: 'var(--surface)', border: `1px solid ${LANG_META[lang].color}25` }}>
        {speaking && (
          <div className="absolute top-3 right-3 flex gap-0.5 items-end h-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-1 rounded-full"
                style={{
                  background: LANG_META[lang].color,
                  height: `${Math.random() * 12 + 4}px`,
                  animation: `pulse2 ${0.4 + i * 0.1}s ease infinite alternate`,
                }} />
            ))}
          </div>
        )}
        <p style={{ fontSize: '14px', color: 'var(--text-1)', lineHeight: '1.8',
          fontFamily: lang === 'english' ? "'IBM Plex Sans', sans-serif" : 'serif' }}>
          {narration?.[lang] || 'No narration available.'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => speaking ? stop() : speak(narration?.[lang], LANG_CODES[lang])}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all
                     hover:scale-[1.02] active:scale-95"
          style={{
            background: speaking ? 'rgba(248,113,113,0.12)' : `${LANG_META[lang].color}12`,
            border: `1px solid ${speaking ? 'rgba(248,113,113,0.3)' : `${LANG_META[lang].color}30`}`,
            color: speaking ? '#f87171' : LANG_META[lang].color,
            fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace",
          }}>
          {speaking
            ? <><span>⏹</span> Stop</>
            : <><span>▶</span> Play in {LANG_META[lang].label}</>}
        </button>
      </div>

      {/* All 3 languages preview */}
      <div className="space-y-2">
        <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
          textTransform: 'uppercase', letterSpacing: '0.08em' }}>All Languages</p>
        {Object.entries(LANG_META).map(([key, meta]) => (
          <div key={key} className="flex items-start gap-3 p-3 rounded-lg cursor-pointer
                                    transition-all hover:opacity-80"
            onClick={() => { setLang(key); speak(narration?.[key], LANG_CODES[key]) }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span className="text-base shrink-0">{meta.flag}</span>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: '11px', color: meta.color, fontFamily: "'IBM Plex Mono', monospace",
                marginBottom: '2px' }}>{meta.label}</p>
              <p className="truncate" style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: '1.5' }}>
                {narration?.[key]}
              </p>
            </div>
            <span style={{ color: meta.color, fontSize: '14px', shrink: 0 }}>▶</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Formulas Tab ───────────────────────────────────────────────
function FormulasTab({ formulas, variables }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
          textTransform: 'uppercase', letterSpacing: '0.08em' }}>Formulas Used</p>
        {formulas?.map((f, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px',
              color: 'var(--text-3)', minWidth: '20px' }}>F{i + 1}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '14px', color: '#c4b5fd' }}>
              {f}
            </span>
          </div>
        ))}
        {(!formulas || formulas.length === 0) && (
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>No formulas extracted.</p>
        )}
      </div>

      {variables && Object.keys(variables).length > 0 && (
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Variable Reference
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(variables).filter(([, v]) => v !== null).map(([k, v]) => (
              <div key={k} className="flex justify-between items-center px-3 py-2 rounded-lg"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-3)',
                  fontFamily: "'IBM Plex Mono', monospace" }}>{k}</span>
                <span style={{ fontSize: '12px', color: '#22d3ee',
                  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Laws Tab ───────────────────────────────────────────────────
function LawsTab({ laws, concepts, mistakes, applications }) {
  return (
    <div className="space-y-5">
      {laws?.length > 0 && (
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Laws & Principles
          </p>
          <div className="space-y-2">
            {laws.map((law, i) => (
              <div key={i} className="p-4 rounded-xl space-y-2"
                style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b',
                  fontFamily: "'Syne', sans-serif" }}>{law.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-2)', fontStyle: 'italic' }}>
                  "{law.statement}"
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: '1.6' }}>
                  {law.relevance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {concepts?.length > 0 && (
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Key Concepts
          </p>
          <div className="flex flex-wrap gap-2">
            {concepts.map((c, i) => (
              <span key={i} className="px-3 py-1 rounded-lg text-xs"
                style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)',
                  color: '#22d3ee', fontFamily: "'IBM Plex Mono', monospace" }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {mistakes?.length > 0 && (
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            ⚠ Common Mistakes
          </p>
          <div className="space-y-1.5">
            {mistakes.map((m, i) => (
              <div key={i} className="flex gap-2 p-3 rounded-lg"
                style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
                <span style={{ color: '#f87171', fontSize: '12px' }}>✗</span>
                <p style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: '1.5' }}>{m}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {applications?.length > 0 && (
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            🌍 Real World Applications
          </p>
          <div className="space-y-1.5">
            {applications.map((a, i) => (
              <div key={i} className="flex gap-2 p-3 rounded-lg"
                style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
                <span style={{ color: '#4ade80', fontSize: '12px' }}>→</span>
                <p style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: '1.5' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Results Tab ────────────────────────────────────────────────
function ResultsTab({ stats, solution }) {
  const diff = solution?.difficulty || 'medium'
  return (
    <div className="space-y-4">
      {/* Difficulty + time */}
      <div className="flex gap-3">
        <div className="flex-1 p-3 rounded-xl text-center"
          style={{ background: `${DIFF_COLOR[diff]}0a`, border: `1px solid ${DIFF_COLOR[diff]}25` }}>
          <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
            textTransform: 'uppercase', letterSpacing: '0.06em' }}>Difficulty</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: DIFF_COLOR[diff],
            fontFamily: "'Syne', sans-serif", textTransform: 'capitalize', marginTop: '2px' }}>
            {diff}
          </p>
        </div>
        <div className="flex-1 p-3 rounded-xl text-center"
          style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
          <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
            textTransform: 'uppercase', letterSpacing: '0.06em' }}>Est. Time</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#22d3ee',
            fontFamily: "'Syne', sans-serif', marginTop: '2px" }}>
            {solution?.estimated_time || '5 min'}
          </p>
        </div>
      </div>

      {/* Computed results */}
      {stats && Object.keys(stats).length > 0 && (
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Computed Results
          </p>
          <div className="space-y-1.5">
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} className="flex justify-between items-center px-4 py-3 rounded-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-3)',
                  fontFamily: "'IBM Plex Mono', monospace", textTransform: 'capitalize' }}>
                  {k.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: '14px', color: '#22d3ee',
                  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                  {typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 4 }) : String(v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main SolutionPanel ─────────────────────────────────────────
export default function SolutionPanel({ result, activeTab, onTabChange, children }) {
  const [activeStep, setActiveStep] = useState(0)
  const solution  = result?.solution  || {}
  const stats     = result?.simulation?.stats || {}

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all
                       hover:scale-[1.02] shrink-0"
            style={{
              background: activeTab === tab.id ? 'rgba(34,211,238,0.1)' : 'transparent',
              border: `1px solid ${activeTab === tab.id ? 'rgba(34,211,238,0.3)' : 'transparent'}`,
              color: activeTab === tab.id ? '#22d3ee' : 'var(--text-3)',
              fontSize: '12px',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            <span style={{ fontSize: '13px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'simulation' && (
          <div className="animate-fade-in">{children}</div>
        )}

        {activeTab === 'steps' && (
          <div className="animate-fade-in space-y-2">
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 700,
                color: 'var(--text-1)' }}>Step-by-Step Solution</p>
              <span className="px-2 py-1 rounded-md text-xs"
                style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)',
                  color: '#22d3ee', fontFamily: "'IBM Plex Mono', monospace" }}>
                {solution?.steps?.length || 0} steps
              </span>
            </div>
            {solution?.steps?.length > 0
              ? solution.steps.map((step, i) => (
                  <StepCard key={i} step={step} index={i}
                    active={activeStep === i}
                    onClick={() => setActiveStep(activeStep === i ? -1 : i)} />
                ))
              : <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>
                  Analyze a problem to see step-by-step solution.
                </p>
            }
          </div>
        )}

        {activeTab === 'formulas' && (
          <div className="animate-fade-in">
            <FormulasTab formulas={result?.formulas} variables={result?.variables} />
          </div>
        )}

        {activeTab === 'laws' && (
          <div className="animate-fade-in">
            <LawsTab
              laws={solution?.laws_used}
              concepts={solution?.key_concepts}
              mistakes={solution?.common_mistakes}
              applications={solution?.real_world_applications}
            />
          </div>
        )}

        {activeTab === 'results' && (
          <div className="animate-fade-in">
            <ResultsTab stats={stats} solution={solution} />
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="animate-fade-in">
            <div className="mb-4">
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 700,
                color: 'var(--text-1)', marginBottom: '4px' }}>Voice Explanation</p>
              <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                Listen to the solution in English, Hindi, or Marathi
              </p>
            </div>
            <VoicePanel narration={solution?.narration} />
          </div>
        )}
      </div>
    </div>
  )
}
