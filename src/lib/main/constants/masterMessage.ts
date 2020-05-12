/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export const enum MasterMessageAction {
    backgroundTask,
    componentStructure
}

export interface MasterMessagePackage {
    0: MasterMessageAction,
    1?: any
}