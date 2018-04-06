/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const moment = require('moment-timezone');
const Const  = require('./../constante/constWrapper');

class TimeTools
{
    static getMoment(zc)
    {
        // noinspection JSUnresolvedFunction
        return moment().tz(zc.getMain(Const.Main.TIME_ZONE));
    }

    static processTaskTriggerTime({hour,minute,second,millisecond},zc)
    {
        let now = TimeTools.getMoment(zc);

        let fireMillisecond = now.millisecond();
        let fireSecond = now.second();
        let fireMinute = now.minute();
        let fireHour = now.hour();
        let day = now.date();
        let month = now.month();
        let year = now.year();

        if(millisecond !== undefined)
        {
            fireMillisecond = millisecond;
        }
        else
        {
            fireMillisecond = 0;
        }
        if(second !== undefined)
        {
            fireSecond = second;
        }
        else
        {
            if(millisecond <= now.millisecond() && millisecond !== undefined)
            {
                fireSecond++;
            }
            else
            {
                fireSecond = 0;
            }
        }
        if(minute !== undefined)
        {
            fireMinute = minute;
        }
        else
        {
            if(second <= now.second() && second !== undefined)
            {
                fireMinute++;
            }
            else if(millisecond === undefined)
            {
                fireMinute = 0;
            }
        }
        if(hour !== undefined)
        {
            fireHour = hour;
        }
        else {
            if(minute <= now.minute() && minute !== undefined)
            {
                fireHour++;
            }
            else if(second === undefined && millisecond === undefined)
            {
                fireHour = 0;
            }
        }
        if(hour <= now.hour() && hour !== undefined)
        {
            day++;
        }

        let fireMoment = moment(
            {
                year,
                month,
                day,
                hour : fireHour,
                minute : fireMinute,
                second :fireSecond,
                millisecond : fireMillisecond
            });

        zc.printDebugInfo(`Background Task is planed to -> ${fireMoment.format('dddd, MMMM Do YYYY, k:mm:ss:SSSS ')}`);

        // noinspection JSUnresolvedFunction
        return moment.duration(fireMoment.diff(now)).asMilliseconds();
    }

}

module.exports = TimeTools;