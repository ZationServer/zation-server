/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const ZationReqUtils  = require("../../../../dist/lib/helper/utils/zationReqUtils").default;
const assert          = require("chai").assert;

describe('HELPER.TOOLS.ZATION_ReqUtils',() => {

    describe('Methods',() => {

        describe('isValidReqStructure',() => {
            [
                [{v : 1.0, t : {i : [], c : 'hallo'}},false,false],
                [{v : 1.0, s : 'android', t : {i : [], c : 'hallo'}},false,true],
                [{t : {i : [], sc : 'hallo'}},true,true],
                [{t : {i : [], c : 'hallo'}},true,true],
                [{t : {i : []}},true,false],
                [{t : {c : ''}},true,true],
            ].forEach(([req,wsReq,expect],index) =>
            {
                it('test-'+index,() => {
                    assert.equal(ZationReqUtils.isValidReqStructure(req,wsReq),expect);
                });
            });

        });

    });

});