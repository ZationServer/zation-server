/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {PrecompiledEvents} from '../config/definitions/parts/events';

export class ErrorEventHolder {

    private static event: PrecompiledEvents['error'];

    /**
     * Sets the error event.
     * @param event
     */
    static set(event: PrecompiledEvents['error']): void {
        ErrorEventHolder.event = event;
    }

    /**
     * Returns the error event.
     */
    static get(): PrecompiledEvents['error']  {
        if(ErrorEventHolder.event){
            return ErrorEventHolder.event;
        }
        throw new Error('Error event is unknown.');
    }

}