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
     * Returns if the server runs in development mode.
     */
    static inDevelopmentMode(): boolean {
        return global[startModeSymbol] === StartMode.Development;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns if the server runs in production mode.
     */
    static inProductionMode(): boolean {
        return global[startModeSymbol] === StartMode.Development;
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