/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */


// noinspection TypeScriptPreferShortImport
import {Bag}                      from "../../api/Bag";
import ObjectPathActionSequence = require("./objectPathActionSequence");
import ObjectPathSequence =       require("./objectPathSequence");

export class ObjectPathCombineSequence
{
    private objActions : ObjectPathActionSequence;
    private objNormal : ObjectPathSequence;

    constructor(userId : string | number,socketSid : string,bag : Bag) {
       this.objNormal  = bag.seqEditTokenVariables();
       this.objActions = bag.seqEditTokenVariablesOnUserId(userId,socketSid);
    }

    set(path : string | string[],value : any) : ObjectPathCombineSequence {
        this.objNormal.set(path,value);
        this.objActions.set(path,value);
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    delete(path ?: string | string[]) : ObjectPathCombineSequence {
        this.objNormal.delete(path);
        this.objActions.delete(path);
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    async commit() {
        await this.objNormal.commit();
        await this.objActions.commit();
    }
}
