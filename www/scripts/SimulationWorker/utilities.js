const boundedValue = (from, to, value) => (
  ((((value - from) % (to - from)) + (to - from)) % (to - from)) + from
)

const generateArray = (length, generator) => (
  [...new Array(length)].map((_, i) => generator(i))
)

const norm = (x, y) => Math.sqrt((x ** 2) + (y ** 2))

// Worker export:

this.utilities = {
  boundedValue,
  generateArray,
  norm
}
