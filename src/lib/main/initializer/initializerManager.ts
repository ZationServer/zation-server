/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export default class InitializerManager {

    private static instance: InitializerManager = new InitializerManager();

    static get(): InitializerManager {
        return InitializerManager.instance;
    }

    private initializers: (() => Promise<void>)[] = [];

    addInitializer(func: () => any){
        this.initializers.push(func);
    }

    async processInitializers() {
        const thisProxy = new Proxy({},{
            get: () => {throw new Error('An initializer cannot access this context.');},
            set: () => {throw new Error('An initializer cannot access this context.');}
        });

        const promises: Promise<void>[] = [];
        for(let i = 0; i < this.initializers.length; i++) {
            promises.push(this.initializers[i].call(thisProxy));
        }
        await Promise.all(promises);
    }
}