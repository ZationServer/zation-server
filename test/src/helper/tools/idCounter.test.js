const assert          = require("chai").assert;
const IdCounter       = require('../../../../dist/lib/helper/tools/idCounter');

describe('HELPER.TOOLS.IdCounter',() => {

    describe('Methods',() => {

        it('Unique test',() => {

            const ic = new IdCounter();

            let idTmp = ic.getId();

            for(let i = 0; i < 1000; i++) {
                ic.increase();
                let tmp = ic.getId();
                assert.notEqual(tmp,idTmp);
                idTmp = tmp;
            }
        });

    });

});