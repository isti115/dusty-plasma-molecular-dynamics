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

const strongThermostateStepCount = 1000

// Calculated values

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

// Code slightly modified from: https://stackoverflow.com/a/32635375/1831096
const _a = ((8 * (Math.PI - 3)) / ((3 * Math.PI) * (4 - Math.PI)))
const inverseErrorFunction = _x => {
  const signX = ((_x < 0) ? -1 : 1)

  const oneMinusXsquared = 1 - (_x * _x)
  const LNof1minusXsqrd = Math.log(oneMinusXsquared)
  const piTimesA = Math.PI * _a

  const firstTerm = Math.pow(((2 / piTimesA) + (LNof1minusXsqrd / 2)), 2)
  const secondTerm = (LNof1minusXsqrd / _a)
  const thirdTerm = ((2 / piTimesA) + (LNof1minusXsqrd / 2))

  const primaryComp = Math.sqrt(Math.sqrt(firstTerm - secondTerm) - thirdTerm)

  const scaledR = signX * primaryComp
  return scaledR
}

//

const maxwellBoltzmannSample = t => (
  inverseErrorFunction(2 * Math.random() - 1) /
  Math.sqrt(ParticleMass / (2 * BoltzmannConstant * t))
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

  strongThermostateStepCount,

  SurfaceDensity,
  WignerSeitzRadius,
  PlasmaFrequency,
  dt,

  WaveDispersionBufferLength,
  OmegaStepSize,
  KLimit,
  KStepSize,

  //

  ParticleChargeSquaredTimesCoulombConstant,

  //

  inverseErrorFunction,
  maxwellBoltzmannSample
}
