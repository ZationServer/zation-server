/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Bag from "../../api/Bag";
import RequestBag from "../../api/RequestBag";
import {getGlobalRegisteredBagExtensions} from 'zation-bag-extension';
import {BagExtension} from 'zation-bag-extension';
import ErrorBag from '../error/errorBag';

export default class BagExtensionConflictChecker
{
    private readonly bagExtensions: BagExtension[];
    private errorBag: ErrorBag;
    private bagExtensionPropsMap: {name: string,reqBagProps: Set<string>,bagProps: Set<string>}[];

    constructor() {
        this.bagExtensions = getGlobalRegisteredBagExtensions();
    }

    checkBagExtensionsConflicts(): ErrorBag {
        this.errorBag = new ErrorBag();
        this.bagExtensionPropsMap = [];

        for(let i = 0; i < this.bagExtensions.length; i++){
            this.checkBagExtensionConflicts(this.bagExtensions[i]);
        }

        return this.errorBag;
    }

    private checkBagExtensionConflicts(extension: BagExtension) {
        if(typeof extension === 'object'){
            const extensionReqBagProps: Set<string> = new Set<string>();
            const extensionBagProps: Set<string> = new Set<string>();

            const bagProps = extension.bag;
            if(typeof bagProps === 'object') {
                this.checkExtensionOptionsConflicts(extension.name,bagProps,true,extensionBagProps);
            }
            const reqBagProps = extension.requestBag;
            if(typeof reqBagProps === 'object') {
                this.checkExtensionOptionsConflicts(extension.name,reqBagProps,false,extensionReqBagProps);
            }

            let propMap: {name: string,reqBagProps: Set<string>,bagProps: Set<string>};
            for(let i = 0; i < this.bagExtensionPropsMap.length; i++){
                propMap = this.bagExtensionPropsMap[i];
                for(let prop of extensionBagProps) {
                    if(propMap.bagProps.has(prop)){
                        this.errorBag.addError(new Error
                        (`BagExtension: '${extension.name}' conflicts with other BagExtension: '${propMap.name}', Bag prop name: ${prop}.`));
                    }
                }
                for(let prop of extensionReqBagProps) {
                    if(propMap.reqBagProps.has(prop)){
                        this.errorBag.addError(new Error
                        (`BagExtension: '${extension.name}' conflicts with other BagExtension: '${propMap.name}', RequestBag prop name: ${prop}.`));
                    }
                    if(propMap.bagProps.has(prop)){
                        this.errorBag.addError(new Error
                        (`BagExtension: '${extension.name}' conflicts with other BagExtension: '${propMap.name}', RequestBag prop name: ${prop} overrides other extension Bag prop.`));
                    }
                }
            }

            this.bagExtensionPropsMap.push({
                name: extension.name,
                bagProps: extensionBagProps,
                reqBagProps: extensionReqBagProps
            });
        }
    }

    private checkExtensionOptionsConflicts(name: string = '',props: Record<string,any> | undefined,isBag: boolean,extensionProps: Set<string>) {
        if(!props) return;
        for(const k in props){
            if(props.hasOwnProperty(k) && props[k] !== undefined){
                if(isBag) {
                    if(Bag.prototype.hasOwnProperty(k)){
                        this.errorBag.addError(new Error(`BagExtension: ${name} conflicts with Bag prop name: ${k}.`));
                    }
                }
                else {
                    if(RequestBag.prototype.hasOwnProperty(k)){
                        this.errorBag.addError(new Error(`BagExtension: ${name} conflicts with RequestBag prop name: ${k}.`));
                    }
                }
                extensionProps.add(k);
            }
        }
    }
}


