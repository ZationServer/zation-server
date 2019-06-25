/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../configDefinitions/controllerConfig";
import BaseSHBridge       from "../bridges/baseSHBridge";
import SHBridge           from "../bridges/shBridge";

export default class ProtocolAccessChecker
{
    static hasProtocolAccess(shBridge : BaseSHBridge,controller : ControllerConfig) : boolean
    {
        let hasAccess = true;
        if(shBridge.isWebSocket()) {
            if(typeof controller.wsAccess === 'boolean') {
                hasAccess = controller.wsAccess;
            }
        }
        else {
            if(typeof controller.httpAccess === 'boolean'){
                hasAccess = controller.httpAccess;
            }
        }
        return hasAccess;
    }

    static hasHttpMethodAccess(shBridge : SHBridge,controller : ControllerConfig) : boolean
    {
        let hasAccess = true;
        const method = shBridge.getRequest().method;
        if(method === 'GET' && typeof controller.httpGetAllowed === 'boolean') {
            hasAccess = controller.httpGetAllowed;
        }
        else if(method === 'POST' && typeof controller.httpPostAllowed === 'boolean') {
            hasAccess = controller.httpPostAllowed;
        }
        return hasAccess;
    }

    static getProtocol(shBridge : BaseSHBridge) : string {
        return shBridge.isWebSocket() ? 'ws' : 'http';
    }
}

