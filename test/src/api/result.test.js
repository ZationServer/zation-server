/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Result          = require("../../../dist/lib/api/Result").default;
const assert          = require("chai").assert;

describe('API.Result',() => {

    describe('Constructor',() => {

        it('Default',() => {
            const re = new Result();
            assert.equal(re.getResult(),undefined);
        });

        it('Overloaded',() => {
            const re = new Result('MyResult');
            assert.equal(re.getResult(),'MyResult');
        });

        it('Overloaded-2',() => {
            const re = new Result('MyResult',23);
            assert.equal(re.getResult(),'MyResult');
            assert.equal(re.getStatusCode(),23);
        });
    });

    describe('Methods',() => {

        it('toString',() => {
            const re = new Result('myRes',1);
            assert.equal(re.toString(),'Result: myRes StatusCode: 1');
        });

        it('setResult',() => {
            const re = new Result();
            assert.equal(re.getResult(),undefined);
            re.setResult(200);
            assert.equal(re.getResult(),200);
        });

        it('remove and has Result',() => {
            const re = new Result('res1');
            assert(re.hasResult());
            re.removeResult();
            assert(!re.hasResult());
        });

        it('setStatusCode',() => {
            const re = new Result();
            assert.equal(re.getStatusCode(),undefined);
            re.setStatusCode(200);
            assert.equal(re.getStatusCode(),200);
        });

        it('remove and has StatusCode',() => {
            const re = new Result('res1',200);
            assert(re.hasStatusCode());
            re.removeStatusCode();
            assert(!re.hasStatusCode());
        });

        it('getTypeOfResult',() => {
            const re = new Result('res1',200);
            assert.equal(re.getTypeOfResult(),'string');
            re.setResult(200);
            assert.equal(re.getTypeOfResult(),'number');
        });

        it('getJsonObject',() => {
            const re = new Result('res1',200);
            assert.deepEqual(re._getJsonObj(),{ r: 'res1', s: 200 });
        });

    });

});