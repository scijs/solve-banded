# solve-banded [![Build Status](https://travis-ci.org/scijs/solve-banded.svg)](https://travis-ci.org/scijs/solve-banded) [![npm version](https://badge.fury.io/js/solve-banded.svg)](https://badge.fury.io/js/solve-banded) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

> Solve a system of banded linear equations

## Introduction

This module accepts javascript Arrays or typed arrays representing the bands of a banded matrix and computes the solution using the Thomas Algorithm. A system with one subdiagonal and two superdiagonal bands, for example, looks like:

Note that the solver accepts a stride and offset for the input/output vector (`x`, below), so that a system can be solved in-place in an ndarray. The coefficient matrix does not currently accept strides or offsets and must be passed as individual vectors.

<p align="center"><img alt="&bsol;left&lsqb;&NewLine;&bsol;begin&lcub;matrix&rcub;&NewLine;   &lcub;b&lowbar;0&rcub;   &amp;   &lcub;c&lowbar;0&rcub;   &amp;   &lcub;d&lowbar;0&rcub;   &amp;   &lcub;   &rcub;   &amp;   &lcub;  &rcub;        &amp;   &lcub; &rcub;         &amp;   &lcub; 0 &rcub; &bsol;&bsol;&NewLine;   &lcub;a&lowbar;1&rcub;   &amp;   &lcub;b&lowbar;1&rcub;   &amp;   &lcub;c&lowbar;1&rcub;   &amp;   &lcub;d&lowbar;1&rcub;   &amp;   &lcub;  &rcub;        &amp;   &lcub; &rcub;         &amp;   &lcub;   &rcub; &bsol;&bsol;&NewLine;   &lcub;   &rcub;   &amp;   &lcub;a&lowbar;2&rcub;   &amp;   &lcub;b&lowbar;2&rcub;   &amp;   &bsol;cdot   &amp;   &bsol;cdot       &amp;   &lcub; &rcub;         &amp;   &lcub;   &rcub; &bsol;&bsol;&NewLine;   &lcub;   &rcub;   &amp;   &lcub;   &rcub;   &amp;   &bsol;cdot   &amp;   &bsol;cdot   &amp;   &bsol;cdot       &amp;   &lcub;d&lowbar;&lcub;n-4&rcub;&rcub;   &amp;   &lcub;   &rcub; &bsol;&bsol;&NewLine;   &lcub;   &rcub;   &amp;   &lcub;   &rcub;   &amp;   &lcub;   &rcub;   &amp;   &bsol;cdot   &amp;   &lcub;b&lowbar;&lcub;n-3&rcub;&rcub;   &amp;   &lcub;c&lowbar;&lcub;n-3&rcub;&rcub;   &amp;   &lcub;d&lowbar;&lcub;n-3&rcub;&rcub; &bsol;&bsol;&NewLine;   &lcub;   &rcub;   &amp;   &lcub;   &rcub;   &amp;   &lcub;   &rcub;   &amp;   &lcub; &rcub;     &amp;   &lcub;a&lowbar;&lcub;n-2&rcub;&rcub;   &amp;   &lcub;b&lowbar;&lcub;n-2&rcub;&rcub;   &amp;   &lcub;c&lowbar;&lcub;n-2&rcub;&rcub;&bsol;&bsol;&NewLine;   &lcub; 0 &rcub;   &amp;   &lcub;   &rcub;   &amp;   &lcub;   &rcub;   &amp;   &lcub; &rcub;     &amp;   &lcub;   &rcub;       &amp;   &lcub;a&lowbar;&lcub;n-1&rcub;&rcub;   &amp;   &lcub;b&lowbar;&lcub;n-1&rcub;&rcub;&bsol;&bsol;&NewLine;&bsol;end&lcub;matrix&rcub;&NewLine;&bsol;right&rsqb;&NewLine;&bsol;left&lsqb;&NewLine;&bsol;begin&lcub;matrix&rcub;&NewLine;   &lcub;x&lowbar;0 &rcub;  &bsol;&bsol;&NewLine;   &lcub;x&lowbar;1 &rcub;  &bsol;&bsol;&NewLine;   &bsol;cdot   &bsol;&bsol;&NewLine;   &bsol;cdot   &bsol;&bsol;&NewLine;   &bsol;cdot   &bsol;&bsol;&NewLine;   &lcub;x&lowbar;&lcub;n-2&rcub; &rcub; &bsol;&bsol;&NewLine;   &lcub;x&lowbar;&lcub;n-1&rcub; &rcub;  &bsol;&bsol;&NewLine;&bsol;end&lcub;matrix&rcub;&NewLine;&bsol;right&rsqb;&NewLine;&equals;&NewLine;&bsol;left&lsqb;&NewLine;&bsol;begin&lcub;matrix&rcub;&NewLine;   &lcub;e&lowbar;0 &rcub;  &bsol;&bsol;&NewLine;   &lcub;e&lowbar;1 &rcub;  &bsol;&bsol;&NewLine;   &bsol;cdot   &bsol;&bsol;&NewLine;   &bsol;cdot   &bsol;&bsol;&NewLine;   &bsol;cdot   &bsol;&bsol;&NewLine;   &lcub;e&lowbar;&lcub;n-2&rcub; &rcub;  &bsol;&bsol;&NewLine;   &lcub;e&lowbar;&lcub;n-1&rcub; &rcub;  &bsol;&bsol;&NewLine;&bsol;end&lcub;matrix&rcub;&NewLine;&bsol;right&rsqb;&period;" valign="middle" src="images/left-beginmatrix-b_0-c_0-d_0-0-a_1-b_1-c_1-d_-28211f3a7e.png" width="528" height="173.5"></p>

The solver will fail if the matrix is singular and may not succeed if the matrix is not diagonally dominant. If the solver fails, it will log a console message and return false.

## Example

Consider the solution of the tridiagonal system

<p align="center"><img alt="&bsol;left&lsqb;&NewLine;&bsol;begin&lcub;matrix&rcub;&NewLine;   2 &amp; 1 &amp;  0 &bsol;&bsol;&NewLine;  -1 &amp; 7 &amp;  4 &bsol;&bsol;&NewLine;   0 &amp; 2 &amp; -3 &bsol;&bsol;&NewLine;&bsol;end&lcub;matrix&rcub;&NewLine;&bsol;right&rsqb;&NewLine;&bsol;left&lsqb;&NewLine;&bsol;begin&lcub;matrix&rcub;&NewLine;   &lcub;x&lowbar;0 &rcub;  &bsol;&bsol;&NewLine;   &lcub;x&lowbar;1 &rcub;  &bsol;&bsol;&NewLine;   &lcub;x&lowbar;2 &rcub;  &bsol;&bsol;&NewLine;&bsol;end&lcub;matrix&rcub;&NewLine;&bsol;right&rsqb;&NewLine;&equals;&NewLine;&bsol;left&lsqb;&NewLine;&bsol;begin&lcub;matrix&rcub;&NewLine;   &lcub;4&rcub;  &bsol;&bsol;&NewLine;   &lcub;25&rcub;  &bsol;&bsol;&NewLine;   &lcub;-5&rcub;  &bsol;&bsol;&NewLine;&bsol;end&lcub;matrix&rcub;&NewLine;&bsol;right&rsqb;&period;" valign="middle" src="images/left-beginmatrix-2-1-0-1-7-4-0-2-3-endmatrix--f1451b965d.png" width="269" height="78"></p>

```javascript
var solveBanded = require('solve-banded')

var e = [4, 25, -5]

solveBanded([[0, -1, 2], [2, 7, -3], [1, 4, 0]], 1, 1, e, 3)

console.log(e)
// => e = [ 1, 2, 3 ]
```

## Installation

```javascript
$ npm install solve-banded
```

## API

#### `require('solve-banded')(d, nsub, nsup, x, nx[, ox = 1[, sx = 1]])`
**Arguments**:
- `d`: an array of diagonal bands, starting with with the subdiagonal-most band (a in the example matrix above) and proceeding to the superdiagonal-most band (d in the example matrix above). Each vector must be a javascript `Array` or typed array of length `nx`.
- `nsub`: an integer representing the number of subdiagonal bands, excluding the diagonal.
- `nsup`: an integer representing the number of superdiagonal bands, excluding the diagonal.
- `x`: a javascript `Array` or typed array of length `nx` representing the known vector (e in the example matrix above). On successful completion, this vector will contain the solution.
- `nx`: an integer representing the number of equations, i.e. the length of `x`.
- `ox` (optional): an integer representing the offset of data in `x`. If not provided, assumed equal to zero.
- `sx` (optional): an integer representing the stride of data in `x`. If not provided, assumed equal to one.

**Returns**: True on successful completion, false otherwise.

## License
&copy; 2016 Ricky Reusser. MIT License.