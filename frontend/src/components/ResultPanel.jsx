import { useState } from 'react'

const TOPIC_META = {
  projectile_motion: { label: 'Projectile Motion', icon: '⟳', color: '#22d3ee' },
  pendulum:          { label: 'Simple Pendulum',   icon: '◎', color: '#f59e0b' },
  wave:              { label: 'Wave Motion',        icon: '≈', color: '#a78bfa' },
  circuit:           { label: "Ohm's Law / Circuit",icon: '⚡', color: '#4ade80' },
  function_plot:     { label: 'Function Plot',      icon: 'f', color: '#f87171' },
}

function Tag({ children, color }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs"
      style={{
        background: `${color}15`,
        border: `1px solid ${color}30`,
        color,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '10px',
        letterSpacing: '0.04em',
      }}>
      {children}
    </span>
  )
}

function StatRow({ label, value, color = '#22d3ee' }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b"
      style={{ borderColor: 'var(--border)' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace" }}>
        {label}
      </span>
      <span style={{ fontSize: '12px', color, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500 }}>
        {value}
      </span>
    </div>
  )
}

function Section({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 transition-colors hover:bg-white/[0.02]"
        style={{ background: 'var(--surface-2)' }}
      >
        <span style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {title}
        </span>
        <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-3 py-2" style={{ background: 'var(--surface)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function ResultPanel({ result }) {
  if (!result) return null

  const { subject, topic, description, formulas = [], variables = {}, simulation } = result
  const meta = TOPIC_META[topic] || { label: topic, icon: '◈', color: '#22d3ee' }
  const stats = simulation?.stats || {}

  return (
    <div className="flex flex-col gap-3 animate-fade-up">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm"
          style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}25`, color: meta.color }}>
          {meta.icon}
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)',
            fontFamily: "'Syne', sans-serif" }}>{meta.label}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Tag color={meta.color}>{subject?.toUpperCase()}</Tag>
            <Tag color="#8ba0b8">DETECTED</Tag>
          </div>
        </div>
      </div>

      {/* ── Description ──────────────────────────────────────── */}
      {description && (
        <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: '1.6' }}>{description}</p>
        </div>
      )}

      {/* ── Extracted Variables ───────────────────────────────── */}
      {Object.keys(variables).length > 0 && (
        <Section title="Extracted Variables">
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(variables)
              .filter(([, v]) => v !== null && v !== undefined)
              .map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-2.5 py-1.5 rounded-md"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-3)',
                    fontFamily: "'IBM Plex Mono', monospace" }}>{k}</span>
                  <span style={{ fontSize: '11px', color: meta.color,
                    fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500 }}>{String(v)}</span>
                </div>
              ))}
          </div>
        </Section>
      )}

      {/* ── Formulas ─────────────────────────────────────────── */}
      {formulas.length > 0 && (
        <Section title="Formulas">
          <div className="flex flex-col gap-1.5">
            {formulas.map((f, i) => (
              <div key={i} className="px-3 py-2 rounded-md"
                style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}>
                <span style={{ fontSize: '12px', color: '#c4b5fd',
                  fontFamily: "'IBM Plex Mono', monospace" }}>{f}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Simulation Results ────────────────────────────────── */}
      {Object.keys(stats).length > 0 && (
        <Section title="Results">
          <div>
            {Object.entries(stats).map(([k, v]) => (
              <StatRow key={k}
                label={k.replace(/_/g, ' ')}
                value={typeof v === 'number' ? v.toLocaleString() : String(v)}
                color={meta.color}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
