"use strict";
var except = require('chai').expect;
var Aurelion = require('../lib/Aurelion');

/**
 * Vector2
 */
describe('Vector2', function () {
    var v;

    beforeEach(function () {
        v = new Aurelion.Vector2();
    });

    describe('#add', function () {
        it('should add two Vector2 together', function () {

            except(v.add(new Aurelion.Vector2(3, 3))).to.be.deep.equal(new Aurelion.Vector2(3, 3));
        });
    });
});
