/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {BaseCudAction, CudAction, CudType} from "./dbDefinitions";
const uniqid                   = require('uniqid');

export default class DataBoxUtils {

    // noinspection JSMethodCanBeStatic
    /**
     * Creates a the baseCudAction.
     */
     static createBaseCudAction() : BaseCudAction {
        return {
            cudId : uniqid(),
            timestamp : Date.now()
        }
     }

     static buildInsert(keyPath : string[], value : any) : CudAction {
         return {
             ...(DataBoxUtils.createBaseCudAction()),
             type : CudType.insert,
             keyPath : keyPath,
             value : value
         }
     }




}