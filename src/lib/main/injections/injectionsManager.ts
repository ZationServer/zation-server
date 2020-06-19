/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AnyDataboxClass} from '../../api/databox/AnyDataboxClass';
import {AnyChannelClass} from '../../api/channel/AnyChannelClass';
import {InjectableClass} from '../../api/injections/Injectable';
import DataboxCore       from '../../api/databox/DataboxCore';
import ChannelCore       from '../../api/channel/ChannelCore';
// noinspection ES6PreferShortImport
import {bag}             from '../../api/Bag';

export default class InjectionsManager {

    private static instance: InjectionsManager = new InjectionsManager();

    static get(): InjectionsManager {
        return InjectionsManager.instance;
    }

    private injections: (() => Promise<void>)[] = [];

    addInjection(target: any,propKey: string,inject: AnyDataboxClass[] | AnyChannelClass[] | InjectableClass[]) {
        if(inject.length > 0){
            const firstInject = inject[0];
            let valueGetter: () => Promise<any> | any;
            if((firstInject as any).prototype instanceof DataboxCore){
                valueGetter = () => bag.databox(...(inject as any));
            }
            else if((firstInject as any).prototype instanceof ChannelCore) {
                valueGetter = () => bag.channel(...(inject as any));
            }
            else {
                if(inject.length > 1){
                    valueGetter = async () => {
                        const res: any[] = [];
                        const promises: Promise<void>[] = [];
                        for(let i = 0; i < inject.length; i++){
                            promises.push(new Promise<void>(async r => {
                                res.push(await (inject[i] as InjectableClass).prototype.getInstance());
                                r();
                            }));
                        }
                        await Promise.all(promises);
                        return res;
                    }
                }
                else {
                    valueGetter = () => (firstInject as InjectableClass).prototype.getInstance();
                }
            }
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