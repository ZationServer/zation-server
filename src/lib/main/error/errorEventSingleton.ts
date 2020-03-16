/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {PrecompiledEvents} from '../config/definitions/parts/events';

export class ErrorEventSingleton {

    private static event: PrecompiledEvents['error'];

    /**
     * Sets the error event.
     * @param event
     */
    static set(event: PrecompiledEvents['error']): void {
        ErrorEventSingleton.event = event;
    }

    /**
     * Returns the error event.
     */
    static get(): PrecompiledEvents['error']  {
        if(ErrorEventSingleton.event){
            return ErrorEventSingleton.event;
        }
        throw new Error('Error event is unknown.');
    }

}