/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export const enum SyncTokenOperationType
{
    DELETE,
    SET
}

export interface SyncTokenDefinitions {
    /**
     * Type
     */
    t: SyncTokenOperationType,
    /**
     * Path
     */
    p?: string | string[],
    /**
     * Value
     */
    v?: any
}

export interface UpdateTokenMainData {
    operations: SyncTokenDefinitions[],
    target: string | number,
    exceptSocketSids: string[]
}