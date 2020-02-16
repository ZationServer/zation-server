/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Event, EventConfig, EventInit, middlewareEvents, PreprocessedEvents} from "../config/definitions/eventConfig";
import Bag                             from "../../api/Bag";
import {eventInitSymbol}               from "../../api/Config";
import FuncUtils                       from "../utils/funcUtils";

export default class EventPreprocessor {

    private readonly bag: Bag;

    constructor(bag: Bag) {
        this.bag = bag;
    }

    async preprocessEventConfig(eventConfig: EventConfig): Promise<PreprocessedEvents> {
        const defaultFunc = () => {};
        const res: PreprocessedEvents = {
            express: defaultFunc,
            socketServer: defaultFunc,
            workerInit: defaultFunc,
            masterInit: defaultFunc,
            workerStarted: defaultFunc,
            workerLeaderStarted: defaultFunc,
            httpServerStarted: defaultFunc,
            wsServerStarted: defaultFunc,
            started: defaultFunc,
            beforeError: defaultFunc,
            beforeBackError: defaultFunc,
            beforeCodeError: defaultFunc,
            beforeBackErrorBag: defaultFunc,
            workerMessage: defaultFunc,
            socketInit: defaultFunc,
            socketConnection: defaultFunc,
            socketDisconnection: defaultFunc,
            socketAuthentication: defaultFunc,
            socketDeauthentication: defaultFunc,
            socketAuthStateChange: defaultFunc,
            socketSubscription: defaultFunc,
            socketUnsubscription: defaultFunc,
            socketError: defaultFunc,
            socketRaw: defaultFunc,
            socketConnectionAbort: defaultFunc,
            socketBadAuthToken: defaultFunc
        };

        const promises: Promise<void>[] = [];
        for(let k in eventConfig) {
            if (eventConfig.hasOwnProperty(k)) {
                promises.push((async () => {
                    res[k] = await this.processEvent(
                        eventConfig[k],middlewareEvents.includes(k) ?
                            FuncUtils.createFuncMiddlewareAsyncInvoker: FuncUtils.createFuncArrayAsyncInvoker
                    );
                })());
            }
        }
        await Promise.all(promises);
        return res;
    }

    async processEvent<T>(event: Event<T>,eventCombiner: (events: T[]) => T): Promise<T> {
        if(typeof event === 'function'){
            return this.processEventFunc(event);
        }
        else {
            const length = (event as (EventInit<T> | T)[]).length;
            const res: T[] = [];
            const promises: Promise<void>[] = [];
            for(let i = 0; i < length; i++){
                promises.push((async () =>
                {
                    res.push(await this.processEventFunc(event[i]))
                })());
            }
            await Promise.all(promises);
            return eventCombiner(res);
        }
    }

    private async processEventFunc<T>(event: T | EventInit<T>): Promise<T> {
        if(event[eventInitSymbol]){
            return (event as EventInit<T>)(this.bag);
        }
        else{
            return event as T;
        }
    }

}