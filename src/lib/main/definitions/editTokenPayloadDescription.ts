/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ObjectEditAction} from './objectEditAction';

export interface EditTokenPayloadDescription {
    operations: ObjectEditAction[],
    target: string | number,
    exceptSocketSids: string[]
}