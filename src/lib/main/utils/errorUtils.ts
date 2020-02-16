/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackError         from "../../api/BackError";
import BackErrorBag      from "../../api/BackErrorBag";
import {MainBackErrors}  from "../zationBackErrors/mainBackErrors";
import {ResponseError}   from "../controller/request/controllerDefinitions";

export default class ErrorUtils {

    private constructor(){}

    /**
     * A util method that converts a BackError, BackErrorBag, or any error to a response object.
     * @param error
     * @param withErrorDescription
     */
    static convertErrorToResponseErrors(error: BackError | BackErrorBag | any, withErrorDescription: boolean = false): ResponseError[]
    {
        if(error instanceof BackError) {
            return [error._toResponseError(withErrorDescription)];
        }
        else if(error instanceof BackErrorBag){
            return error._toResponseErrorArray(withErrorDescription);
        }
        else {
            return [(new BackError(MainBackErrors.unknownError))._toResponseError()];
        }
    }
}