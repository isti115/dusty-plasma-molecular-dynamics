// Physical constants (in SI units)

// export const bohrRadius = 5.2917721067e-11
const BoltzmannConstant = 1.38064852e-23
const ElectronCharge = 1.60217662e-19
const VacuumPermittivity = 8.854187817e-12

const CoulombConstant = 1 / (4 * Math.PI * VacuumPermittivity)

// Parameters

const ParticleCharge = 1e4 * ElectronCharge
const ParticleMass = 1e-13

const BoxSize = 1e-2
const CutoffDistance = BoxSize / 3
const ParticleCount = 250

const SurfaceDensity = ParticleCount / (BoxSize ** 2)
const WignerSeitzRadius = 1 / Math.sqrt(SurfaceDensity * Math.PI)

const PlasmaFrequency = Math.sqrt(
  (SurfaceDensity * (ParticleCharge ** 2)) /
  (2 * VacuumPermittivity * ParticleMass * WignerSeitzRadius)
)

const dt = 1 / (PlasmaFrequency * 30)

//

const ParticleChargeSquaredTimesCoulombConstant = (
  (ParticleCharge ** 2) * CoulombConstant
)

// Worker export:

this.physics = {
  BoltzmannConstant,
  ElectronCharge,
  VacuumPermittivity,
  CoulombConstant,
  ParticleCharge,
  ParticleMass,
  BoxSize,
  CutoffDistance,
  ParticleCount,
  SurfaceDensity,
  WignerSeitzRadius,
  PlasmaFrequency,
  dt,
  ParticleChargeSquaredTimesCoulombConstant
}
