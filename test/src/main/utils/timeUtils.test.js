/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const processTaskTriggerTime = require("../../../../dist/lib/main/utils/timeUtils").processTaskTriggerTime;
const moment                 = require("moment");
const assert                 = require("chai").assert;

describe('Main.Utils.TimeUtils',() => {

    describe('Methods',() => {

        const time = moment('2018-10-08 09:30:00.000');
        [
            [{minute : 10},2.4e+6],
            [{hour : 12,minute : 30},1.08e+7],
            [{second: 1},1000],
            [{hour : 14, minute : 22, second : 20},17540000],
            [{hour : 9},84600000],
            [{minute : 30},3.6e+6],
            [{second : 2},2000],
            [{second : 0},60000],
            [{},1],
            [{millisecond : 0},1000],
            [{hour : 0},52200000],
        ].forEach(([option,ms],index) =>
        {
            it('processTaskTriggerTime test-'+index,() => {
                // @ts-ignore
                assert.equal(processTaskTriggerTime(option,time).tillMs,ms);
            });
        });

    });

});