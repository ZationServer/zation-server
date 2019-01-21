const moment          = require("moment");
const assert          = require("chai").assert;
const ZationReqTools  = require('../../../../dist/lib/helper/tools/zationReqTools');

describe('HELPER.TOOLS.ZATION_REQ_TOOLS',() => {

    describe('Methods',() => {

        describe('isValidReqStructure',() => {
            [
                [{v : 1.0, t : {i : [], c : 'hallo'}},false,false],
                [{v : 1.0, s : 'android', t : {i : [], c : 'hallo'}},false,true],
                [{t : {i : [], sc : 'hallo'}},true,true],
                [{t : {i : [], c : 'hallo'}},true,true],
                [{t : {i : []}},true,false],
                [{t : {c : ''}},true,false],
            ].forEach(([req,wsReq,expect],index) =>
            {
                it('test-'+index,() => {
                    assert.equal(ZationReqTools.isValidReqStructure(req,wsReq),expect);
                });
            });

        });

    });

});