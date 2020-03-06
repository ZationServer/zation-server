/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
};