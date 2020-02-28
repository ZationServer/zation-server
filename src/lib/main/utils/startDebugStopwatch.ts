/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Stopwatch from './stopwatch';
import Logger    from '../log/logger';

export default class StartDebugStopwatch {

    private readonly stopwatch: Stopwatch = new Stopwatch();

    constructor(startDebug: boolean) {
        if(!startDebug) {
            this.start = () => {};
            this.stop = () => {};
        }
    }

    /**
     * Starts the stopwatch in case of start debug active.
     */
    start() {
        this.stopwatch.start();
    }

    /**
     * Stops the stopwatch and logs the result in case of start debug is active.
     * @param msg
     */
    stop(msg: string) {
        Logger.log.startDebug(`${msg}. ${this.stopwatch.stop(true)}`);
    }

}