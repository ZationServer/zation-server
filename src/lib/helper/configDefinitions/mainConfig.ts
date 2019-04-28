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
    /**
     * Indicates if the server should use the protocol check.
     * @default is true.
     */
    useProtocolCheck  ?: boolean;
    /**
     * Indicates if the server should use the HTTP method check.
     * @default is true.
     */
    useHttpMethodCheck  ?: boolean;
    /**
     * Indicates if the server should send error descriptions back to the client.
     * @default is false.
     */
    sendErrorDescription  ?: boolean;
    /**
     * This property activates or deactivates the zation log to the console.
     * It will also affect the logging with the small bag.
     * @default is true.
     */
    zationConsoleLog  ?: boolean;
    /**
     * This property indicates if socketCluster should console log information.
     * @default is false.
     */
    scConsoleLog  ?: boolean;
    /**
     * Specifies if the server should use sc-uws (which is programmed in C++ and incredibly fast) as a core engine.
     * Otherwise, it will use the ws engine (which is a Node.Js implementation).
     * @default is true.
     */
    useScUws  ?: boolean;
    /**
     * Specifies if the zation panel is activated.
     * @default is false.
     */
    usePanel  ?: boolean;
    /**
     * Specifies the panel user, you can define one or more users.
     * @example
     * panelUser : {username: 'admin', password: 'admin'}
     * panelUser : [{username: 'admin', password: 'admin'},{username : 'user',password : '12345'}]
     */
    panelUser  ?: PanelUserConfig | PanelUserConfig[];
    /**
     * Defines if the server should provide a full minified javascript client driver file via HTTP.
     * @default is true.
     */
    provideClientJs  ?: boolean;
    /**
     * Defines if the server should start in auth start mode.
     * The auth start mode will allow clients only to send an authentication request.
     * All other requests will be denied.
     * In the property authStartDuration, you can define how long the authStart should be active,
     * before the server changes to the normal mode.
     * @default is false.
     */
    authStart  ?: boolean;
    /**
     * Defines how long the authStart should be active (in milliseconds)
     * before the server changes in the normal mode.
     * @default is 20000.
     */
    authStartDuration  ?: number;
    /**
     * Specifies in what key the zation data is located in an HTTP post request.
     * @default is 'zation'.
     */
    postKey  ?: string;
    /**
     * The key which zation will use to encrypt/decrypt authTokens.
     * The key can be automatically shared between more server instances.
     * If you want to use RSA or ECDSA, you should provide a authPrivateKey and authPublicKey instead of authKey.
     * @default is a 256 bits cryptographically random hex string.
     */
    authKey  ?: string;
    /**
     * The default expiry of tokens in seconds.
     * @default is 86400.
     */
    authDefaultExpiry  ?: number;
    /**
     * The algorithm that will be used to sign and verify jwt tokens.
     * @default is HS256.
     */
    authAlgorithm  ?: string;
    /**
     * The private secret key for sign the jwt tokens.
     * For using a key pair, you also need to define the public key
     * and change the algorithm to RSA or ECDSA.
     * @default is null.
     */
    authPrivateKey  ?: string | null;
    /**
     * The public secret key for verify the jwt tokens.
     * For using a key pair, you also need to define the private key
     * and change the algorithm to RSA or ECDSA.
     * @default is null.
     */
    authPublicKey  ?: string | null;
    /**
     * The limit of how many checks can be made in one validation request.
     * @default is 50.
     */
    validationCheckLimit ?: number;
    /**
     * This property gives you the possibility to pass extra variables in the main config.
     * You can access them with the small bag.
     * @example
     * //define
     * variables : {
     *    myVar : 'someValue'
     * }
     * //access
     * bag.getMainConfigVariable('myVar');
     */
    variables ?: object,

    //service
    /**
     * Specifies if the server should be killed by a service create error,
     * e.g. the MySQL connection could not be established.
     * @default is false.
     */
    killServerOnServicesCreateError ?: boolean;

    //log
    /**
     * Defines if the server should log to a log file.
     * With the properties: logRequests, logServerErrors, logCodeErrors, logStarted
     * you can define what the server should be logging.
     * You also can use the small bag to log own information in the file.
     * @default is false.
     */
    logToFile ?: boolean;
    /**
     * Specifies the log file path but notice that the path is relative to the running directory.
     * @default is ''.
     */
    logPath ?: string;
    /**
     * Defines if the log file should be downloadable via Http.
     * You can use the property logAccessKey to set a secret password for access the download.
     * @default is true.
     */
    logDownloadable ?: boolean;
    /**
     * Defines if a key to access the log file download.
     * The secret key will appear in the URL for access the log file via HTTP.
     * @default is ''.
     * @example
     * Log: http://localhost:3001/zation/log/theKey
     */
    logAccessKey ?: string;
    /**
     * Specifies if the server should log every request to a file.
     * @default is false.
     */
    logRequests ?: boolean;
    /**
     * Specifies if the server should log every unknown error that was thrown on the server.
     * @default is true.
     */
    logServerErrors ?: boolean;
    /**
     * Specifies if the server should log code errors.
     * Code errors can happen for example when you try to
     * access the HTTP request object with the bag by a web socket request.
     * @default is true.
     */
    logCodeErrors ?: boolean;
    /**
     * Specifies if the server should log when the server is started.
     * @default is true.
     */
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
    provideClientJs  : boolean;
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


