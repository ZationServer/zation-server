/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ServerOptions}                 from "https";
import {DeepRequired}                  from 'ts-essentials';

export const OPTION_AUTO = 'auto';
export const OPTION_HALF_AUTO = 'half-auto';

export interface MainConfig
{
    /**
     * An ID that is associated with this specific instance of a zation server,
     * the id should be unique for every instance in a cluster.
     * You can access the instanceId with the Bag.
     * If you don't provide an instanceId,zation will generate a random one (UUID v4).
     * @default random UUID v4
     */
    instanceId?: string;
    /**
     * The port of the server.
     * @default 3000
     */
    port?: number;
    /**
     * The hostname of the server.
     * @default 'localhost'
     */
    hostname?: string;
    /**
     * The url path to the server.
     * @default '/zation'
     */
    path?: string;
    /**
     * In this property, you can set your license
     * (Notice that you only can use one unique license for a single running server instance).
     * If your provided license is valid, you able to use this instance on a
     * public server and to use more than ten components.
     * For more information, look here:
     * https://github.com/ZationServer/zation/wiki/Zation-End-User-License-Agreement
     * @default Free Trial
     */
    license?: string;
    /**
     * With this property, you can specify what origins are allowed to communicate to the server.
     * You can specify the port and hostname.
     * Also, a star can be used as a wild card for any port or any hostname.
     * @example
     * //allow all origins
     * origins: null, or
     * origins: '*:*',
     *
     * //allow all with hostname example.de
     * origins: 'example.de:*', or
     * origins: 'example.de'
     *
     * //allow all with port 80
     * origins: '*:80'
     *
     * //allow only hostname example.de on port 80
     * origins: 'example.de:80'
     *
     * //allow all with hostname example.de or example2.de
     * origins: ['example.de:*','example2.de']
     *
     * @default null (all allowed)
     */
    origins?: string | null | string[];
    /**
     * Boolean that indicates if the debug mode is active.
     * In debug mode the server will console log information about the current status and actions of connected clients.
     * @default false
     */
    debug?: boolean;
    /**
     * Boolean that indicates if the start debug mode is active.
     * In start debug mode the server will console log all steps
     * for starting the server and how much time each step takes to process.
     * @default false
     */
    startDebug?: boolean;
    /**
     * Indicates if the server should be killed in case
     * of start failure instead of throwing an error.
     * @default true
     */
    killOnStartFailure?: boolean;
    /**
     * Boolean that indicates if the server should console log
     * config warnings after checking the configurations.
     * @default true
     */
    showConfigWarnings?: boolean;
    /**
     * Should be either 'dev' or 'prod' -
     * This affects the shutdown procedure
     * when the master receives a 'SIGUSR2' signal. In 'dev' a SIGUSR2 will trigger an immediate shutdown of workers.
     * In 'prod' workers will be terminated progressively in accordance with processTermTimeout.
     * @default 'prod'
     */
    environment?: 'dev' | 'prod';
    /**
     * The timezone of the server,
     * it affects the calculation of the background task time.
     * @default Zation will guess the timezone if it fails the default is 'Europe/Berlin'.
     */
    timeZone?: string;
    /**
     * This property indicates how many workers should be run.
     * It can be a number, the options 'auto' or 'half-auto'.
     * Auto means the count of CPU cores the system offers.
     * Half auto is the count of CPU cores divided by two.
     * @default 'auto'
     */
    workers?: 'auto' | 'half-auto' | number;
    /**
     * This property indicates how many brokers should be run.
     * It can be a number, the options 'auto' or 'half-auto'.
     * Auto means the count of CPU cores the system offers.
     * Half auto is the count of CPU cores divided by two.
     * @default 'half-auto'
     */
    brokers?: 'auto' | 'half-auto' | number;
    /**
     * The name of the app.
     * @default 'AppWithoutName'
     */
    appName?: string;
    /**
     * Indicates if the server should run with SSL if you activated
     * this property don't forget to provide a httpsConfig.
     * @default false
     */
    secure?: boolean;
    /**
     * The https config, this configuration is used when the secure option is activated.
     * Its the same as the object provided to Node.js's https server.
     */
    httpsConfig?: ServerOptions;
    /**
     * Indicates if the server should send error descriptions back to the client.
     * @default false
     */
    sendErrorDescription?: boolean;
    /**
     * Specifies the wsEngine that the server should use.
     * You can use 'z-uws' it is a modified version of uWebsockets v0.14
     * that is programmed in C++ and is incredibly fast.
     * Or you can use 'ws', which is a pure javascript solution and slower.
     * @default 'z-uws'
     */
    wsEngine?: string;
    /**
     * The default API level a client will get when there is no API level provided in the request or connection.
     * Notice that the value cant be lesser than 1 and needs to be an integer.
     * @default 1
     */
    defaultClientApiLevel?: number;
    /**
     * Specifies if the zation panel is activated.
     * @default false
     */
    usePanel?: boolean;
    /**
     * Specifies the panel user, you can define one or more users.
     * @example
     * panelUser: {username: 'admin', password: 'admin'}
     * panelUser: [{username: 'admin', password: 'admin'},{username: 'user',password: '12345'}]
     */
    panelUser?: PanelUserConfig | PanelUserConfig[];
    /**
     * Defines if the server should provide a full minified javascript client driver file via HTTP.
     * @default true
     */
    provideClientJs?: boolean;
    /**
     * The secret key which zation will use to encrypt/decrypt authTokens.
     * The key can be automatically shared between more server instances.
     * If you want to use RSA or ECDSA, you should provide a authPrivateKey and authPublicKey instead of authKey.
     * @default 256 bits cryptographically random hex string.
     */
    authSecretKey?: string;
    /**
     * The default expiry of tokens in seconds.
     * @default 86400
     */
    authDefaultExpiry?: number;
    /**
     * The algorithm that will be used to sign and verify jwt tokens.
     * @default 'HS256'
     */
    authAlgorithm?: string;
    /**
     * The private secret key to signing the jwt tokens.
     * For using asymmetric encryption, you also need to define the
     * public key and change the algorithm to a proper one, e.g. RSA or ECDSA.
     * @default null
     */
    authPrivateKey?: string | null;
    /**
     * The public secret key to verify the jwt tokens.
     * For using asymmetric encryption, you also need to define the
     * private key and change the algorithm to a proper one, e.g. RSA or ECDSA.
     * @default null
     */
    authPublicKey?: string | null;
    /**
     * The limit of how many checks can be made in one validation request.
     * @default 50
     */
    validationCheckLimit?: number;
    /**
     * The limit of how many data boxes a socket can have.
     * @default 30
     */
    socketDataboxLimit?: number;
    /**
     * This property gives you the possibility to set variables in the
     * main config which you can access with the Bag.
     * @example
     * //define
     * variables: {
     *    myVar: 'someValue'
     * }
     * //access
     * bag.getMainConfigVariables().myVar;
     */
    variables?: object,

    //service
    /**
     * Specifies if the server should be killed by a service create error,
     * e.g. the MySQL connection could not be established.
     * @default false
     */
    killServerOnServicesCreateError?: boolean;

    /**
     * Specifies the log options.
     */
    log?: LogOptions;

    /**
     * Specifies if the master should log the complete component API.
     * @default true
     */
    logComponentApi?: boolean;

    /**
     * Specifies if the worker leader should console log the precompiled configs.
     * @default false
     */
    showPrecompiledConfigs?: boolean;

    //Cluster
    /**
     * The cluster auth key defines a key that
     * will be used to connect to a cluster component.
     * If you provide a key, every cluster component needs
     * to have the same key to communicate with each other.
     * @default null
     * @notice Every server component in a cluster must have the same setting.
     */
    clusterAuthKey ?: string | null;
    /**
     * The cluster secret key is a key that will be used by all
     * zation server components. The primary usage is for symmetric encryption of
     * variables that will be transported from one master to another master.
     * Notice that every zation server needs to have the same key.
     * If you don't provide a key, the variables will be not encrypted and decrypted.
     * @default null
     * @notice Every server component in a cluster must have the same setting.
     */
    clusterSecretKey ?: string | null;
    /**
     * The state sever host, e.g. IP-address of the state server.
     * If you provide a state server host,
     * the server will automatically start in cluster mode (Machine scaling active).
     * @default null
     */
    stateServerHost ?: string | null;
    /**
     * The port of the state server.
     * @default null (means 80)
     */
    stateServerPort ?: number | null;
    /**
     * This property indicates if the server should check the token cluster key.
     * This key is stored in every token that will be created.
     * Every server in a cluster has the same key.
     * Whenever the client authentication process takes place the token cluster
     * key will be checked if it is equal with the server one.
     * If all servers are crashed and will restart the token cluster key will be newly generated.
     * That means that all previously made tokens are no longer valid.
     * Notice that a token is also not valid on another cluster or single started server even
     * if the auth public key and algorithm or auth secret key is the same.
     * @default true
     */
    useTokenClusterKeyCheck?: boolean;
    /**
     * This property indicates that the server should share the auth options
     * for verifying and sign tokens with all other zation servers in the cluster.
     * That is useful if you are using generated auth keys that will change on each server start.
     * Then the options of the first server that joins the cluster will be used for every server
     * that will join the cluster afterward. That means that the token will be valid on every server
     * in that cluster even if the other servers had a different key before joining the cluster.
     * @default true
     */
    clusterShareTokenAuth?: boolean;
    /**
     * The option for setting the cluster mapping engine.
     * Only for advanced use cases.
     * @default null
     */
    clusterMappingEngine?: string | null;
    /**
     * The option for setting the cluster client pool size.
     * Only for advanced use cases.
     * @default null
     */
    clusterClientPoolSize?: number | null;
    /**
     * The option for setting the cluster instance ip.
     * Only for advanced use cases.
     * @default null
     */
    clusterInstanceIp?: string | null;
    /**
     * The option for setting the cluster instance ip family.
     * Only for advanced use cases.
     * @default null
     */
    clusterInstanceIpFamily?: string | null;
    /**
     * The option for setting the cluster state server connect timeout.
     * Only for advanced use cases.
     * @default null
     */
    clusterStateServerConnectTimeout?: number | null;
    /**
     * The option for setting the cluster state server ack timeout.
     * Only for advanced use cases.
     * @default null
     */
    clusterStateServerAckTimeout?: number | null;
    /**
     * The option for setting the cluster state server reconnect randomness.
     * Only for advanced use cases.
     * @default null
     */
    clusterStateServerReconnectRandomness?: number | null;

    //Sc
    /**
     * Origins which are allowed to connect to the real-time scServer.
     * Notice that you also can use the origins option that is provided by the zation framework.
     * This option is more powerful and is used by HTTP and WebSocket.
     * @default null
     */
    scOrigins?: string | null;
    /**
     * The maximum number of individual channels which a single socket can subscribe to.
     * @default 1000
     */
    socketChannelLimit?: number;
    /**
     * Crash workers when an error happens.
     * This is the most sensible default.
     * @default true
     */
    crashWorkerOnError?: boolean;
    /**
     * Reboot workers when they crash.
     * That is a necessity in production but can be turned off for debugging.
     * @default true
     */
    rebootWorkerOnCrash?: boolean;
    /**
     * Setting this to true will cause the master process
     * to shut down when it receives a SIGUSR2 signal (instead of just the workers).
     * If you're using nodemon, set this to true.
     * @default false
     */
    killMasterOnSignal?: boolean;
    /**
     * Kill/respawn a worker process if its memory consumption exceeds this threshold (in bytes).
     * If this is null (default), this behavior will be switched off.
     * @default null
     */
    killWorkerMemoryThreshold?: number | null;
    /**
     * In milliseconds, how long a client has to connect to the server before timing out.
     * @default 10000
     */
    connectTimeout?: number;
    /**
     * In milliseconds.
     * If the socket handshake hasn't been completed before this timeout is reached,
     * the new connection attempt will be terminated.
     * @default 10000
     */
    handshakeTimeout?: number;
    /**
     * In milliseconds, the timeout for calling res(err, data) when your emit()
     * call expects an ACK response from the other side (when a callback is provided to emit).
     * @default 10000
     */
    ackTimeout?: number;
    /**
     * In milliseconds, the timeout for calling res(err, data) when your sendToWorker,
     * sendToBroker or sendToMaster (IPC) call expects an ACK response from the other process
     * (when a callback is provided).
     * @default 10000
     */
    ipcAckTimeout?: number;
    /**
     * In milliseconds. If a socket cannot upgrade transport within this period,
     * it will stop trying.
     * @default 1000
     */
    socketUpgradeTimeout?: number;
    /**
     * The interval in milliseconds on which to
     * send a ping to the client to check that it is still alive.
     * @default 8000
     */
    pingInterval?: number;
    /**
     * How many milliseconds to wait without receiving a ping before closing the socket.
     * @default 20000
     */
    pingTimeout?: number;
    /**
     * The maximum amount of milliseconds to wait before force-killing a
     * process after it was passed a 'SIGTERM' or 'SIGUSR2' signal.
     * @default 10000
     */
    processTermTimeout?: number;
    /**
     * Whether or not errors from child processes (workers and brokers)
     * should be passed to the current master process.
     * @default true
     */
    propagateErrors?: boolean;
    /**
     * Whether or not warnings from child processes (workers and brokers)
     * should be passed to the current master process.
     * @default true
     */
    propagateWarnings?: boolean;
    /**
     * Whether or not a 'warning' event should be emitted (and logged to console)
     * whenever a middleware function blocks an action.
     * @default false
     */
    middlewareEmitWarnings?: boolean;
    /**
     * By default, SC will reboot all workers when it receives a 'SIGUSR2' signal.
     * @default true
     */
    rebootOnSignal?: boolean;
    /**
     * If you run your master process as superuser,
     * this option lets you downgrade worker and broker processes to run under the specified user
     * (with fewer permissions than master). You can provide a Linux UID or username.
     * @default false
     */
    downgradeToUser?: boolean | string;
    /**
     * The root directory in which to store your socket files in Linux.
     * @default null
     */
    socketRoot?: string | null;
    /**
     * Defaults to "rr", but can be set to "none".
     * Read more: https://nodejs.org/dist/latest-v5.x/docs/api/cluster.html#cluster_cluster_schedulingpolicy.
     * @default "rr"
     */
    schedulingPolicy?: string | null;
    /**
     * Whether or not clients are allowed to publish messages to channels.
     * @default true
     */
    allowClientPublish?: boolean;
    /**
     * This option is passed to the Node.js HTTP server if it is provided.
     * @default null
     */
    tcpSynBacklog?: any | null;
    /**
     * Zation keeps track of request per minutes internally.
     * That allows you to change how often this gets updated.
     * @default 10000
     */
    workerStatusInterval?: number;
    /**
     * This option allows you to batch multiple messages together
     * when passing them across message brokers. That may improve the efficiency
     * of your pub/sub-operations.
     * The value unit is in milliseconds, 5 is generally a safe value to set this to.
     * @default null
     */
    pubSubBatchDuration?: number | null;
}

export interface LogOptions {
    /**
     * This property specifies options for
     * the logging from the zation server into the console.
     * @default Active with the highest log level.
     */
    console?: ConsoleLogOptions,
    /**
     * This property specifies options for
     * the logging from the zation server into the log file.
     * @default Deactivated
     */
    file?: FileLogOptions,
    /**
     * This property specifies options for
     * the logging from the server core into the console.
     * For advanced use cases.
     * @default Deactivated
     */
    core?: CoreLogOptions
}

export interface ConsoleLogOptions {
    /**
     * This property indicates if the zation server
     * should log information into the console.
     * @default true
     */
    active?: boolean;
    /**
     * Defines the log level for log information into the console.
     * 6: Log Category: DebugInfo (only in debug mode), StartDebugInfo (only in start debug mode)
     * 5: Log Category: Info, Busy
     * 4: Log Category: Warn
     * 3: Log Category: Errors
     * 2: Log Category: Failed, Fatal
     * 1: Log Category: Active
     * 0: Log: Nothing
     * @default 6
     */
    logLevel?: number;
}

export interface FileLogOptions {
    /**
     * Defines if the server should log information into a log file.
     * @default false
     */
    active?: boolean,
    /**
     * Defines the log level for log information into the log file.
     * 6: Log Category: DebugInfo (only in debug mode), StartDebugInfo (only in start debug mode)
     * 5: Log Category: Info, Busy
     * 4: Log Category: Warn
     * 3: Log Category: Errors
     * 2: Log Category: Failed, Fatal
     * 1: Log Category: Active
     * 0: Log: Nothing
     * @default 5
     */
    logLevel?: number;
    /**
     * Specifies the log file path but notice that the path is relative to the running directory.
     * @default ''
     */
    filePath?: string;
    /**
     * Defines options for download the log file via Http.
     * @default active with no access key
     */
    download?: {
        /**
         * Defines if the log file should be downloadable via Http.
         * You can use the property accessKey to set a secret password for access the download.
         * @default true
         */
        active?: boolean,
        /**
         * Defines a key to access the log file download.
         * The secret key will appear in the URL for access the log file via HTTP.
         * @default ''
         * @example
         * Log: http://localhost:3001/zation/log/theKey
         */
        accessKey?: string;
    };
}

export interface CoreLogOptions {
    /**
     * This property indicates if the server core should
     * log information into the console.
     * @default false
     */
    active?: boolean;
    /**
     * Defines the log level for the server core.
     * 3: Log Category: Everything
     * 2: Log Category: Notices
     * 1: Log Category: Errors
     * 0: Log: Nothing
     * @default 2
     */
    logLevel?: number;
}

export interface PanelUserConfig {
    username: string;
    password: string;
}

//These settings are always set
export interface InternalMainConfig extends MainConfig {
    instanceId: string;
    port: number;
    hostname: string;
    path: string;
    origins: string | null | string[];
    scOrigins?: string | null;
    debug: boolean;
    startDebug: boolean;
    killOnStartFailure: boolean;
    showConfigWarnings: boolean;
    environment: 'dev' | 'prod';
    timeZone: string;
    workers: 'auto' | number;
    appName: string;
    secure: boolean;
    sendErrorDescription: boolean;
    wsEngine: string;
    defaultClientApiLevel: number;
    usePanel: boolean;
    provideClientJs: boolean;
    authSecretKey: string;
    authDefaultExpiry: number;
    authPrivateKey: string | null;
    authPublicKey: string | null;
    validationCheckLimit: number;
    socketDataboxLimit: number;
    useTokenClusterKeyCheck: boolean;
    clusterShareTokenAuth: boolean;
    socketChannelLimit: number;
    crashWorkerOnError: boolean;
    rebootWorkerOnCrash: boolean;
    killMasterOnSignal: boolean;
    connectTimeout: number;
    handshakeTimeout: number;
    ackTimeout: number;
    ipcAckTimeout: number;
    socketUpgradeTimeout: number;
    pingInterval: number;
    pingTimeout: number;
    processTermTimeout: number;
    propagateErrors: boolean;
    propagateWarnings: boolean;
    middlewareEmitWarnings: boolean;
    rebootOnSignal: boolean;
    downgradeToUser: boolean;
    allowClientPublish: boolean;
    workerStatusInterval: number;
    killServerOnServicesCreateError: boolean;
    log: DeepRequired<LogOptions>;
    logComponentApi: boolean;
    showPrecompiledConfigs: boolean;
    variables: any;
}