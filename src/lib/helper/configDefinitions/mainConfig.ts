/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ServerOptions}                 from "https";

export const OPTION_AUTO = 'auto';
export const OPTION_HALF_AUTO = 'half-auto';

export interface MainConfig
{
    /**
     * The port of the server.
     * @default is 3000
     */
    port  ?: number;
    /**
     * The hostname of the server.
     * @default is localhost
     */
    hostname  ?: string;
    /**
     * The url path to the server.
     * @default is /zation
     */
    path  ?: string;
    /**
     * With this property, you can specify what origins are allowed to communicate to the server.
     * You can specify the port and hostname.
     * Also, a star can be used as a wild card for any port or any hostname.
     * @example
     * //allow all origins
     * origins : null, or
     * origins : '*:*',
     *
     * //allow all with hostname example.de
     * origins : 'example.de:*', or
     * origins : 'example.de'
     *
     * //allow all with port 80
     * origins : '*:80'
     *
     * //allow only hostname example.de on port 80
     * origins : 'example.de:80'
     *
     * //allow all with hostname example.de or example2.de
     * origins : ['example.de:*','example2.de']
     *
     * @default is null. (all allowed)
     */
    origins  ?: string | null | string[];
    /**
     * Boolean that indicates if the debug mode is active.
     * In debug mode the server will console log information about the current status and actions of connected clients.
     * @default is false.
     */
    debug  ?: boolean;
    /**
     * Boolean that indicates if the start debug mode is active.
     * In start debug mode the server will console log all steps
     * for starting the server and how much time each step takes to process.
     * @default is false.
     */
    startDebug  ?: boolean;
    /**
     * Boolean that indicates if the server should console log
     * config warnings after checking the configurations.
     * @default is true.
     */
    showConfigWarnings  ?: boolean;
    /**
     * Should be either 'dev' or 'prod' -
     * This affects the shutdown procedure
     * when the master receives a 'SIGUSR2' signal. In 'dev' a SIGUSR2 will trigger an immediate shutdown of workers.
     * In 'prod' workers will be terminated progressively in accordance with processTermTimeout.
     * @default is 'prod'.
     */
    environment  ?: 'dev' | 'prod';
    /**
     * The timezone of the server,
     * it affects the calculation of the background task time.
     * @default Zation will guess the timezone if it fails the default is 'Europe/Berlin'.
     */
    timeZone  ?: string;
    /**
     * This property indicates how many workers should be run.
     * It can be a number, the options 'auto' or 'half-auto'.
     * Auto means the count of CPU cores the system offers.
     * Half auto is the count of CPU cores divided by two.
     * @default is 'auto'.
     */
    workers  ?: 'auto' | 'half-auto' | number;
    /**
     * This property indicates how many brokers should be run.
     * It can be a number, the options 'auto' or 'half-auto'.
     * Auto means the count of CPU cores the system offers.
     * Half auto is the count of CPU cores divided by two.
     * @default is 'half-auto'.
     */
    brokers  ?: 'auto' | 'half-auto' | number;
    /**
     * The name of the app.
     * @default is 'AppWithoutName'.
     */
    appName  ?: string;
    /**
     * Indicates if the server should run with SSL if you activated
     * this property don't forget to provide a httpsConfig.
     * @default is false.
     */
    secure  ?: boolean;
    /**
     * The https config, this configuration is used when the secure option is activated.
     * Its the same as the object provided to Node.js's https server.
     */
    httpsConfig  ?: ServerOptions;
    /**
     * Indicates if the server should use the token state check.
     * @default is true.
     */
    useTokenStateCheck  ?: boolean;
    useProtocolCheck  ?: boolean;
    useHttpMethodCheck  ?: boolean;
    sendErrorDescription  ?: boolean;
    /**
     * This property activates or deactivates the zation log to the console.
     * It will also affect the logging with the small bag.
     * @default is true
     */
    zationConsoleLog  ?: boolean;
    scConsoleLog  ?: boolean;
    useScUws  ?: boolean;

    usePanel  ?: boolean;
    panelUser  ?: PanelUserConfig | PanelUserConfig[];
    clientJsPrepare  ?: boolean;

    authStart  ?: boolean;
    authStartDuration  ?: number;

    postKey  ?: string;
    authKey  ?: string;
    authDefaultExpiry  ?: number;
    authAlgorithm  ?: string;
    authPrivateKey  ?: string | null;
    authPublicKey  ?: string | null;

    validationCheckLimit ?: number;

    variables ?: object,

    //service
    killServerOnServicesCreateError ?: boolean;

    //log
    logToFile ?: boolean;
    logPath ?: string;
    logDownloadable ?: boolean;
    logAccessKey ?: string;

    logRequests ?: boolean;
    logServerErrors ?: boolean;
    logCodeErrors ?: boolean;
    logStarted ?: boolean;

    //Cluster
    clusterAuthKey  ?: string | null;
    clusterSecretKey  ?: string | null;
    stateServerHost  ?: string | null;
    stateServerPort  ?: number | null;
    useTokenCheckKey ?: boolean;

    clusterShareTokenAuth  ?: boolean;
    clusterMappingEngine  ?: string | null;
    clusterClientPoolSize  ?: number | null;
    clusterInstanceIp  ?: string | null;
    clusterInstanceIpFamily  ?: string | null;
    clusterStateServerConnectTimeout  ?: number | null;
    clusterStateServerAckTimeout  ?: number | null;
    clusterStateServerReconnectRandomness  ?: number | null;

    //Sc
    scLogLevel  ?: number;
    scOrigins ?: string | null;
    socketChannelLimit  ?: number;
    crashWorkerOnError  ?: boolean;
    rebootWorkerOnCrash  ?: boolean;
    killMasterOnSignal  ?: boolean;
    instanceId  ?: string | null;
    killWorkerMemoryThreshold  ?: number | null;
    connectTimeout  ?: number;
    handshakeTimeout  ?: number;
    ackTimeout  ?: number;
    ipcAckTimeout  ?: number;
    socketUpgradeTimeout  ?: number;
    pingInterval  ?: number;
    pingTimeout  ?: number;
    processTermTimeout  ?: number;
    propagateErrors  ?: boolean;
    propagateWarnings  ?: boolean;
    middlewareEmitWarnings  ?: boolean;
    rebootOnSignal  ?: boolean;
    downgradeToUser  ?: boolean;
    socketRoot  ?: string | null;
    schedulingPolicy  ?: string | null;
    allowClientPublish  ?: boolean;
    tcpSynBacklog  ?: any | null;
    workerStatusInterval  ?: number;
    pubSubBatchDuration  ?: number | null;
}

//These settings are always set
export interface InternalMainConfig extends MainConfig {
    port  : number;
    hostname  : string;
    path  : string;
    origins  : string | null | string[];
    scOrigins ?: string | null;
    debug  : boolean;
    startDebug  : boolean;
    showConfigWarnings : boolean;
    environment  : 'dev' | 'prod';
    timeZone  : string;
    workers  : 'auto' | number;
    appName  : string;
    secure  : boolean;
    useTokenStateCheck  : boolean;
    useProtocolCheck  : boolean;
    useHttpMethodCheck  : boolean;
    sendErrorDescription  : boolean;
    zationConsoleLog  : boolean;
    scConsoleLog  : boolean;
    useScUws  : boolean;
    usePanel  : boolean;
    clientJsPrepare  : boolean;
    authStart  : boolean;
    authStartDuration  : number;
    postKey  : string;
    authKey  : string;
    authDefaultExpiry  : number;
    authPrivateKey  : string | null;
    authPublicKey  : string | null;
    validationCheckLimit : number;
    useTokenCheckKey : boolean;
    clusterShareTokenAuth  : boolean;
    scLogLevel  : number;
    socketChannelLimit  : number;
    crashWorkerOnError  : boolean;
    rebootWorkerOnCrash  : boolean;
    killMasterOnSignal  : boolean;
    instanceId  : string | null;
    connectTimeout  : number;
    handshakeTimeout : number;
    ackTimeout  : number;
    ipcAckTimeout  : number;
    socketUpgradeTimeout  : number;
    pingInterval  : number;
    pingTimeout  : number;
    processTermTimeout  : number;
    propagateErrors  : boolean;
    propagateWarnings  : boolean;
    middlewareEmitWarnings  : boolean;
    rebootOnSignal  : boolean;
    downgradeToUser  : boolean;
    allowClientPublish  : boolean;
    workerStatusInterval  : number;
    killServerOnServicesCreateError : boolean;
    logToFile : boolean;
    logPath : string;
    logDownloadable : boolean;
    logAccessKey : string;
    logRequests : boolean;
    logServerErrors : boolean;
    logCodeErrors : boolean;
    logStarted : boolean;
    variables : any;
}

export interface PanelUserConfig {
    username  : string;
    password  : string;
}


