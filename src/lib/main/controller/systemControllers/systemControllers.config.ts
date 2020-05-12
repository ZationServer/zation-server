/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import PingController      from "./controllers/PingController";
import PanelAuthController from "./controllers/PanelAuthController";

export const systemControllers = {
    '#ping': PingController,
    '#panel/auth' : PanelAuthController
};