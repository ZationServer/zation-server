/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export interface ReceiverPackage {
    /**
     * Receiver
     */
    r: string,
    /**
     * Input
     */
    i?: any,
    /**
     * ApiLevel
     */
    a?: number
}

export const RECEIVER_EVENT = 'R>';