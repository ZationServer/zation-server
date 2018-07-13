/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
Class Description
This Class api makes it easier to
handle backgroundTask in the event config.
 */

import SmallBag = require("../../api/SmallBag");

type TaskFunction = (smallBag : SmallBag) => Promise<void>;
type SetBackgroundFunction = (time : Number | Object, task : TaskFunction) => void;

class BackgroundTasksSetter
{
    private readonly callAt : SetBackgroundFunction;
    private readonly callEvery : SetBackgroundFunction;

    constructor(callAt : SetBackgroundFunction,callEvery : SetBackgroundFunction)
    {
        this.callAt = callAt;
        this.callEvery = callEvery
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a Background Task that gets invoked on one time point.
     * @example
     * setAt({hour : 13},(smallBag =>
     * {
     *    //task....
     * }));
     * @param atTime
     * Can be an Object or Number for example:
     * Object -> {hour : 13, minute : 54, second : 50, millisecond : 10},
     * Number -> 2000
     * @param task
     * Function that describes the background task
     * witch gets invoked with a smallBag
     */
    setAt(atTime : Number | Object, task : TaskFunction) : void
    {
        this.callAt(atTime,task);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a background task which is called each time at a timestamp.
     * @example
     * setEvery({hour : 13},(smallBag =>
     * {
     *    //task....
     * }));
     * @param everyTime
     * Can be an Object or Number for example:
     * Object -> {hour : 13, minute : 54, second : 50, millisecond : 10},
     * Number -> 2000
     * @param task
     * Function that describes the background task
     * witch gets invoked with a smallBag
     */
    setEvery(everyTime : Number | Object, task : TaskFunction) : void
    {
        this.callEvery(everyTime,task);
    }
}

export = BackgroundTasksSetter;