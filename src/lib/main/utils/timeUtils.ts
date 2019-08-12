/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import momentTz             = require('moment-timezone');
import {Moment as MomentType} from "moment-timezone";

export default class TimeUtils {
    static getMoment(timeZone: string) {
        // noinspection JSUnresolvedFunction
        return momentTz().tz(timeZone);
    }

    static processTaskTriggerTime({hour, minute, second, millisecond}, startMoment: MomentType) : {tillMs : number,tillFormat : string} {
        let now: MomentType = startMoment;
        let fireMoment: MomentType = now.clone();

        let isHour = hour !== undefined;
        let isMinute = minute !== undefined;
        let isSecond = second !== undefined;
        let isMillisecond = millisecond !== undefined;

        //load only set values
        if (isMillisecond) {
            fireMoment.set({ms: millisecond});
        }
        if (isSecond) {
            fireMoment.set({s: second});
        }
        if (isMinute) {
            fireMoment.set({m: minute});
        }
        if (isHour) {
            fireMoment.set({h: hour});
        }

        //Zero setter
        if (isHour) {
            if (!isMinute) {
                fireMoment.set({m: 0});
            }
            if (!isSecond) {
                fireMoment.set({s: 0});
            }
            if (!isMillisecond) {
                fireMoment.set({ms: 0});
            }
        } else if (isMinute) {
            if (!isSecond) {
                fireMoment.set({s: 0});
            }
            if (!isMillisecond) {
                fireMoment.set({ms: 0});
            }
        } else if (isSecond) {
            if (!isMillisecond) {
                fireMoment.set({ms: 0});
            }
        }

        const process = (fireMoment) => {
            return {
                tillMs : momentTz.duration(fireMoment.diff(now)).asMilliseconds(),
                tillFormat : fireMoment.format('dddd, MMMM Do YYYY, k:mm:ss:SSSS ')
            };
        };


        if (fireMoment.isSameOrBefore(now)) {
            if (!isHour) {
                if (!isMinute) {
                    if (!isSecond) {
                        if (!isMillisecond) {
                            let tempDate = fireMoment.clone();
                            tempDate.millisecond = now.millisecond;
                            tempDate.add(1, 'millisecond');
                            if (tempDate.isAfter(now)) {
                                return process(tempDate);
                            }
                        }
                        let tempDate = fireMoment.clone();
                        tempDate.second = now.second;
                        tempDate.add(1, 'seconds');
                        if (tempDate.isAfter(now)) {
                            return process(tempDate);
                        }
                    }
                    let tempDate = fireMoment.clone();
                    tempDate.minute = now.minute;
                    tempDate.add(1, 'minutes');
                    if (tempDate.isAfter(now)) {
                        return process(tempDate);
                    }
                }
                let tempDate = fireMoment.clone();
                tempDate.hour = now.hour;
                tempDate.add(1, 'hours');
                if (tempDate.isAfter(now)) {
                    return process(tempDate);
                }
            }

            fireMoment.add(1, 'days');
            return process(fireMoment);
        }
        return process(fireMoment);
    }

}