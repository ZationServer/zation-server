/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Bag                                from "../../api/Bag";
import {getGlobalRegisteredBagExtensions} from 'zation-bag-extension';
import {BagExtension}                     from 'zation-bag-extension';
import ErrorBag                           from '../error/errorBag';

export default class BagExtensionConflictChecker
{
    private readonly bagExtensions: BagExtension[];
    private errorBag: ErrorBag;
    private bagExtensionsInfo: {name: string,properties: Set<string>}[];

    constructor() {
        this.bagExtensions = getGlobalRegisteredBagExtensions();
    }

    checkBagExtensionsConflicts(): ErrorBag {
        this.errorBag = new ErrorBag();
        this.bagExtensionsInfo = [];

        for(let i = 0; i < this.bagExtensions.length; i++){
            this.checkBagExtensionConflicts(this.bagExtensions[i]);
        }

        return this.errorBag;
    }

    private checkBagExtensionConflicts(extension: BagExtension) {
        if(typeof extension === 'object'){
            const extensionProps: Set<string> = new Set<string>();

            const props = extension.properties;
            if(typeof props === 'object') {
                for(const k in props){
                    if(props.hasOwnProperty(k) && props[k] != undefined){
                        if(Bag.prototype.hasOwnProperty(k)){
                            this.errorBag.addError(new Error(`BagExtension: '${extension.name}' conflicts with Bag property: ${k}.`));
                        }
                        extensionProps.add(k);
                    }
                }
            }

            let info: {name: string,properties: Set<string>};
            for(let i = 0; i < this.bagExtensionsInfo.length; i++){
                info = this.bagExtensionsInfo[i];
                for(let prop of extensionProps) {
                    if(info.properties.has(prop)){
                        this.errorBag.addError(new Error
                        (`BagExtension: '${extension.name}' conflicts with other BagExtension: '${info.name}', property: ${prop}.`));
                    }
                }
            }

            this.bagExtensionsInfo.push({
                name: extension.name,
                properties: extensionProps,
            });
        }
    }

}


