import { Suspense, lazy } from 'react'

const ProjectileSimulation = lazy(() => import('../simulations/ProjectileSimulation'))
const PendulumSimulation   = lazy(() => import('../simulations/PendulumSimulation'))
const WaveSimulation       = lazy(() => import('../simulations/WaveSimulation'))
const CircuitSimulation    = lazy(() => import('../simulations/CircuitSimulation'))
const FunctionPlot         = lazy(() => import('../simulations/FunctionPlot'))

const SIM_MAP = {
  projectile_motion: ProjectileSimulation,
  pendulum:          PendulumSimulation,
  wave:              WaveSimulation,
  circuit:           CircuitSimulation,
  function_plot:     FunctionPlot,
}

function SimLoader() {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="h-8 rounded-lg shimmer-load" />
      <div className="h-72 rounded-xl shimmer-load" />
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3].map(i => <div key={i} className="h-14 rounded-lg shimmer-load" />)}
      </div>
    </div>
  )
}

function UnknownSim({ topic }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3"
      style={{ border: '1px dashed var(--border)', borderRadius: '12px' }}>
      <span style={{ fontSize: '32px' }}>◈</span>
      <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>
        Simulation for <span style={{ color: '#22d3ee', fontFamily: "'IBM Plex Mono', monospace" }}>
          "{topic}"
        </span> coming soon
      </p>
    </div>
  )
}

export default function SimulationViewer({ result, onVariableChange }) {
  if (!result) return null

  const { topic, simulation, variables } = result
  const Component = SIM_MAP[topic]

  if (!Component) return <UnknownSim topic={topic} />

  return (
    <div className="animate-fade-up w-full">
      <Suspense fallback={<SimLoader />}>
        <Component
          data={simulation}
          variables={variables || {}}
          onVariableChange={(newVars) => onVariableChange(topic, newVars)}
        />
      </Suspense>
    </div>
  )
}
