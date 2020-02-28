/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export default class Stopwatch {

    private currentTime: number;

    /**
     * Resets and starts the stopwatch.
     */
    start() {
        this.currentTime = performance.now();
    }

    /**
     * Stops the stopwatch and returns the milliseconds.
     * @param toString
     */
    stop(toString: false): number
    /**
     * Stops the stopwatch and returns a formatted string with the result.
     * @param toString
     */
    stop(toString: true): string
    stop(toString: boolean = true): string | number {
        if(toString) {
            return `In ${(performance.now() - this.currentTime).toFixed(2)}ms.`
        }
        return performance.now() - this.currentTime;
    }
}