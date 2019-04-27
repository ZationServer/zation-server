/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default interface PubDataInfo {
    /**
     * The event name.
     */
    e : string,
    /**
     * Published data.
     */
    d : any,
    /**
     * Source socket sid.
     */
    sSid ?: string
}
