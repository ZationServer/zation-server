/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const IdCounter       = require("../../../../dist/lib/main/utils/idCounter").default;
const assert          = require("chai").assert;

describe('MAIN.UTILS.IdCounter',() => {

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