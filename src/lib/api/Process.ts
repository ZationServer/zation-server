/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export const enum ProcessType {
    Master,
    Worker,
    Broker
}

export default class Process {
    public static readonly type: ProcessType | undefined;
}