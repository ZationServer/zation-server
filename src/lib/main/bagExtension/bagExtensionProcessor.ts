/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {getGlobalRegisteredBagExtensions,BagExtension} from 'zation-bag-extension';
import Bag                                             from '../../api/Bag';
import ObjectUtils                                     from '../utils/objectUtils';

export default class BagExtensionProcessor
{
    private readonly bagExtensions: BagExtension[];

    constructor() {
        this.bagExtensions = getGlobalRegisteredBagExtensions();
    }

    /**
     * Processes the bag extensions.
     */
    async process() {
        const promises: Promise<void>[] = [];
        for(let i = 0; i < this.bagExtensions.length; i++){
            promises.push(new Promise<void>(async resolve =>  {
                const extension = this.bagExtensions[i];
                if(typeof extension !== 'object') {
                    resolve();
                }
                if(typeof extension.init === 'function'){
                    try {
                        await extension.init();
                    }
                    catch (e) {}
                }
                if(typeof extension.properties === 'object') {
                    ObjectUtils.addPropsToClass(Bag,extension.properties,true);
                }
                resolve();
            }));
        }
        await Promise.all(promises);
    }
}


