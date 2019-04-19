// Physical constants (in SI units)

// const bohrRadius = 5.2917721067e-11
const BoltzmannConstant = 1.38064852e-23
const ElectronCharge = 1.60217662e-19
const VacuumPermittivity = 8.854187817e-12

const CoulombConstant = 1 / (4 * Math.PI * VacuumPermittivity)

// Parameters

const ParticleCharge = 1e4 * ElectronCharge
const ParticleMass = 1e-13

const BoxSize = 1e-2
const GridSize = 4
const CutoffDistance = BoxSize / GridSize
const ParticleCount = 500

const SurfaceDensity = ParticleCount / (BoxSize ** 2)
const WignerSeitzRadius = 1 / Math.sqrt(SurfaceDensity * Math.PI)

const PlasmaFrequency = Math.sqrt(
  (SurfaceDensity * (ParticleCharge ** 2)) /
  (2 * VacuumPermittivity * ParticleMass * WignerSeitzRadius)
)

const dt = 1 / (PlasmaFrequency * 30)

const WaveDispersionBufferLength = 8192
const OmegaStepSize = 2 * Math.PI / (dt * WaveDispersionBufferLength)

const KLimit = 5
const KStepSize = (2 * Math.PI / BoxSize) * WignerSeitzRadius

//

const ParticleChargeSquaredTimesCoulombConstant = (
  (ParticleCharge ** 2) * CoulombConstant
)

//

this.physics = {
  BoltzmannConstant,
  ElectronCharge,
  VacuumPermittivity,
  CoulombConstant,

  //

  ParticleCharge,
  ParticleMass,
  BoxSize,
  GridSize,
  CutoffDistance,
  ParticleCount,
  SurfaceDensity,
  WignerSeitzRadius,
  PlasmaFrequency,
  dt,

  WaveDispersionBufferLength,
  OmegaStepSize,
  KLimit,
  KStepSize,

  //

  ParticleChargeSquaredTimesCoulombConstant
}
