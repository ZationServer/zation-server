/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {StartMode, startModeSymbol} from '../core/startMode';

/**
 * A simple class for getting the state of the server.
 */
export class Server {

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns if the server runs in test mode.
     */
    static inTestMode(): boolean {
        return global[startModeSymbol] === StartMode.Test;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns if the server runs in normal mode.
     */
    static inNormalMode(): boolean {
        return global[startModeSymbol] === StartMode.Normal;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the start mode of the server.
     */
    static getStartMode(): StartMode {
        return global[startModeSymbol];
    }

}