/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ServerOptions}                 from "https";

export const OptionAuto = 'auto';

export interface MainConfig
{
    port  ?: number;
    hostname  ?: string;
    path  ?: string;
    origins  ?: string | null | string[];
    debug  ?: boolean;
    startDebug  ?: boolean;
    showConfigWarnings  ?: boolean;
    environment  ?: 'dev' | 'prod';
    timeZone  ?: string;
    workers  ?: 'auto' | number;
    brokers  ?: 'auto' | number;
    appName  ?: string;
    secure  ?: boolean;
    httpsConfig  ?: ServerOptions;
    useAuth  ?: boolean;
    useProtocolCheck  ?: boolean;
    useHttpMethodCheck  ?: boolean;
    sendErrorDescription  ?: boolean;
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
export interface InternMainConfig extends MainConfig {
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
    useAuth  : boolean;
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


