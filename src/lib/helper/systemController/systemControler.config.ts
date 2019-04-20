/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationSC_Ping  from "./controller/zationSC_Ping";
import ZationSPC_Auth from "./controller/zationSPC_Auth";

export const SystemController = {
        'zation/system/ping' : ZationSC_Ping,
        'zation/panel/auth'  : ZationSPC_Auth
    };