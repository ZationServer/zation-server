/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {getGlobalRegisteredBagExtensions,BagExtension} from 'zation-bag-extension';
import Bag from '../../api/Bag';
import ObjectUtils from '../utils/objectUtils';
import RequestBag from '../../api/RequestBag';

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
                if(typeof extension.bag === 'object') {
                    ObjectUtils.addPropsToClass(Bag,extension.bag,true);
                }
                if(typeof extension.requestBag === 'object') {
                    ObjectUtils.addPropsToClass(RequestBag,extension.requestBag,true);
                }
                resolve();
            }));
        }
        await Promise.all(promises);
    }
}


