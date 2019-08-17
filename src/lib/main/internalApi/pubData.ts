/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export default interface PubData {
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
