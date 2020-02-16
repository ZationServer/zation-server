/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ObjectPathSequence}        from "./objectPathSequence";

export default class ObjectPathSequenceBoxImp implements ObjectPathSequence
{
    private objPathSeq: ObjectPathSequence[];

    constructor(...objectPathSequence: ObjectPathSequence[]){
        this.objPathSeq = objectPathSequence;
    }

    set(path: string | string[],value: any): ObjectPathSequenceBoxImp {
        for(let i = 0; i < this.objPathSeq.length; i++){
            this.objPathSeq[i].set(path,value);
        }
        return this;
    }

    delete(path?: string | string[]): ObjectPathSequenceBoxImp {
        for(let i = 0; i < this.objPathSeq.length; i++){
            this.objPathSeq[i].delete(path);
        }
        return this;
    }

    async commit() {
        for(let i = 0; i < this.objPathSeq.length; i++){
            await this.objPathSeq[i].commit();
        }
    }
}

