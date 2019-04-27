/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag           from "../../api/SmallBag";
import Bag                from "../../api/Bag";
import ZationConfigFull from "../configManager/zationConfigFull";

export default class BagExtensionEngine
{
    private zc : ZationConfigFull;

    constructor(zc : ZationConfigFull) {
        this.zc = zc;
    }

    extendBag()
    {
        if(this.zc.appConfig.bagExtensions)
        {
            const extensions = this.zc.appConfig.bagExtensions;
            for(let i = 0; i < extensions.length; i++) {
                this.add(SmallBag,extensions[i].smallBag);
                this.add(Bag,extensions[i].bag);
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    private add(bag : any, methods)
    {
        for(let k in methods) {
            if(methods.hasOwnProperty(k)) {
                bag.prototype[k] = methods[k];
            }
        }
    }
}


