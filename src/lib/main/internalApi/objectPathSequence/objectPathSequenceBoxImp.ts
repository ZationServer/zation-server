/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ObjectPathSequence}        from "./objectPathSequence";

export default class ObjectPathSequenceBoxImp implements ObjectPathSequence
{
    private modified: boolean = false;
    private objPathSeq: ObjectPathSequence[];

    constructor(...objectPathSequence: ObjectPathSequence[]){
        this.objPathSeq = objectPathSequence;
    }

    set(path: string | string[],value: any): ObjectPathSequenceBoxImp {
        for(let i = 0; i < this.objPathSeq.length; i++){
            this.objPathSeq[i].set(path,value);
        }
        this.modified = true;
        return this;
    }

    delete(path?: string | string[]): ObjectPathSequenceBoxImp {
        for(let i = 0; i < this.objPathSeq.length; i++){
            this.objPathSeq[i].delete(path);
        }
        this.modified = true;
        return this;
    }

    clear(): ObjectPathSequenceBoxImp {
        for(let i = 0; i < this.objPathSeq.length; i++){
            this.objPathSeq[i].clear();
        }
        this.modified = true;
        return this;
    }

    hasUncommittedChanges(): boolean {
        return this.modified;
    }

    async commit() {
        if(this.modified) {
            for(let i = 0; i < this.objPathSeq.length; i++){
                await this.objPathSeq[i].commit();
            }
            this.modified = false;
        }
    }
}

