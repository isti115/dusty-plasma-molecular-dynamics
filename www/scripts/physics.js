// Physical constants (in SI units)

// export const bohrRadius = 5.2917721067e-11
export const BoltzmannConstant = 1.38064852e-23
export const ElectronCharge = 1.60217662e-19
export const VacuumPermittivity = 8.854187817e-12

// Parameters

export const ParticleCharge = 1e4 * ElectronCharge
export const ParticleMass = 1e-13

export const BoxSize = 1e-2
export const CutoffDistance = BoxSize / 3
export const ParticleCount = 200

export const SurfaceDensity = ParticleCount / Math.pow(BoxSize, 2)
export const WignerSeitzRadius = 1 / Math.sqrt(SurfaceDensity * Math.PI)

export const PlasmaFrequency = Math.sqrt(
  (SurfaceDensity * Math.pow(ParticleCharge, 2)) /
  (2 * VacuumPermittivity * ParticleMass * WignerSeitzRadius)
)

export const dt = 1 / (PlasmaFrequency * 30)
