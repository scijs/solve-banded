'use strict'

var solveBanded = require('../')

var d = [4, 25, -5]

solveBanded([[0, -1, 2], [2, 7, -3], [1, 4, 0]], 1, 1, d, 3)

console.log(d)
// => d = [ 1, 2, 3 ]
