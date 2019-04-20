/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const IdCounter       = require("../../../../dist/lib/helper/tools/idCounter").default;
const assert          = require("chai").assert;

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