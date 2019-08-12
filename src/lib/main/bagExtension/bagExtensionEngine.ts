/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Bag                from "../../api/Bag";
import RequestBag         from "../../api/RequestBag";
import ZationConfigFull   from "../config/manager/zationConfigFull";

export default class BagExtensionEngine
{
    private zc : ZationConfigFull;

    constructor(zc : ZationConfigFull) {
        this.zc = zc;
    }

    /**
     * Add bag extensions.
     */
    extendBag() {
        if(this.zc.appConfig.bagExtensions)
        {
            const extensions = this.zc.appConfig.bagExtensions;
            for(let i = 0; i < extensions.length; i++) {
                this.add(Bag,extensions[i].bag);
                this.add(RequestBag,extensions[i].requestBag);
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Add props to an bag.
     */
    private add(bag : any, props) {
        if(props){
            for(let k in props) {
                if(props.hasOwnProperty(k)) {
                    bag.prototype[k] = props[k];
                }
            }
        }
    }
}


