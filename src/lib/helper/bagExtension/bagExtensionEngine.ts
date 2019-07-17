/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag           from "../../api/SmallBag";
import ReqBag             from "../../api/ReqBag";
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
                this.add(SmallBag,extensions[i].smallBag);
                this.add(ReqBag,extensions[i].reqBag);
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


