/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {RespondFunction} from "../sc/socket";

export default class RespondUtils {

    /**
     * A function that will call the respond function with the result
     * of the task or with an error if an error is thrown.
     * @param respond
     * @param func
     * @param params
     */
    static async respondWithFunc<F extends (...any : any[]) => any>(respond : RespondFunction,func : F,...params : Parameters<F>) {
        try {
            respond(null,await func(...params));
        }
        catch (err) {
            respond(err);
        }
    }
}