/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const moment = require('moment-timezone');
const Const  = require('../constants/constWrapper');
const Logger = require('../logger/logger');

class TimeTools
{
    static getMoment(zc)
    {
        // noinspection JSUnresolvedFunction
        return moment().tz(zc.getMain(Const.Main.KEYS.TIME_ZONE));
    }

    static processTaskTriggerTime({hour,minute,second,millisecond},zc)
    {
        let now = TimeTools.getMoment(zc);
        let fireMoment = TimeTools.getMoment(zc);

        let isHour = hour !== undefined;
        let isMinute = minute !== undefined;
        let isSecond = second !== undefined;
        let isMillisecond = millisecond !== undefined;

        if(isMillisecond) {fireMoment.set({ms : millisecond});}
        if(isSecond) {fireMoment.set({s : second});}
        if(isMinute) {fireMoment.set({m : minute});}
        if(isHour) {fireMoment.set({h : hour});}

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


        if(isHour && hour <= now.hour())
        {
            fireMoment.add(1,'days');
        }
        else if(isMinute && minute <= now.minute())
        {
            fireMoment.add(1,'hours');
        }
        else if(isSecond && second <= now.second())
        {
            fireMoment.add(1,'minutes')
        }
        else if(isMillisecond && millisecond <= now.millisecond())
        {
            fireMoment.add(1,'seconds');
        }
        Logger.printDebugInfo(`Background Task is planed to -> ${fireMoment.format('dddd, MMMM Do YYYY, k:mm:ss:SSSS ')}`);

        // noinspection JSUnresolvedFunction
        return moment.duration(fireMoment.diff(now)).asMilliseconds();
    }
}

module.exports = TimeTools;