/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {singletonSymbol} from '../../api/Singleton';
import DynamicSingleton  from '../utils/dynamicSingleton';
import Process, {ProcessType} from '../../api/Process';

export default class InitializerManager {

    private static instance: InitializerManager = new InitializerManager();

    static get(): InitializerManager {
        return InitializerManager.instance;
    }

    private initializers: {target: any,func: (() => Promise<void>)}[] = [];

    addInitializer(target: any,func: () => any){
        if(Process.type !== ProcessType.Worker) return;
        this.initializers.push({target,func});
    }

    async processInitializers() {
        const thisProxy = new Proxy({},{
            get: () => {throw new Error('A static or non-singleton method initializer cannot access this context.');},
            set: () => {throw new Error('A static or non-singleton method initializer cannot access this context.');}
        });

        const promises: Promise<void>[] = [];
        let initializer: {target: any,func: (() => Promise<void>)};
        for(let i = 0; i < this.initializers.length; i++) {
            initializer = this.initializers[i];
            promises.push(initializer.func.call(initializer.target.constructor[singletonSymbol] ?
                (DynamicSingleton.getInstance(initializer.target.constructor) || thisProxy) : thisProxy));
        }
        await Promise.all(promises);
    }
}