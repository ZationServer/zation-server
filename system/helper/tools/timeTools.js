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
        let fireMoment = TimeTools.getMoment(zc);

        let isHour = hour !== undefined;
        let isMinute = minute !== undefined;
        let isSecond = second !== undefined;
        let isMillisecond = millisecond !== undefined;


        if(isMillisecond)
        {
            fireMoment.set({ms : millisecond});
        }

        if(isSecond)
        {
            fireMoment.set({s : second});
        }
        else if(fireMoment.millisecond() <= now.millisecond())
        {
            TimeTools._increaseSecond(fireMoment,isMinute,isHour);
        }

        if(isMinute)
        {
            fireMoment.set({m : minute});
        }
        else if(fireMoment.second() < now.second() && isSecond||
            (fireMoment.second() === now.second() && fireMoment.millisecond() <= now.millisecond() && isMillisecond) ||
            (fireMoment.second() === now.second() && !isMillisecond))
        {
            console.log(fireMoment.second());
            console.log(now.second());

           TimeTools._increaseMinute(fireMoment,isHour);
        }

        if(isHour)
        {
            fireMoment.set({h : hour});
        }
        else if(minute < now.minute() && isMinute||
            (fireMoment.minute() === now.minute() && fireMoment.second() <= now.second() && isSecond) ||
            (fireMoment.minute() === now.minute() && !isSecond))
        {
            fireMoment.add(1,'hours');
        }

        if(fireMoment.hour() < now.hour() && isHour||
            (fireMoment.hour() === now.hour() && isMinute && fireMoment.minute() <= now.minute()) ||
            (fireMoment.hour() === now.hour && !isMinute))
        {
            fireMoment.add(1,'days');
        }


        //Zero setter
        if(isHour)
        {
            if(!isMinute) {fireMoment.set({m : 0});}
            if(!isSecond) {fireMoment.set({s : 0});}
            if(!isMillisecond) {fireMoment.set({ms : 0});}
        }
        else if(isMinute)
        {
            if(!isSecond) {fireMoment.set({s : 0});}
            if(!isMillisecond) {fireMoment.set({ms : 0});}
        }
        else if(isSecond)
        {
            if(!isMillisecond) {fireMoment.set({ms : 0});}
        }

        zc.printDebugInfo(`Background Task is planed to -> ${fireMoment.format('dddd, MMMM Do YYYY, k:mm:ss:SSSS ')}`);

        // noinspection JSUnresolvedFunction
        return moment.duration(fireMoment.diff(now)).asMilliseconds();
    }

    static _increaseSecond(moment,isMinute,isHour)
    {
        if(moment.seconds() === 59)
        {
            if(!isMinute)
            {
                TimeTools._increaseMinute(moment,isHour);
            }
            else
            {
                TimeTools._increaseHour(moment,isHour);
            }

            moment.set({s : 0});
        }
        else
        {
            moment.add(1,'seconds');
        }
    }

    static _increaseMinute(moment,isHour)
    {
        if(moment.minute() === 59)
        {
            TimeTools._increaseHour(moment,isHour);
            moment.set({m : 0});
        }
        else
        {
            moment.add(1,'minutes');
        }
    }

    static _increaseHour(moment,isHour)
    {
        if(isHour)
        {
            moment.add(1,'days');
        }
        else
        {
            moment.add(1,'hours');
        }
    }



}

module.exports = TimeTools;