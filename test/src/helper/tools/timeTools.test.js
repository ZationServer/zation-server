const moment          = require("moment");
const assert          = require("chai").assert;
const TimeTools       = require('../../../../dist/lib/helper/tools/timeTools');

describe('HELPER.TOOLS.TIME-TOOLS',() => {

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
                assert.equal(TimeTools.processTaskTriggerTime(option,time,false),ms);
            });
        });

    });

});