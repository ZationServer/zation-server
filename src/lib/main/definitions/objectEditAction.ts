/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export const enum EditType {
    Delete,
    Set,
    Clear
}

interface ObjectSetAction {
    /**
     * Type
     */
    0: EditType.Set,
    /**
     * Path
     */
    1: string | string[],
    /**
     * Value
     */
    2?: any
}

interface ObjectDeleteAction {
    /**
     * Type
     */
    0: EditType.Delete,
    /**
     * Path
     */
    1: string | string[],
}

interface ObjectClearAction {
    /**
     * Type
     */
    0: EditType.Clear
}

export type ObjectEditAction = ObjectSetAction | ObjectDeleteAction | ObjectClearAction;