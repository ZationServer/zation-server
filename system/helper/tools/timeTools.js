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

    static processTaskTriggerTime({hour,minute,second,millisecond},zc,forNext = false)
    {
        let now = TimeTools.getMoment(zc);

        let isHour = hour !== undefined;
        let isMinute = minute !== undefined;
        let isSecond = second !== undefined;
        let isMillisecond = millisecond !== undefined;

        let fireMillisecond = 0;
        let fireSecond = 0;
        let fireMinute = now.minute();
        let fireHour = now.hour();
        let day = now.date();
        let month = now.month();
        let year = now.year();

        if(isMillisecond)
        {
            fireMillisecond = millisecond;
        }

        if(isSecond)
        {
            fireSecond = second;
        }
        else  if(millisecond <= now.millisecond() && isMillisecond)
        {
            fireSecond++;
        }

        if(isMinute)
        {
            fireMinute = minute;
        }
        else
        {
            if(second <= now.second() && isSecond)
            {
                fireMinute++;
            }
            else if(isMillisecond)
            {
                fireMinute = 0;
            }
        }
        if(isHour)
        {
            fireHour = hour;
        }
        else {
            if(minute <= now.minute() && isMinute)
            {
                fireHour++;
            }
            else if(!isSecond && !isMillisecond)
            {
                fireHour = 0;
            }
        }
        if(hour <= now.hour() && isHour && !isMinute)
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