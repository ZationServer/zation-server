/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AnyDataboxClass} from '../../api/databox/AnyDataboxClass';
import {AnyChannelClass} from '../../api/channel/AnyChannelClass';
import {AnyClass}        from '../utils/typeUtils';
import {componentSymbol} from '../component/componentUtils';
import {singletonSymbol} from '../../api/Singleton';
// noinspection ES6PreferShortImport
import {bag}             from '../../api/Bag';
import Process, {ProcessType} from '../../api/Process';

export default class InjectionsManager {

    private static instance: InjectionsManager = new InjectionsManager();

    static get(): InjectionsManager {
        return InjectionsManager.instance;
    }

    private injections: (() => Promise<void>)[] = [];

    addInjection(target: any,propKey: string,inject: AnyDataboxClass[] | AnyChannelClass[] | AnyClass[]
        | [(() => any | Promise<any>)])
    {
        if(Process.type !== ProcessType.Worker) return;
        if(inject.length > 0){
            let valueGetter: () => Promise<any> | any;

            if(inject.length === 1 && !inject[0][componentSymbol] && !inject[0][singletonSymbol]) {
                valueGetter = inject[0] as () => Promise<any> | any;
            }
            else valueGetter = () => bag.get(...(inject as any));

            this.injections.push(async () => {
                target[propKey] = await valueGetter();
            });
        }
    }

    async processInjections(): Promise<void> {
        const promises: Promise<void>[] = [];
        for(let i = 0; i < this.injections.length; i++){
            promises.push(this.injections[i]());
        }
        await Promise.all(promises);
    }

}