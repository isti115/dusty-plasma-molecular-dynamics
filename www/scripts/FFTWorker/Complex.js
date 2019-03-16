class Complex {
  constructor (re, im) {
    this.re = re
    this.im = im
  }

  static add (x, y) {
    return new Complex(x.re + y.re, x.im + y.im)
  }

  static sub (x, y) {
    return new Complex(x.re - y.re, x.im - y.im)
  }

  static mul (x, y) {
    return new Complex(
      x.re * y.re - x.im * y.im,
      x.re * y.im + y.re * x.im
    )
  }

  static exp (x) {
    const len = Math.exp(x.re)

    return new Complex(
      len * Math.cos(x.im),
      len * Math.sin(x.im)
    )
  }

  static abs (x) {
    return Math.sqrt((x.re ** 2) + (x.im ** 2))
  }
}

// Worker export:

this.Complex = Complex
