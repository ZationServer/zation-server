/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {StartMode} from "../main/constants/startMode";

/**
 * A simple class for getting the state of the server.
 */
export class Server {

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns if the server runs in test mode.
     */
    static inTestMode() : boolean {
        return global['_ZATION_START_MODE'] === StartMode.TEST;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns if the server runs in normal mode.
     */
    static inNormalMode(): boolean {
        return global['_ZATION_START_MODE'] === StartMode.NORMAL;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the start mode of the server.
     */
    static getStartMode(): StartMode {
        return global['_ZATION_START_MODE'];
    }

}