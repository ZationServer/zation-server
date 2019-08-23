/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {RespondFunction} from "../sc/socket";
import AsyncChain        from "../utils/asyncChain";
import {ClientErrorName} from "../constants/clientErrorName";

export type FetchManagerBuilder<F extends (input : any,...any : any[]) => any> =
    () => ((respond : RespondFunction,caller : () => any | Promise<any>,isReloadTarget : boolean) => Promise<void>);

export default class DataboxFetchManager {

    private constructor(){}

    /**
     * This method returns a closure to build a fetch manager.
     */
    static buildFetchMangerBuilder<F extends (...any : any[]) => any>(parallelFetch : boolean,maxBackpressure : number) : FetchManagerBuilder<F>
    {
        if(parallelFetch) {
            return () => {
                return async (respond : RespondFunction,caller : () => any | Promise<any>) => {
                    respond(null,(await caller()));
                }
            };
        }
        else {
            return () => {
                const mainChain = new AsyncChain();
                const reloadChain = new AsyncChain();
                return async (respond : RespondFunction,caller : () => any | Promise<any>,isReloadTarget : boolean) => {
                    const selectedChain = isReloadTarget ? reloadChain : mainChain;
                    if(selectedChain.getBackpressure() < maxBackpressure){
                        await selectedChain.runInChain(async () => {
                            respond(null,(await caller()));
                        });
                    }
                    else {
                        const err : any = new Error('Max backpressure limit reached.');
                        err.name = ClientErrorName.MAX_BACKPRESSURE_REACHED;
                        respond(err);
                    }
                };
            };
        }
    }

}