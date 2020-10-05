/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {PreparedEvents} from '../config/definitions/parts/events';

export class ErrorEventHolder {

    private static event: PreparedEvents['error'];

    /**
     * Sets the error event.
     * @param event
     */
    static set(event: PreparedEvents['error']): void {
        ErrorEventHolder.event = event;
    }

    /**
     * Returns the error event.
     */
    static get(): PreparedEvents['error']  {
        if(ErrorEventHolder.event){
            return ErrorEventHolder.event;
        }
        throw new Error('Error event is unknown.');
    }

}