/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationSPC_Auth = require("./controller/zationSPC_Auth");
import ZationSC_Ping  = require("./controller/zationSC_Ping");

export = {
        'zation/system/ping' : ZationSC_Ping,
        'zation/panel/auth' : ZationSPC_Auth
    };