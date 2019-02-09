/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig = require("../../main/zationConfig");
import SmallBag     = require("../../api/SmallBag");
import Bag          = require("../../api/Bag");

export default class BagExtensionEngine
{
    private zc : ZationConfig;

    constructor(zc : ZationConfig) {
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


