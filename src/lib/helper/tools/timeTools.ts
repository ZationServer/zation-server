/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import moment = require('moment-timezone');
import Logger = require('../logger/logger');

class TimeTools
{
    static getMoment(timeZone : string) {
        // noinspection JSUnresolvedFunction
        return moment().tz(timeZone);
    }

    static processTaskTriggerTime({hour,minute,second,millisecond},timeZone : string)
    {
        let now = TimeTools.getMoment(timeZone);
        let fireMoment = TimeTools.getMoment(timeZone);

        let isHour = hour !== undefined;
        let isMinute = minute !== undefined;
        let isSecond = second !== undefined;
        let isMillisecond = millisecond !== undefined;

        //load only set values
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

        const process = (fireMoment) =>
        {
            Logger.printDebugInfo(`Background Task is planed to -> ${fireMoment.format('dddd, MMMM Do YYYY, k:mm:ss:SSSS ')}`);
            return moment.duration(fireMoment.diff(now)).asMilliseconds();
        };


        if(fireMoment.isSameOrBefore(now))
        {
            if(!millisecond)
            {
                let tempDate = fireMoment.clone();
                tempDate.millisecond = now.millisecond;
                tempDate.add(1,'millisecond');
                if(tempDate.isAfter(now))
                {
                    return process(tempDate);
                }
            }
            if(!second)
            {
                let tempDate = fireMoment.clone();
                tempDate.second = now.second;
                tempDate.add(1,'seconds');
                if(tempDate.isAfter(now))
                {
                    return process(tempDate);
                }
            }
            if(!minute)
            {
                let tempDate = fireMoment.clone();
                tempDate.minute = now.minute;
                tempDate.add(1,'minutes');
                if(tempDate.isAfter(now))
                {
                    return process(tempDate);
                }
            }
            if(!hour)
            {
                let tempDate = fireMoment.clone();
                tempDate.hour = now.hour;
                tempDate.add(1,'hours');
                if(tempDate.isAfter(now))
                {
                    return process(tempDate);
                }
            }

            fireMoment.add(1,'days');
            return process(fireMoment);
        }
        return process(fireMoment);
    }

}

export = TimeTools;