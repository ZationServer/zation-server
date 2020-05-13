/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const checkValidControllerBaseRequest  = require("../../../../dist/lib/main/controller/handle/controllerReqUtils").checkValidControllerBaseRequest;
const assert                           = require("chai").assert;

describe('Main.Controller.ControllerReqUtils',() => {

    describe('Methods',() => {

        describe('isValidReqStructure',() => {
            [
                [{c: 'hallo',d: {}},true],
                [undefined,false],
                [null,false],
                [10,false],
                [{c: 0,a: 3},true],
                [{d: {}},false],
            ].forEach(([req,expect],index) =>
            {
                it('test-'+index,() => {
                    assert.equal(checkValidControllerBaseRequest(req),expect);
                });
            });

        });

    });

});