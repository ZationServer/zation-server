/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {RespondFunction} from "../sc/socket";
import RespondUtils      from "../utils/respondUtils";
import AsyncChain        from "../utils/asyncChain";
import {ErrorName}       from "../constants/errorName";

export type FetchManagerBuilder<F extends (input : any,...any : any[]) => any> = () => ((respond : RespondFunction, func : F, ...params : Parameters<F>) => Promise<void>);

export default class DataBoxFetchManager {

    private constructor(){}

    /**
     * This method returns a closure to build a fetch manager.
     */
    static buildFetchMangerBuilder<F extends (...any : any[]) => any>(parallelFetch : boolean,maxBackpressure : number) : FetchManagerBuilder<F>
    {
        if(!parallelFetch) {
            return () => {
                return RespondUtils.respondWithFunc;
            };
        }
        else {
            return () => {
                const chain = new AsyncChain();
                return async (respond : RespondFunction,func : F,...params : Parameters<F>) => {
                    //process input before adding to chain
                    if(chain.getBackpressure() < maxBackpressure){
                        chain.addToChain(async () => {
                            await RespondUtils.respondWithFunc(respond,func,...params);
                        });
                    }
                    else {
                        const err : any = new Error('Max backpressure limit reached.');
                        err.name = ErrorName.MAX_BACKPRESSURE_REACHED;
                        respond(err);
                    }
                };
            };
        }
    }

}