/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag        from "../../api/SmallBag";
import ZationTokenInfo from "../infoObjects/zationTokenInfo";
import FuncUtils       from "./funcUtils";

export default class MiddlewareUtils
{
    static async checkScMiddlewareEvent(event : Function | undefined,next : Function,smallBag : SmallBag,req : object) : Promise<boolean> {
        return await FuncUtils.checkMiddlewareFunc(event,next,smallBag,req);
    }

    static async checkAuthenticationMiddlewareEvent(event : Function | undefined,next : Function,smallBag : SmallBag,zationTokenInfo : ZationTokenInfo) : Promise<boolean> {
        return await FuncUtils.checkMiddlewareFunc(event,next,smallBag,zationTokenInfo);
    }
}

