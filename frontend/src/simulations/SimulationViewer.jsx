import { Suspense, lazy } from 'react'

// ── All physics simulations ────────────────────────────────────
const SIMS = {
  // Mechanics
  projectile:          lazy(() => import('../simulations/ProjectileSimulation')),
  projectile_motion:   lazy(() => import('../simulations/ProjectileSimulation')),
  trajectory:          lazy(() => import('../simulations/ProjectileSimulation')),

  // Oscillations
  pendulum:            lazy(() => import('../simulations/PendulumSimulation')),
  oscillation:         lazy(() => import('../simulations/PendulumSimulation')),
  shm:                 lazy(() => import('../simulations/PendulumSimulation')),
  spring:              lazy(() => import('../simulations/PendulumSimulation')),

  // Waves
  wave:                lazy(() => import('../simulations/WaveSimulation')),
  waves:               lazy(() => import('../simulations/WaveSimulation')),
  sound:               lazy(() => import('../simulations/WaveSimulation')),

  // Electricity
  circuit:             lazy(() => import('../simulations/CircuitSimulation')),
  current_electricity: lazy(() => import('../simulations/CircuitSimulation')),
  ohms_law:            lazy(() => import('../simulations/CircuitSimulation')),
  resistance:          lazy(() => import('../simulations/CircuitSimulation')),

  // Gravitation
  gravitation:         lazy(() => import('../simulations/GravitationSimulation')),
  gravity:             lazy(() => import('../simulations/GravitationSimulation')),
  orbit:               lazy(() => import('../simulations/GravitationSimulation')),
  free_fall:           lazy(() => import('../simulations/GravitationSimulation')),

  // Electrostatics
  electrostatics:      lazy(() => import('../simulations/ElectrostaticsSimulation')),
  electric_field:      lazy(() => import('../simulations/ElectrostaticsSimulation')),
  coulomb:             lazy(() => import('../simulations/ElectrostaticsSimulation')),

  // Magnetism
  magnetism:           lazy(() => import('../simulations/MagnetismSimulation')),
  magnetic:            lazy(() => import('../simulations/MagnetismSimulation')),
  lorentz:             lazy(() => import('../simulations/MagnetismSimulation')),

  // Optics
  optics:              lazy(() => import('../simulations/OpticsSimulation')),
  refraction:          lazy(() => import('../simulations/OpticsSimulation')),
  reflection:          lazy(() => import('../simulations/OpticsSimulation')),
  lens:                lazy(() => import('../simulations/OpticsSimulation')),
  mirror:              lazy(() => import('../simulations/OpticsSimulation')),

  // Modern Physics
  modern_physics:      lazy(() => import('../simulations/ModernPhysicsSimulation')),
  photoelectric:       lazy(() => import('../simulations/ModernPhysicsSimulation')),
  bohr:                lazy(() => import('../simulations/ModernPhysicsSimulation')),
  energy_levels:       lazy(() => import('../simulations/ModernPhysicsSimulation')),
  atomic:              lazy(() => import('../simulations/ModernPhysicsSimulation')),

  // Thermodynamics
  thermodynamics:      lazy(() => import('../simulations/ThermodynamicsSimulation')),
  pv_diagram:          lazy(() => import('../simulations/ThermodynamicsSimulation')),
  ideal_gas:           lazy(() => import('../simulations/ThermodynamicsSimulation')),

  // Math / Graphs
  graph:               lazy(() => import('../simulations/FunctionPlot')),
  function_plot:       lazy(() => import('../simulations/FunctionPlot')),
  function:            lazy(() => import('../simulations/FunctionPlot')),
}

function SimLoader({ color = '#00d4ff' }) {
  return (
    <div style={{ height:380, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:36, height:36, border:`3px solid ${color}`, borderTopColor:'transparent',
        borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
    </div>
  )
}

export default function SimulationViewer({ result, simData, voicePlaying, highlight, onVariableChange }) {
  if (!result) return null

  const simType = result?.simulation?.type || ''
  const Sim = SIMS[simType.toLowerCase()]

  if (!Sim) {
    return (
      <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center',
        flexDirection:'column', gap:10, borderRadius:16, border:'1px solid var(--border)',
        background:'var(--surface)' }}>
        <span style={{ fontSize:32 }}>💡</span>
        <p style={{ fontSize:13, color:'var(--t3)', textAlign:'center' }}>
          Conceptual question — see Step-by-Step solution
          <br/>
          <span style={{ fontSize:11, opacity:.6 }}>(simulation type: {simType || 'none'})</span>
        </p>
      </div>
    )
  }

  return (
    <Suspense fallback={<SimLoader color={result?.simulation?.color || '#00d4ff'}/>}>
      <Sim
        data={simData}
        variables={result?.variables || {}}
        voicePlaying={voicePlaying}
        highlight={highlight}
        onVariableChange={onVariableChange || (() => {})}
      />
    </Suspense>
  )
}
