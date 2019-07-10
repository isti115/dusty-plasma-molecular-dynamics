const boundedValue = (from, to, value) => (
  ((((value - from) % (to - from)) + (to - from)) % (to - from)) + from
)

const generateArray = (length, generator = (x => x)) => (
  [...new Array(length)].map((_, i) => generator(i))
)

const norm = (x, y) => Math.sqrt((x ** 2) + (y ** 2))
const normSquared = (x, y) => (x ** 2) + (y ** 2)

const isPowerOfTwo = x => Math.log2(x) % 1 === 0

const toNDigits = (n, x) => {
  const offset = 10 ** (n - 1 - Math.floor(Math.log10(x)))
  return Math.round(x * offset) / offset || 0
}

// Worker export:

this.utilities = {
  boundedValue,
  generateArray,
  norm,
  normSquared,
  isPowerOfTwo,
  toNDigits
}
