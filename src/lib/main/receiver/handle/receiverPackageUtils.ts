/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ReceiverPackage} from '../receiverDefinitions';

export function checkValidReceiverPackage(pack: ReceiverPackage | any | null | undefined | number | string): boolean {
    return typeof pack === 'object' && !!pack && typeof pack.r === 'string';
}