'use strict'

module.exports = solveMultiDiagonal

function solveMultiDiagonal (d, nsub, nsup, x, nx, ox, sx) {
  var i, j, k, s, r, ptr

  // Stride:
  ox = ox || 0
  sx = sx || 1

  // Number of diagonals:
  var nd = d.length

  if (nsup >= nx) {
    throw new Error('solveMultiDiagonal: too many superdiagonals (' + nsup + ') for a ' + nx + ' x ' + nx + ' system')
  }

  if (nsub >= nx) {
    throw new Error('solveMultiDiagonal: too many subdiagonals (' + nsub + ') for a ' + nx + ' x ' + nx + ' system')
  }

  if (nsub + nsup + 1 !== d.length) {
    throw new Error('solveMultiDiagonal: stated bandwidth of diagonal matrix (' + (nsub + nsup + 1) + ') doesn\'t match number of diagonals provided (' + (d.length) + ')')
  }

  // Eliminate:
  for (j = 0; j < nsub; j++) {
    for (i = nsub - j; i < nx; i++) {
      r = d[j + 1][i - 1]
      if (r === 0) {
        return false
      }
      s = d[j][i] / r
      for (k = j + 1; k < nd - 1; k++) {
        d[k][i] -= s * d[k + 1][i - 1]
      }
      ptr = ox + sx * i
      x[ptr] -= s * x[ptr - sx]
    }
  }

  // Back-substitute the bottom-right (ne - 1) x (ne - 1) corner:
  for (i = nx - 1, ptr = ox + sx * i; i > nx - nsup - 1; i--, ptr -= sx) {
    for (j = 1; j < nx - i; j++) {
      x[ptr] -= d[j + nsub][i] * x[ptr + sx * j]
    }
    r = d[nsub][i]
    if (r === 0) {
      return false
    }
    x[ptr] /= r
  }

  // This is the main substitution:
  for (i = nx - nsup - 1, ptr = ox + sx * i; i >= 0; i--, ptr -= sx) {
    for (j = 1; j <= nsup; j++) {
      x[ptr] -= d[nsub + j][i] * x[ptr + sx * j]
    }
    r = d[nsub][i]
    if (r === 0) {
      return false
    }
    x[ptr] /= r
  }

  return true
}
