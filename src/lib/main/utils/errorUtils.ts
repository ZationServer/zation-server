/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackError, {DryBackError} from '../../api/BackError';
import BackErrorBag      from "../../api/BackErrorBag";
import {MainBackErrors}  from "../zationBackErrors/mainBackErrors";

export default class ErrorUtils {
    /**
     * A util method that converts a BackError, BackErrorBag, or any error to dry BackErrors.
     * So that they can be transferred to the client.
     * @param error
     * @param withErrorDescription
     */
    static dehydrate(error: BackError | BackErrorBag | any, withErrorDescription: boolean = false): DryBackError[]
    {
        if(error instanceof BackError) {
            return [error._dehydrate(withErrorDescription)];
        }
        else if(error instanceof BackErrorBag){
            return error._dehydrate(withErrorDescription);
        }
        else {
            return [(new BackError(MainBackErrors.unknownError))._dehydrate()];
        }
    }
}