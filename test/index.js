/* global describe, it */

'use strict'

var dsolve = require('../')

var assert = require('chai').assert
var iota = require('iota-array')
var ndarray = require('ndarray')
var lup = require('ndarray-lup-factorization')
var solve = require('ndarray-lup-solve')
var pool = require('ndarray-scratch')
var band = require('ndarray-band')
var ops = require('ndarray-ops')
var almostEqual = require('almost-equal')

function vectorAlmostEqual (a, b) {
  for (var i = 0; i < a.shape[0]; i++) {
    assert(almostEqual(a.get(i), b.get(i), 1e-7, 1e-7), 'a[' + i + '] (' + a.get(i) + ') !== b[' + i + '] (' + b.get(i) + ')')
  }
}

function constructDenseMatrix (d, nsub, nsup) {
  var n = d[0].length
  var A = pool.zeros([n, n])

  for (var i = -nsub, j = 0; i <= nsup; i++, j++) {
    var diag = d[j].slice(0)
    if (i < 0) {
      ops.assign(band(A, -i), ndarray(diag).lo(-i))
    } else {
      ops.assign(band(A, -i), ndarray(diag).hi(n - i))
    }
  }
  return A
}

describe('solveMultiDiagonal', function () {
  it('returns false if diagonal dominance fails', function () {
    //     [0 1 0]
    // A = [2 2 0]
    //     [0 2 3]
    var a = [0, 2, 2]
    var b = [0, 2, 3]
    var c = [1, 0, 0]
    var x = [5, 6, 7]

    assert.isFalse(dsolve([a, b, c], 1, 1, x, 3))
  })

  it('returns false if singular', function () {
    //     [1 1 0]
    // A = [2 4 3]
    //     [0 2 3]
    var a = [0, 2, 2]
    var b = [1, 4, 3]
    var c = [1, 3, 0]
    var x = [5, 6, 7]

    assert.isFalse(dsolve([a, b, c], 1, 1, x, 3))
  })

  it('throws an error if incorrect number of diagonals provided', function () {
    var a = [0, 2, 2]
    var b = [1, 4, 3]
    var c = [1, 3, 0]
    var x = [5, 6, 7]
    assert.throws(function () {
      dsolve([a, b, c], 1, 2, x, 3)
    }, Error, /stated bandwidth/)
  })

  it('solves into an ndarray via stride and offset', function () {
    var A = pool.zeros([4, 3, 5]).step(1, -1, 1).transpose(0, 1)
    var x = A.pick(2, null, 3)
    ops.assign(x, ndarray([4, 25, -5]))

    dsolve([[0, -1, 2], [2, 7, -3], [1, 4, 0]], 1, 1, x.data, x.shape[0], x.offset, x.stride[0])

    vectorAlmostEqual(A.pick(2, null, 3), ndarray([1, 2, 3]))
  })

  // Try every number of diagonals:
  for (var nnsub = 0; nnsub <= 5; nnsub++) {
    for (var nnsup = 0; nnsup <= 5; nnsup++) {
      for (var nn = 1; nn <= 30; nn++) {
        ;(function (n, nsub, nsup) {
          var ndiag = nsub + nsup + 1
          var d = []

          // Note: This not-really-random matrix is, in general, kinda ill conditioned.
          for (var ii = 0; ii < ndiag; ii++) {
            d[ii] = iota(n).map(function (x) { return Math.cos((10 + Math.sqrt(125) * ii) * (x + 1)) })
          }
          var x = iota(n).map(function (x) { return Math.cos(Math.sqrt(500) * (x + 1)) })

          if (nsup >= n) {
            it(nsub + '-sub, ' + nsup + '-sup ' + n + ' x ' + n + ': too many superdiagonals', function () {
              assert.throws(function () {
                dsolve(d, nsub, nsup, x, n)
              }, Error, /too many superdiagonals/)
            })
            return
          }

          if (nsub >= n) {
            it(nsub + '-sub, ' + nsup + '-sup ' + n + ' x ' + n + ': too many subdiagonals', function () {
              assert.throws(function () {
                dsolve(d, nsub, nsup, x, n)
              }, Error, /too many subdiagonals/)
            })
            return
          }

          it(nsub + '-sub, ' + nsup + '-sup ' + n + ' x ' + n + ': solves', function () {
            // Construct dense matrix:
            var P = []
            var A = constructDenseMatrix(d, nsub, nsup)
            var xx = ndarray(x.slice(0))

            assert(dsolve(d, nsub, nsup, x, n), 'returns true on success')

            // Solve using dense solver:
            lup(A, A, P)
            solve(A, A, P, xx)

            vectorAlmostEqual(xx, ndarray(x))
          })
        }(nn, nnsub, nnsup))
      }
    }
  }
})
