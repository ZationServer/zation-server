/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackErrorBag        from '../../api/BackErrorBag';
import BackError           from '../../api/BackError';
import {isCodeError}       from './codeError';
import Logger              from '../log/logger';
import {PrecompiledEvents} from '../config/definitions/parts/events';

export async function handleError(err: any,events: PrecompiledEvents) {
    const promises: (Promise<void> | void)[] = [];

    const backErrors = (err instanceof BackErrorBag) ? err.getBackErrors() :
        ((err instanceof  BackError) ? [err] : undefined);

    if(backErrors){
        const length = backErrors.length;
        let tmpBackError;
        for(let i = 0; i < length; i++){
            tmpBackError = backErrors[i];
            if(isCodeError(tmpBackError)){
                Logger.log.error(`Code error -> ${tmpBackError.toString()}/n stack-> ${tmpBackError.stack}`);
                promises.push(events.codeError(tmpBackError));
            }
        }
        promises.push(events.backErrors(backErrors));
    }
    else {
        Logger.log.error('Unknown error while processing a controller request:',err);
        promises.push(events.error(err));
    }
    await Promise.all(promises);
}