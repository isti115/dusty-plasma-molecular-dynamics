/* global utilities Complex */

const calculate = data => {
  if (!utilities.isPowerOfTwo(data.length)) {
    console.error(
      'Input data to a fast fourier transform must have a power of two length.'
    )
  }

  return process(data)
  // return process(data.map(d => new Complex(d, 0))).map(Complex.abs)
}

const process = data => {
  if (data.length === 1) {
    return data
  }

  const even = utilities.generateArray(data.length / 2, i => data[2 * i])
  const odd = utilities.generateArray(data.length / 2, i => data[2 * i + 1])

  const evenResults = process(even)
  const oddResults = process(odd)

  const W = k => Complex.exp(new Complex(0, (-(2 * Math.PI) * k) / data.length))

  const results = utilities.generateArray(
    data.length,
    i => (
      Complex.add(
        evenResults[i % (data.length / 2)],
        Complex.mul(W(i), oddResults[i % (data.length / 2)])
      )
    )
  )

  return results
}

// Worker export:

this.fft = {
  calculate
}
