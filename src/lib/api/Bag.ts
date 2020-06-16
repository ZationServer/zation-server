/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import fetch, {Request, RequestInit, Response}              from 'node-fetch';
import base64url                                            from "base64url"
import PortChecker                                          from "../main/utils/portChecker";
import AsymmetricKeyPairs                                   from "../main/internalApi/asymmetricKeyPairs";
import {WorkerMessageAction}                                from "../main/constants/workerMessageAction";
import {ZATION_CUSTOM_EVENT_NAMESPACE}                      from "../main/constants/internal";
import {InternalMainConfig}                                 from "../main/config/definitions/main/mainConfig";
import {PrecompiledAppConfig}                               from "../main/config/definitions/main/appConfig";
import {PrecompiledServiceConfig}                           from "../main/config/definitions/main/serviceConfig";
import {byteLength}                                         from "byte-length";
import * as ecc                                             from 'eosjs-ecc';
import SimpleLogger                                         from '../main/log/simpleLogger';
import {
    WorkerChMapTaskAction,
    WorkerChSpecialTaskAction,
    WorkerChMapTarget
} from "../main/constants/workerChTaskDefinitions";

const crypto: any                                          = require('crypto');
const IP: any                                              = require('ip');
const crypto2: any                                         = require("crypto2");
const uuidV4                                               = require('uuid/v4');
const uniqid                                               = require('uniqid');
import ZationWorker                                         = require("../core/zationWorker");
import {SyncTokenOperationType}                             from "../main/constants/syncTokenDefinitions";
import OsUtils                                              from "../main/utils/osUtils";
import SystemInfo                                           from "../main/utils/systemInfo";
import ChannelPublisher                                     from "../main/internalChannels/internalChannelEngine";
import ServiceEngine                                        from "../main/services/serviceEngine";
import ZationConfig                                         from "../main/config/manager/zationConfig";
import Logger                                               from "../main/log/logger";
import SidBuilder                                           from "../main/utils/sidBuilder";
import TokenUtils                                           from "../main/token/tokenUtils";
import ObjectPathTokenRemoteSequenceImp                     from "../main/internalApi/objectPathSequence/objectPathTokenRemoteSequenceImp";
import Base64Utils                                          from "../main/utils/base64Utils";
import ZationConfigFull                                     from "../main/config/manager/zationConfigFull";
import CloneUtils                                           from "../main/utils/cloneUtils";
import {JwtSignOptions,JwtVerifyOptions}                    from "../main/constants/jwt";
import ApiLevelUtils, {ApiLevelSwitch, ApiLevelSwitchFunction} from "../main/apiLevel/apiLevelUtils";
import {DataboxFamilyClass}                                    from "./databox/DataboxFamily";
import DataboxFamilyContainer                                  from "./databox/container/databoxFamilyContainer";
import DataboxContainer                                        from "./databox/container/databoxContainer";
import {DataboxClass}                                          from "./databox/Databox";
import DataboxUtils                                            from "../main/databox/databoxUtils";
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ObjectPathSequence}                                    from "../main/internalApi/objectPathSequence/objectPathSequence";
import {createAsyncTimeout, createIntervalAsyncIterator}       from '../main/utils/timeUtils';
import ComponentUtils                                          from '../main/component/componentUtils';
import {AnyChannelClass}                                       from './channel/AnyChannelClass';
import {AnyDataboxClass}                                       from './databox/AnyDataboxClass';
import {ChannelFamilyClass}                                    from './channel/ChannelFamily';
import ChannelFamilyContainer                                  from './channel/container/channelFamilyContainer';
import {ChannelClass}                                          from './channel/Channel';
import ChannelContainer                                        from './channel/container/channelContainer';
import ChannelUtils                                            from '../main/channel/channelUtils';
import Socket                                                  from './Socket';

/**
 * The bag instance of this process.
 * It only works if the process is a worker process,
 * and the bag instance is ready for use.
 * Otherwise, it will throw an error when using this
 * instance in an unready state or in a wrong context.
 * You can use this variable in some zation events to access the bag.
 * But be careful not every event runs on a worker process.
 * But you can find information in the documentation of an event.
 * You can be sure that the bag is already ready for use when
 * using this variable in a zation event that runs on a worker.
 * But if you need to wait until the bag instance is ready for use,
 * you should look at the static method Bag.ready, that returns a promise.
 * @readonly
 */
export let bag: Bag = new Proxy({},{
    get: () => {
        throw new Error('The instance of the bag is not accessible in this context or not ready for use.');
    },
    set: () => {
        throw new Error('The instance of the bag is not accessible in this context or not ready for use.');
    }
}) as Bag;

export default class Bag<WA extends object = any> {
    protected readonly exchangeEngine: ChannelPublisher;
    protected readonly serviceEngine: ServiceEngine;
    protected readonly zc: ZationConfigFull;
    protected readonly worker: ZationWorker;

    private static _instance: Bag;
    private static readyPromise: Promise<void> = new Promise<void>(resolve => {Bag.readyResolve = resolve});
    private static readyResolve: () => void;
    private static readyRefresher: ((bag: Bag) => void)[] = [];

    protected constructor(worker: ZationWorker, exchangeEngine: ChannelPublisher) {
        this.exchangeEngine = exchangeEngine;
        this.serviceEngine = worker.getServiceEngine();
        this.zc = worker.getZationConfig();
        this.worker = worker;
    }

    //PART singleton access

    // noinspection JSUnusedGlobalSymbols
    /**
     * With this method, you can wait with the returned promise
     * until the instance of the bag is ready for use.
     * Notice that the promise will only be resolved on a worker process.
     * If the promise is resolved or you be sure that the bag is already
     * ready for use, you can use the variable 'bag' to access the instance of the bag.
     */
    static ready(): Promise<void> {
        return Bag.readyPromise;
    }

    /**
     * This method is used internally.
     * It creates the bag instance when it is not already created.
     * @internal
     * @param worker
     * @param exchangeEngine
     */
    static _create(worker: ZationWorker, exchangeEngine: ChannelPublisher): Bag {
        if(Bag._instance !== undefined) return Bag._instance;

        const instance = new Bag(worker,exchangeEngine);
        Bag._instance = instance;
        return instance;
    }

    /**
     * This method is used internally.
     * Tells the Bag class that the Bag instance is ready to use.
     * @internal
     * @private
     */
    static _isReady() {
        bag = Bag._instance;
        for(let i = 0; i < Bag.readyRefresher.length; i++){
            Bag.readyRefresher[i](bag);
        }
        Bag.readyResolve();
    }

    /**
     * This method is used internally.
     * Adds a refresher for the variable 'bag' when the bag is ready for use.
     * @internal
     * @private
     */
    static _addReadyRefresher(refresher: (bag: Bag) => void) {
       Bag.readyRefresher.push(refresher);
    }

    //PART CONFIG ACCESS

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the zation config.
     */
    getZationConfig(): ZationConfig {
        return this.zc;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the root path of the project.
     * In a typescript project, it will return the path to the dist folder.
     */
    getRootPath(): string {
        return this.zc.rootPath;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the main config.
     */
    getMainConfig(): InternalMainConfig {
        return this.zc.mainConfig;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the precompiled app config.
     */
    getAppConfig(): PrecompiledAppConfig {
        return this.zc.appConfig;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the precompiled service config.
     */
    getServiceConfig(): PrecompiledServiceConfig {
        return this.zc.serviceConfig;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the main config variables.
     * You can define them in the variables property of the main config.
     */
    getMainConfigVariables<V = any>(): V {
        return this.zc.mainConfig.variables;
    }

    //Part Auth

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the name of the default user group.
     */
    getDefaultUserGroupName(): string {
        return this.worker.getAuthConfig().getDefaultUserGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Checks if it is a valid auth user group.
     */
    isValidAuthUserGroup(str: string): boolean {
        return this.worker.getAuthConfig().isValidAuthUserGroup(str);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns an array with all auth user group names.
     */
    getAuthUserGroupNames(): string[] {
        return Object.keys(this.worker.getAuthConfig().getAuthUserGroups());
    }

    //PART Server
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server ip address.
     */
    getServerIpAddress(): string {
        return IP.address();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server port.
     */
    getServerPort(): number {
        return this.zc.mainConfig.port;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server instance id.
     */
    getServerInstanceId(): string {
        return this.worker.options.instanceId;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the app name.
     */
    getAppName(): string {
        return this.zc.mainConfig.appName;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the server is running in debug mode.
     */
    isDebugMode(): boolean {
        return this.zc.isDebug();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the server is running in debug mode.
     */
    isDebug(): boolean {
        return this.zc.isDebug();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server hostname.
     */
    getServerHostname(): string {
        return this.zc.mainConfig.hostname;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the server is running in secure.
     */
    isSecureServer(): boolean {
        return this.zc.mainConfig.secure;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server path.
     */
    getServerPath(): string {
        return this.zc.mainConfig.path;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the server is running in start debug mode.
     */
    isStartDebugMode(): boolean {
        return this.zc.isStartDebug();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the zation server version.
     */
    getZationVersion(): string {
        return this.worker.getServerVersion();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the started timestamp of this server.
     */
    getServerStartedTimestamp(): number {
        return this.worker.getServerStartedTime();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the started timestamp of this worker.
     */
    getWorkerStartedTimestamp(): number {
        return this.worker.getWorkerStartedTime();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the worker id.
     */
    getWorkerId(): number {
        return this.worker.getWorkerId();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the full worker id. (includes the node process id)
     * Means that this id is unique for every worker process,
     * also for every worker restart.
     */
    getWorkerFullId(): string {
        return this.worker.getFullWorkerId();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the zation worker instance.
     * This function is only for advanced use cases.
     */
    getWorker(): ZationWorker {
        return this.worker;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if this worker is the leader.
     */
    isLeaderWorker(): boolean {
        return this.worker.isLeader;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if this worker process is a respawn process.
     */
    isRespawn(): boolean {
        return this.worker.isRespawn();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if this server instance is the leader of the cluster.
     * Notice that this server can lose his leader ship.
     * If cluster mode is not active (means only one server is running without state server)
     * it will return always true.
     */
    async isLeaderServer(): Promise<boolean> {
        return (await this.worker.sendToZationMaster({action: WorkerMessageAction.IsLeader})).isLeader;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kill all workers,brokers and the master.
     * @param error
     * Error or message for server crash information.
     */
    async killServer(error: Error | string): Promise<void> {
        await this.worker.killServer(error);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server url with protocol,hostname and port.
     * @example
     * https://myhost:3000
     */
    getServerUrl(): string {
        return `${this.zc.mainConfig.secure ? 'https': 'http'}://${this.zc.mainConfig.hostname}:${this.zc.mainConfig.port}`;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the zation server url with protocol,hostname,port and path.
     * @example
     * https://myhost:3000/path
     */
    getZationServerUrl(): string {
        return `${this.zc.mainConfig.secure ? 'https': 'http'}://${this.zc.mainConfig.hostname}:${this.zc.mainConfig.port}${this.zc.mainConfig.path}`;
    }

    //Part OS

    /**
     * @description
     * Returns the average Cpu usage in percentage of this server.
     * Notice that the measurement will take at least 1 second.
     */
    async getCpuUsage(): Promise<number> {
        return OsUtils.getAverageCpuUsage();
    }

    /**
     * @description
     * Returns the total and used memory in MB of this server.
     */
    async getMemoryUsage(): Promise<{totalMemMb: number,usedMemMb: number}> {
        return OsUtils.getMemoryUsage();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the CPU usage in percentage and
     * the memory usage in MB of this process.
     */
    async getPidUsage(): Promise<{cpu: number, memory: number}> {
        return SystemInfo.getPidInfo();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the name of the server os.
     * @example
     * 'Mac OS X 10.15', 'Microsoft Windows 7 Enterprise', 'Linux 4.4.0-112-generic'
     */
    async getOsName(): Promise<string> {
        return OsUtils.getOs();
    }

    //Part Crypto

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an random string.
     * @param length
     */
    generateRandomString(length: number = 16): string {
        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an random number with fixed digits count.
     * @param digits
     */
    generateFixedRandomNumber(digits: number = 8): number {
        return Math.floor(Math.pow(10, digits - 1) + Math.random() * 9 * Math.pow(10, digits - 1));
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an random number in a range.
     * @param min
     * @param max
     */
    generateRangeRandomNumber(min: number = 0, max: number = 10): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an random boolean.
     * @param chanceForTrue
     */
    generateRandomBoolean(chanceForTrue: number = 0.5): boolean {
        return Math.random() <= chanceForTrue;
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Hash a string with sha512.
     * @param string
     * @param salt
     */
    hashSha512(string: string, salt?: string): string {
        return this.hashIn('sha512', string, salt);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Hash a string.
     * @param hash
     * @param string
     * @param salt
     */
    hashIn(hash: string, string: string, salt?: string): string {
        if (salt !== undefined) {
            return crypto.createHmac(hash, salt).update(string).digest('hex');
        } else {
            return crypto.createHash(hash).update(string).digest('hex');
        }
    }

    //Asymmetric Encryption
    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an object with a private and public key for RSA Asymmetric Encryption.
     * @example
     * const { privateKey, publicKey } = await generateRsaAsymmetricKeyPair();
     */
    async generateRsaAsymmetricKeyPair(): Promise<AsymmetricKeyPairs> {
        return crypto2.createKeyPair();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns an object with a private and public key for ECC Asymmetric Sign/Verify.
     * @example
     * const { privateKey, publicKey } = await generateEccAsymmetricKeyPair();
     */
    async generateEccAsymmetricKeyPair(): Promise<AsymmetricKeyPairs> {
        await ecc.initialize();
        const wif = await ecc.randomKey();
        return {privateKey: wif,publicKey: ecc.privateToPublic(wif)};
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Creates a signature from data with a private key and returns the signature.
     * It will hash the data with SHA256 and encrypts it using RSA.
     * @example
     * const signature = await asymmetricRsaSign(data,privateKey);
     * @param data
     * @param privateKey
     */
    async asymmetricRsaSign(data: string, privateKey: string): Promise<string> {
        return crypto2.sign.sha256(data, privateKey);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Verify the signature with the publicKey and the data.
     * It returns if the signature is valid.
     * It uses the SHA256 and RSA algorithm.
     * @example
     * const signature = await asymmetricRsaVerify(data,publicKey,signature);
     * @param data
     * @param publicKey
     * @param signature
     */
    async asymmetricRsaVerify(data: string, publicKey: string, signature: string): Promise<boolean> {
        return crypto2.verify.sha256(data, publicKey, signature);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Creates a signature from data with a private key and returns the signature.
     * It will hash the data with SHA256 and encrypts it using ECC (Elliptic curve cryptography).
     * @example
     * const signature = await asymmetricEccSign(data,privateKey);
     * @param data
     * @param privateKey
     * @param encoding
     */
    async asymmetricEccSign(data: string | Buffer, privateKey: string, encoding: string = 'utf8'): Promise<string> {
        return ecc.sign(data,privateKey,encoding);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Verify the signature with the publicKey and the data.
     * It returns if the signature is valid.
     * It uses the SHA256 and ECC (Elliptic curve cryptography) algorithm.
     * @example
     * const signature = await asymmetricEccVerify(data,publicKey,signature);
     * @param data
     * @param publicKey
     * @param signature
     * @param encoding
     */
    async asymmetricEccVerify(data: string, publicKey: string, signature: string, encoding: string = 'utf8'): Promise<boolean> {
        return ecc.verify(signature,data,publicKey,encoding,true);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Encrypts data with the publicKey and returns the encrypted data.
     * It's using the asymmetric RSA encryption algorithm.
     * Due to technical limitations of the RSA algorithm,
     * the text to be encrypted can not be longer than 215 bytes when using keys with 2048 bits.
     * @example
     * const encryptedMessage = await asymmetricRsaEncrypt('MY-MESSAGE','PUBLIC-KEY');
     * @param data
     * @param publicKey
     */
    async asymmetricRsaEncrypt(data: string, publicKey: string): Promise<string> {
        return crypto2.encrypt.rsa(data, publicKey);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Decrypts with the RSA algorithm the encrypted data
     * with the privateKey and returns the decrypted message.
     * @example
     * const decryptedMessage = await asymmetricRsaDecrypt('ENCRYPTED-MESSAGE','PRIVATE-KEY');
     * @param encryptedData
     * @param privateKey
     */
    async asymmetricRsaDecrypt(encryptedData: string, privateKey: string): Promise<string> {
        return crypto2.decrypt.rsa(encryptedData, privateKey);
    }

    //Symmetric Encryption
    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Generates an password that you can use for Symmetric Encryption.
     * @example
     * const password = await generatePassword();
     * @param secret
     */
    async generatePassword(secret: String = this.generateRandomString()): Promise<string> {
        return crypto2.createPassword(secret);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Generates an initialization vector that you can use for Symmetric Encryption.
     * @example
     * const iv = await generateIv();
     */
    async generateIv(): Promise<string> {
        return crypto2.createIv();
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Encrypts a message with a password and initialization vector and returns the encrypted message.
     * It uses the aes256cbc algorithm.
     * @example
     * const encryptedMessage = await symmetricEncrypt('secret information',password,iv);
     * @param message
     * @param password
     * @param iv
     */
    async symmetricEncrypt(message: string, password: string, iv: string): Promise<string> {
        return crypto2.encrypt.aes256cbc(message, password, iv);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Decrypts a message with a password and initialization vector and returns the decrypted message.
     * It uses the aes256cbc algorithm.
     * @example
     * const password = await symmetricDecrypt(encryptedMessage,password,iv);
     * @param encryptedMessage
     * @param password
     * @param iv
     */
    async symmetricDecrypt(encryptedMessage: string, password: string, iv: string): Promise<string> {
        return crypto2.decrypt.aes256cbc(encryptedMessage, password, iv);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an generated uuid v4.
     */
    generateUUIDv4(): string {
        return uuidV4();
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an generated unique id.
     * By using npm package 'uniqid'.
     */
    generateUniqueId(): string {
        return uniqid();
    }

    //Part Time utils

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * Returns a promise that will be resolved in the defined time (milliseconds).
     * Can be used to let the server wait a specific amount of time.
     * @param milliseconds
     * @example
     * await wait(2000);
     */
    wait(milliseconds: number): Promise<void> {
        return createAsyncTimeout(milliseconds)
    }

    /**
     * Creates an asynchronous interval iterator.
     * @example
     * let i = 0;
     * for await (const clear of interval(2000)){
     *     i++;
     *     if(i > 10) {
     *         clear();
     *     }
     * }
     * @param milliseconds
     */
    interval(milliseconds: number) {
        return createIntervalAsyncIterator(milliseconds);
    }

    //Part sign and verify token

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Sign a token.
     * This method is only for advanced use cases.
     * It will not create a token that is based on a zation token structure,
     * also it will not attach this token to any client or request.
     * It will use the default server settings,
     * but you can override some options by providing jwt sign options as a second argument.
     * The return value is the signed token as a string.
     * @example
     * await signToken({someVariable: 'Hello'},{expiresIn: 200});
     * @param data
     * @param jwtOptions
     */
    async signToken(data: object, jwtOptions: JwtSignOptions = {}): Promise<string> {
        return TokenUtils.signToken(data, this.zc, jwtOptions);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Verify a token.
     * This method can be used to verify signed tokens based on the secret key of the server.
     * A use case for this method could be to verify tokens in an express middleware.
     * The return value is the plain decrypted token.
     * @example
     * await verifyToken('djf09ejd103je32ije0');
     * @param signedToken
     * @param jwtOptions
     * @throws BackError with names: tokenExpiredError, jsonWebTokenError or unknownTokenVerifyError.
     */
    async verifyToken(signedToken: string, jwtOptions: JwtVerifyOptions = {}): Promise<Record<string, any>> {
        return TokenUtils.verifyToken(signedToken, this.zc, jwtOptions);
    }

    //Part Port

    // noinspection JSUnusedGlobalSymbols
    /**
     * Check if a specific port is available (closed).
     * @param port
     * @param host
     */
    async isPortAvailable(port: number, host: string = '127.0.0.1'): Promise<boolean> {
        return PortChecker.isPortAvailable(port,host)
    }

    /**
     * Finds the first port that is not in use (Closed).
     * @param ports
     * @param host
     */
    async findAPortNotInUse(ports: number[], host: string = '127.0.0.1'): Promise<number> {
        return PortChecker.findAPortNotInUse(ports,host);
    }

    /**
     * Finds the first port that is in use (Open or blocked).
     * @param ports
     * @param host
     */
    async findAPortInUse(ports: number[], host: string = '127.0.0.1'): Promise<number> {
        return PortChecker.findAPortInUse(ports,host);
    }

    //Part Services

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the service when it exists; otherwise,
     * it will throw a ServiceNotFoundError error.
     * @throws ServiceNotFoundError
     * @param serviceName
     * @param instanceName Default: 'default'
     */
    async getService<S = any>(serviceName: string, instanceName: string = 'default'): Promise<S> {
        return this.serviceEngine.getService<S>(serviceName, instanceName);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * This function returns a boolean that indicates if the service exists.
     * @param serviceName
     * @param instanceName Default: 'default'
     */
    hasService(serviceName: string, instanceName: string = 'default'): boolean {
        return this.serviceEngine.hasService(serviceName, instanceName);
    }

    //Part Logger

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the logger.
     * This gives you the possibility to log information into the console and log file.
     * Notice that the main config settings are considered.
     * @example
     * log.debug('Some debug message');
     */
    get log(): SimpleLogger {
        return Logger.log;
    }

    //Part Http

    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    /**
     * @description
     * Fetch method witch can be use to make an http request.
     * Look in npm package 'node-fetch'.
     * @param url
     * @param init
     * @example
     * fetch('https://httpbin.org/post', { method: 'POST', body: 'a=1' })
     *      .then(res => res.json()) // expecting a json response
     *      .then(json => console.log(json));
     */
    async fetch(url: string | Request, init?: RequestInit): Promise<Response> {
        return fetch(url, init);
    }

    //Part Extra Emit
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets with a specific user id (on every server).
     * @example
     * emitUser('joel2','myEvent',{myData: 'test'});
     * emitUser('joel2','myEvent',{myData: 'test'},'EXCEPT-SOCKET-SID');
     * @param userId or more userIds in an array.
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitUser(userId: number | string | (number | string)[], event: string, data: any = {}, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.UserIds, WorkerChMapTaskAction.Emit, userId, exceptSocketSids, {event:ZATION_CUSTOM_EVENT_NAMESPACE+event,data});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets with a specific token id (on every server).
     * @example
     * emitToken('TOKEN-UUID1','myEvent',{myData: 'test'});
     * emitToken('TOKEN-UUID2','myEvent',{myData: 'test'},'EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array.
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitTokens(tokenId: string | string[], event: string, data: any = {}, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.TokenIds, WorkerChMapTaskAction.Emit, tokenId, exceptSocketSids, {event:ZATION_CUSTOM_EVENT_NAMESPACE+event, data});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets (on every server).
     * @example
     * emitAllSockets('myEvent',{myData: 'test'});
     * emitAllSockets('myEvent',{myData: 'test'},'EXCEPT-SOCKET-SID');
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitAllSockets(event: string, data: any = {}, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.AllSockets, WorkerChMapTaskAction.Emit, [], exceptSocketSids, {event:ZATION_CUSTOM_EVENT_NAMESPACE+event, data});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets with a specific sid (on every server).
     * @example
     * emitSockets('SOCKET-SID','myEvent',{myData: 'test'});
     * emitSockets(['SOCKET-SID-1','SOCKET-SID-2'],'myEvent',{myData: 'test'});
     * @param socketSid or more socketSids in an array.
     * @param event
     * @param data
     */
    async emitSockets(socketSid: string | string[], event: string, data: any = {}): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.SocketSids, WorkerChMapTaskAction.Emit, socketSid, [], {event:ZATION_CUSTOM_EVENT_NAMESPACE+event, data});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets that belong to a specific auth user group (on every server).
     * @example
     * emitAuthUserGroups('admin','myEvent',{myData: 'test'});
     * emitAuthUserGroups(['user','admin'],'myEvent',{myData: 'test'});
     * @param authUserGroup or more authUserGroups in an array
     * or null witch stands for all auth user groups
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitAuthUserGroups(authUserGroup: string | null | (string)[], event: string, data: any = {}, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.AuthUserGroups, WorkerChMapTaskAction.Emit, authUserGroup || [], exceptSocketSids, {
            event:ZATION_CUSTOM_EVENT_NAMESPACE+event,
            data,
            all: authUserGroup === null
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets that belong to the default user group (on every server).
     * @example
     * emitDefaultUserGroup('myEvent',{myData: 'test'});
     * emitDefaultUserGroup('myEvent',{myData: 'test'},'EXCEPT-SOCKET-SID');
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitDefaultUserGroup(event: string, data: any = {}, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.DefaultUserGroup, WorkerChMapTaskAction.Emit, [], exceptSocketSids, {event:ZATION_CUSTOM_EVENT_NAMESPACE+event, data});
    }

    //Part Security

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets with a specific user id (on every server).
     * @example
     * disconnectUser(['tim902','leonie23']);
     * disconnectUser('tim902');
     * disconnectUser('tim902','EXCEPT-SOCKET-SID');
     * @param userId or more userIds in an array.
     * @param exceptSocketSids
     */
    async disconnectUser(userId: number | string | (number | string)[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.UserIds, WorkerChMapTaskAction.Disconnect, userId, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets with a specific token id (on every server).
     * @example
     * disconnectToken(['TOKEN-UUID1','TOKEN-UUID2']);
     * disconnectToken('TOKEN-UUID1');
     * disconnectToken('TOKEN-UUID1','EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array.
     * @param exceptSocketSids
     */
    async disconnectTokens(tokenId: string | string[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.TokenIds, WorkerChMapTaskAction.Disconnect, tokenId, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets (on every server).
     * @example
     * disconnectAllSockets('EXCEPT-SOCKET-SID');
     * @param exceptSocketSids
     */
    async disconnectAllSockets(exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.AllSockets, WorkerChMapTaskAction.Disconnect, [], exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets with a specific sid (on every server).
     * @example
     * disconnectSockets(['SOCKET-SID-1','SOCKET-SID-2']);
     * disconnectSockets('SOCKET-SID');
     * @param socketSid or more socketSids in an array.
     */
    async disconnectSockets(socketSid: string | string[]): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.SocketSids, WorkerChMapTaskAction.Disconnect, socketSid, []);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets that belong to a specific auth user group (on every server).
     * @example
     * disconnectAuthUserGroups('admin');
     * disconnectAuthUserGroups(['user','admin'],'EXCEPT-SOCKET-SID');
     * @param authUserGroup or more authUserGroups in an array
     * or null witch stands for all auth user groups
     * @param exceptSocketSids
     */
    async disconnectAuthUserGroups(authUserGroup: string | null | (string)[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.AuthUserGroups, WorkerChMapTaskAction.Disconnect, authUserGroup || [], exceptSocketSids, {all: authUserGroup === null});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets that belong to the default user group (on every server).
     * @example
     * disconnectDefaultUserGroup();
     * disconnectDefaultUserGroup('EXCEPT-SOCKET-SID');
     * @param exceptSocketSids
     */
    async disconnectDefaultUserGroup(exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.DefaultUserGroup, WorkerChMapTaskAction.Disconnect, [], exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets with a specific user id (on every server).
     * @example
     * deauthenticateUser(['tim902','leonie23']);
     * deauthenticateUser('tim902');
     * deauthenticateUser('tim902','EXCEPT-SOCKET-SID');
     * @param userId or more userIds in an array.
     * @param exceptSocketSids
     */
    async deauthenticateUser(userId: number | string | (number | string)[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.UserIds, WorkerChMapTaskAction.Deauthenticate, userId, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets with a specific token id (on every server).
     * @example
     * deauthenticateToken(['TOKEN-UUID1','TOKEN-UUID2']);
     * deauthenticateToken('TOKEN-UUID2');
     * deauthenticateToken('TOKEN-UUID2','EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array.
     * @param exceptSocketSids
     */
    async deauthenticateTokens(tokenId: string | string[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.TokenIds, WorkerChMapTaskAction.Deauthenticate, tokenId, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets (on every server).
     * @example
     * deauthenticateAllSockets('EXCEPT-SOCKET-SID');
     * @param exceptSocketSids
     */
    async deauthenticateAllSockets(exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.AllSockets, WorkerChMapTaskAction.Deauthenticate, [], exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets with a specific sid (on every server).
     * @example
     * deauthenticateSockets(['SOCKET-SID-1','SOCKET-SID-2']);
     * deauthenticateSockets('SOCKET-SID');
     * @param socketSid or more socketSids in an array.
     */
    async deauthenticateSockets(socketSid: string | string[]): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.SocketSids, WorkerChMapTaskAction.Deauthenticate, socketSid, []);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets that belong to a specific auth user group (on every server).
     * @example
     * deauthenticateAuthUserGroups('admin');
     * deauthenticateAuthUserGroups(['user','admin'],'EXCEPT-SOCKET-SID');
     * @param authUserGroup or more authUserGroups in an array
     * or null witch stands for all auth user groups
     * @param exceptSocketSids
     */
    async deauthenticateAuthUserGroups(authUserGroup: string | null | (string)[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChMapTarget.AuthUserGroups, WorkerChMapTaskAction.Deauthenticate, authUserGroup || [], exceptSocketSids, {all: authUserGroup === null});
    }

    //Part Socket Tools
    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns the socketId from a socketSid.
     * @example
     * socketSidToSocketId('SOCKET-SID');
     * @param socketSid
     */
    socketSidToSocketId(socketSid: string): string {
        return SidBuilder.socketSidToSocketId(socketSid);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns the server instance id from a socketSid.
     * @example
     * socketSidToSeverId(SOCKET-SID');
     * @param socketSid
     */
    socketSidToSeverId(socketSid: string): string {
        return SidBuilder.socketSidToServerInstanceId(socketSid);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns the worker id from a socketSid.
     * @example
     * socketSidToWorkerId('SOCKET-SID');
     * @param socketSid
     */
    socketSidToWorkerId(socketSid: string): string {
        return SidBuilder.socketSidToWorkerId(socketSid);
    }

    //Token payload
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a token payload prop on all tokens
     * with a specific user id with object path.
     * Every change on the token of a socket will
     * update the authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * @example
     * await setTokenPayloadPropOnUserId('USER_ID','person.email','example@gmail.com');
     * @param userId
     * @param path
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @param value
     * @param exceptSocketSids
     */
    setTokenPayloadPropOnUserId(userId: string | number, path: string | string[], value: any, exceptSocketSids: string[] | string = []): Promise<void> {
        return this.exchangeEngine.publishUpdateUserTokenWorkerTask
        ([{t: SyncTokenOperationType.Set,p: path,v: value}], userId, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a token payload prop on all tokens
     * with a specific user id with object path.
     * Every change on the token of a socket will
     * update the authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * @example
     * await deleteTokenPayloadPropOnUserId('USER_ID','person.email');
     * @param userId
     * @param path
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @param exceptSocketSids
     */
    deleteTokenPayloadPropOnUserId(userId: string | number, path?: string | string[], exceptSocketSids: string[] | string = []): Promise<void> {
        return this.exchangeEngine.publishUpdateUserTokenWorkerTask
        ([{t: SyncTokenOperationType.Delete,p: path}], userId, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sequence edit the token payload on all tokens
     * with a specific user id with object path.
     * Useful if you want to make several changes because it
     * will do everything in one action, and therefore it saves performance.
     * Every change on the token of a socket will
     * update the authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * @example
     * await seqEditTokenPayloadOnUserId('USER_ID')
     *      .delete('person.lastName')
     *      .set('person.name','Luca')
     *      .set('person.email','example@gmail.com')
     *      .commit();
     * @param userId
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @param exceptSocketSids
     */
    seqEditTokenPayloadOnUserId(userId: string | number, exceptSocketSids: string[] | string = []): ObjectPathSequence {
        return new ObjectPathTokenRemoteSequenceImp(async (operations) => {
            if (operations.length > 0) {
                await this.exchangeEngine.publishUpdateUserTokenWorkerTask
                (operations, userId, exceptSocketSids);
            }
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a token payload prop on all tokens
     * with a specific auth user group with object path.
     * Every change on the token of a socket will
     * update the authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * @example
     * await setTokenPayloadPropOnGroup('AUTH-USER-GROUP','person.email','example@gmail.com');
     * @param authUserGroup
     * @param path
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @param value
     * @param exceptSocketSids
     */
    setTokenPayloadPropOnGroup(authUserGroup: string, path: string | string[], value: any, exceptSocketSids: string[] | string = []): Promise<void> {
        return this.exchangeEngine.publishUpdateGroupTokenWorkerTask
        ([{t: SyncTokenOperationType.Set,p: path,v: value}], authUserGroup, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a token payload prop on all tokens
     * with a specific auth user group with object path.
     * Every change on the token of a socket will
     * update the authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * @example
     * await deleteTokenPayloadPropOnGroup('AUTH-USER-GROUP','person.email');
     * @param authUserGroup
     * @param path
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @param exceptSocketSids
     */
    deleteTokenPayloadPropOnGroup(authUserGroup: string, path?: string | string[], exceptSocketSids: string[] | string = []): Promise<void> {
        return this.exchangeEngine.publishUpdateGroupTokenWorkerTask
        ([{t: SyncTokenOperationType.Delete,p: path}], authUserGroup, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sequence edit the token payload on all tokens
     * with a specific auth user group with object path.
     * Useful if you want to make several changes because it
     * will do everything in one action, and therefore it saves performance.
     * Every change on the token of a socket will
     * update the authentication of this socket. (Like a new authentication on top).
     * You can access the token payload on the client and server-side.
     * But only change, delete or set from the server-side.
     * @example
     * await seqEditTokenPayloadOnGroup('AUTH-USER-GROUP')
     *      .delete('person.lastName')
     *      .set('person.name','Luca')
     *      .set('person.email','example@gmail.com')
     *      .commit();
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @param authUserGroup
     * @param exceptSocketSids
     */
    seqEditTokenPayloadOnGroup(authUserGroup: string, exceptSocketSids: string[] | string = []): ObjectPathSequence {
        return new ObjectPathTokenRemoteSequenceImp(async (operations) => {
            if (operations.length > 0) {
                await this.exchangeEngine.publishUpdateGroupTokenWorkerTask
                (operations, authUserGroup, exceptSocketSids);
            }
        });
    }

    //Worker attachment

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the worker attachment.
     */
    get workerAttachment(): Partial<WA> {
        return this.worker.getAttachment();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Clears the worker attachment.
     */
    clearWorkerAttachment(): void {
        this.worker.setAttachment({});
    }

    //Part ApiLevel

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * Build a closure for selecting the API level.
     * The closure will return the correct mapped value with the best compatible API level.
     * If there is no compatible API level, the closure returns undefined.
     * Notice if you always have a 1 in the mapped values as an API level the closure will always return a value.
     * @param apiLevelSwitch
     * @example
     * const switch = createApiLevelSwitcher<string>({
     *     1: 'apiLevel1',
     *     5: 'apiLevel5',
     *     8: 'apiLevel8',
     *     2: 'apiLevel2'
     * });
     * console.log(switch(7)); // apiLevel5
     * console.log(switch(20)); // apiLevel8
     * console.log(switch(1)); // apiLevel1
     */
    createApiLevelSwitcher<T>(apiLevelSwitch: ApiLevelSwitch<T>): ApiLevelSwitchFunction<T> {
        return ApiLevelUtils.createApiLevelSwitcher<T>(apiLevelSwitch);
    }

    //Part Base64Tools

    // noinspection JSMethodCanBeStatic, JSUnusedGlobalSymbols
    /**
     * @description
     * Calculates the byte size of an encoded base64 string.
     * @example
     * base64ByteSize("ENCODED-BASE64");
     * @param encodedBase64
     * The encoded base64 string.
     */
    base64ByteSize(encodedBase64: string): number {
        return Base64Utils.getByteSize(encodedBase64);
    }

    // noinspection JSMethodCanBeStatic, JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the mimeType and mimeSubType of an encoded base64 string.
     * @example
     * base64ContentInfo("ENCODED-BASE64");
     * @param encodedBase64
     * The encoded base64 string.
     * @return
     * Can be null if the base64 string has no content type.
     * Otherwise, it is an object with the properties: mimeSubType (png,jpg...), mimeType (image,video...).
     */
    base64ContentInfo(encodedBase64: string): null | { mimeSubType: string, mimeType: string } {
        return Base64Utils.getContentInfo(encodedBase64);
    }

    // noinspection JSMethodCanBeStatic, JSUnusedGlobalSymbols
    /**
     * Encodes a string or buffer to a base64 string.
     * @param input
     * @param urlSafe
     * Indicates if the base64 string should be URL safe.
     * @param encoding
     * The encoding of the provided input. Default to utf8.
     */
    base64Encode(input: string | Buffer, urlSafe: boolean = true, encoding: BufferEncoding = "utf8"): string {
        const base64 = Buffer.isBuffer(input) ? input.toString('base64') :
            Buffer.from(input,encoding).toString('base64');
        return (urlSafe ? base64url.fromBase64(base64): base64);
    }

    // noinspection JSMethodCanBeStatic, JSUnusedGlobalSymbols
    /**
     * Decodes a base64 string.
     * @param base64
     * @param urlSafe
     * Indicates if the encoded base64 string is URL safe.
     * @param encoding
     * The expected encoding of the decoded result. Default to utf8.
     */
    base64Decode(base64: string, urlSafe: boolean = true, encoding: BufferEncoding = "utf8"): string {
        return Buffer.from((urlSafe ? base64url.toBase64(base64): base64), "base64").toString(encoding);
    }

    // ByteTools

    // noinspection JSMethodCanBeStatic, JSUnusedGlobalSymbols
    /**
     * @description
     * Calculates the byte size of an utf-8 string.
     * By using the npm package byte-length.
     * @example
     * stringByteSize("UTF-8_STRING");
     * @param string
     * The utf-8 string.
     */
    stringByteSize(string: string): number {
        return byteLength(string);
    }

    //Part Worker

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the Socket with the corresponding socket id.
     * Notice that you only have access to the sockets
     * which are connected to the current worker.
     * @example
     * getWorkerSocket('SOCKET-ID');
     * @param socketId
     */
    getSocket(socketId: string): Socket | undefined {
        return this.worker.scServer.clients[socketId]?._socket;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the Sockets of the current worker.
     */
    getSockets(): Socket[] {
        const sockets: Socket[] = [];
        const clients = this.worker.scServer.clients;
        for(let id in clients) {
            if(clients.hasOwnProperty(id)){
                sockets.push(clients[id]._socket);
            }
        }
        return sockets;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the count of connected
     * clients to the current worker.
     */
    getWorkerClientsCount(): number {
        return this.worker.getStatus().clientCount;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the HTTP requests per
     * minute of the current worker.
     */
    getWorkerHttpRequestPerMinute(): number {
        return this.worker.getStatus().httpRPM;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the web socket requests per
     * minute of the current worker.
     */
    getWorkerWsRequestPerMinute(): number {
        return this.worker.getStatus().wsRPM;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the sockets with a specific token id.
     * Notice that you only have access to the sockets
     * which are connected to the current worker.
     * @example
     * getSocketIdsWithTokenId('TOKEN-ID');
     * @param tokenId
     */
    getSocketsWithTokenId(tokenId: string): Socket[] {
        return this.worker.getTokenIdToScMapper().getValues(tokenId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the sockets with a specific user id.
     * Notice that you only have access to the sockets
     * which are connected to the current worker.
     * @example
     * getSocketIdsWithUserId('tom1554');
     * @param userId
     */
    getSocketsWithUserId(userId: string): Socket[] {
        return this.worker.getUserIdToScMapper().getValues(userId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns an object with authUserGroups as keys and the count of corresponding
     * connected clients as a value (only of the current worker).
     */
    getWorkerAuthUserGroupsCount(): Record<string,number> {
       const res = {};
       const authGroups = this.worker.getAuthConfig().getAuthUserGroups();
       for(const group in authGroups) {
           if(authGroups.hasOwnProperty(group)) {
               res[group] = this.worker.getAuthUserGroupToScMapper().getLengthOfKey(group);
           }
       }
       return res;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the count of the connected clients which belongs
     * to the default user group (only of the current worker).
     */
    getWorkerDefaultUserGroupCount(): number {
        return this.worker.getDefaultUserGroupSet().getLength();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the count of connected
     * panel clients (only of the current worker).
     */
    getWorkerPanelClientsCount(): number {
        return this.worker.getPanelUserSet().getLength();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the count of the connected clients which belongs
     * to a specific auth user group (only of the current worker).
     */
    getWorkerAuthUserGroupCount(authUserGroup: string): number {
        return this.worker.getAuthUserGroupToScMapper().getLengthOfKey(authUserGroup);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns an object with authUserGroups as keys and corresponding
     * sockets of that user group as a value (only of the current worker).
     */
    getWorkerAuthUserGroupsSockets(): Record<string,Socket[]> {
        const res = {};
        const authGroups = this.worker.getAuthConfig().getAuthUserGroups();
        for(const group in authGroups) {
            if(authGroups.hasOwnProperty(group)) {
                res[group] = this.worker.getAuthUserGroupToScMapper().getValues(group);
            }
        }
        return res;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns an array of sockets which belongs to
     * the default user group (only of the current worker).
     */
    getWorkerDefaultUserGroupSockets(): Socket[] {
        return this.worker.getDefaultUserGroupSet().toArray();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns an array of panel
     * sockets (only of the current worker).
     */
    getWorkerPanelSockets(): Socket[] {
        return this.worker.getPanelUserSet().toArray();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns an array of sockets which belongs to
     * a specific auth user group (only of the current worker).
     */
    getWorkerAuthUserGroupSockets(authUserGroup: string): Socket[] {
        return this.worker.getAuthUserGroupToScMapper().getValues(authUserGroup);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sends a message to all workers (on every server).
     * You can react to a worker message with
     * the worker message event in the app config.
     */
    async sendWorkerMessage(data: any): Promise<void> {
        return this.exchangeEngine.publishSpecialTaskToWorker
        (WorkerChSpecialTaskAction.Message, data);
    }

    //Part clone utils

    // noinspection JSUnusedGlobalSymbols
    /**
     * Deep clone any value.
     * Notice that it only clones
     * enumerable properties of an object.
     * @param value
     */
    deepClone<T extends any = any>(value: T): T {
        return CloneUtils.deepClone(value);
    }

    //Part Databoxes

    /**
     * This function helps to access your Databox/es.
     * You only need to call this method with the class/es of the Databox/es.
     * It returns the specific databox instance.
     * If you want to access multiple Databoxes, the method returns a
     * DataboxContainer or DataboxFamilyContainer.
     * With these containers, you can interact with multiple Databoxes.
     * So, for example, if you have two Databoxes with different API levels from the same type,
     * you can communicate directly with both.
     * But notice that the containers only provides a limited scope of methods.
     * It is recommended if you use this method in a component that you prepare
     * the access to the Databox/es in the initialize method.
     * If you use this method in an event function, use an initEvent to prepare the access.
     * @example
     * databox(ProfileDatabox_1,ProfileDatabox_2);
     * databox(PublicChatDatabox);
     */
    databox(): undefined;
    /**
     * This function helps to access your Databox/es.
     * You only need to call this method with the class/es of the Databox/es.
     * It returns the specific databox instance.
     * If you want to access multiple Databoxes, the method returns a
     * DataboxContainer or DataboxFamilyContainer.
     * With these containers, you can interact with multiple Databoxes.
     * So, for example, if you have two Databoxes with different API levels from the same type,
     * you can communicate directly with both.
     * But notice that the containers only provides a limited scope of methods.
     * It is recommended if you use this method in a component that you prepare
     * the access to the Databox/es in the initialize method.
     * If you use this method in an event function, use an initEvent to prepare the access.
     * @example
     * databox(ProfileDatabox_1,ProfileDatabox_2);
     * databox(PublicChatDatabox);
     * @param databox
     * The class of the Databox.
     */
    databox<T extends AnyDataboxClass>(databox: T): T['prototype'];
    /**
     * This function helps to access your Databox/es.
     * You only need to call this method with the class/es of the Databox/es.
     * It returns the specific databox instance.
     * If you want to access multiple Databoxes, the method returns a
     * DataboxContainer or DataboxFamilyContainer.
     * With these containers, you can interact with multiple Databoxes.
     * So, for example, if you have two Databoxes with different API levels from the same type,
     * you can communicate directly with both.
     * But notice that the containers only provides a limited scope of methods.
     * It is recommended if you use this method in a component that you prepare
     * the access to the Databox/es in the initialize method.
     * If you use this method in an event function, use an initEvent to prepare the access.
     * @example
     * databox(ProfileDatabox_1,ProfileDatabox_2);
     * databox(PublicChatDatabox);
     * @param databoxes
     * The class/es of the Databox/es.
     */
    databox(...databoxes: DataboxFamilyClass[]): DataboxFamilyContainer;
    /**
     * This function helps to access your Databox/es.
     * You only need to call this method with the class/es of the Databox/es.
     * It returns the specific databox instance.
     * If you want to access multiple Databoxes, the method returns a
     * DataboxContainer or DataboxFamilyContainer.
     * With these containers, you can interact with multiple Databoxes.
     * So, for example, if you have two Databoxes with different API levels from the same type,
     * you can communicate directly with both.
     * But notice that the containers only provides a limited scope of methods.
     * It is recommended if you use this method in a component that you prepare
     * the access to the Databox/es in the initialize method.
     * If you use this method in an event function, use an initEvent to prepare the access.
     * @example
     * databox(ProfileDatabox_1,ProfileDatabox_2);
     * databox(PublicChatDatabox);
     * @param databoxes
     * The class/es of the Databox/es.
     */
    databox(...databoxes: DataboxClass[]): DataboxContainer;
    /**
     * This function helps to access your Databox/es.
     * You only need to call this method with the class/es of the Databox/es.
     * It returns the specific databox instance.
     * If you want to access multiple Databoxes, the method returns a
     * DataboxContainer or DataboxFamilyContainer.
     * With these containers, you can interact with multiple Databoxes.
     * So, for example, if you have two Databoxes with different API levels from the same type,
     * you can communicate directly with both.
     * But notice that the containers only provides a limited scope of methods.
     * It is recommended if you use this method in a component that you prepare
     * the access to the Databox/es in the initialize method.
     * If you use this method in an event function, use an initEvent to prepare the access.
     * @example
     * databox(ProfileDatabox_1,ProfileDatabox_2);
     * databox(PublicChatDatabox);
     * @param databoxes
     * The class/es of the Databox/es.
     */
    databox<T extends AnyDataboxClass>(...databoxes: DataboxFamilyClass[] | DataboxClass[] | [T]): DataboxFamilyContainer | DataboxContainer | T['prototype'] | undefined {
        switch (databoxes.length) {
            case 0:
                return undefined;
            case 1:
                return ComponentUtils.getInstanceSafe(databoxes[0]);
            default:
                return DataboxUtils.getDbContainer(databoxes as DataboxFamilyClass[] | DataboxClass[]);
        }
    }

    //Part Channels

    /**
     * This function helps to access your Channel/s.
     * You only need to call this method with the class/es of the Channel/s.
     * It returns the specific Channel instance.
     * If you want to access multiple channels, the method returns a ChannelContainer
     * or ChannelFamilyContainer.
     * With these containers, you can interact with multiple channels.
     * So, for example, if you have two Channels with different API levels from the same type,
     * you can communicate directly with both.
     * But notice that the containers only provides a limited scope of methods.
     * It is recommended if you use this method in a component that you prepare
     * the access to the Channel/s in the initialize method.
     * If you use this method in an event function, use an initEvent to prepare the access.
     * @example
     * channel(ChatChannel_1,ChatChannel_2);
     * databox(InfoChannel);
     */
    channel(): undefined;
    /**
     * This function helps to access your Channel/s.
     * You only need to call this method with the class/es of the Channel/s.
     * It returns the specific Channel instance.
     * If you want to access multiple channels, the method returns a ChannelContainer
     * or ChannelFamilyContainer.
     * With these containers, you can interact with multiple channels.
     * So, for example, if you have two Channels with different API levels from the same type,
     * you can communicate directly with both.
     * But notice that the containers only provides a limited scope of methods.
     * It is recommended if you use this method in a component that you prepare
     * the access to the Channel/s in the initialize method.
     * If you use this method in an event function, use an initEvent to prepare the access.
     * @example
     * databox(ProfileDataboxFamilyV1,ProfileDataboxFamilyV2);
     * databox(PublicChatDatabox);
     * @param channel
     * The class of the Channel.
     */
    channel<T extends AnyChannelClass>(channel: T): T['prototype'];
    /**
     * This function helps to access your Channel/s.
     * You only need to call this method with the class/es of the Channel/s.
     * It returns the specific Channel instance.
     * If you want to access multiple channels, the method returns a ChannelContainer
     * or ChannelFamilyContainer.
     * With these containers, you can interact with multiple channels.
     * So, for example, if you have two Channels with different API levels from the same type,
     * you can communicate directly with both.
     * But notice that the containers only provides a limited scope of methods.
     * It is recommended if you use this method in a component that you prepare
     * the access to the Channel/s in the initialize method.
     * If you use this method in an event function, use an initEvent to prepare the access.
     * @example
     * channel(ChatChannel_1,ChatChannel_2);
     * databox(InfoChannel);
     * @param channels
     * The class/es of the Channel/s.
     */
    channel(...channels: ChannelFamilyClass[]): ChannelFamilyContainer;
    /**
     * This function helps to access your Channel/s.
     * You only need to call this method with the class/es of the Channel/s.
     * It returns the specific Channel instance.
     * If you want to access multiple channels, the method returns a ChannelContainer
     * or ChannelFamilyContainer.
     * With these containers, you can interact with multiple channels.
     * So, for example, if you have two Channels with different API levels from the same type,
     * you can communicate directly with both.
     * But notice that the containers only provides a limited scope of methods.
     * It is recommended if you use this method in a component that you prepare
     * the access to the Channel/s in the initialize method.
     * If you use this method in an event function, use an initEvent to prepare the access.
     * @example
     * channel(ChatChannel_1,ChatChannel_2);
     * databox(InfoChannel);
     * @param channels
     * The class/es of the Channel/s.
     */
    channel(...channels: ChannelClass[]): ChannelContainer;
    /**
     * This function helps to access your Channel/s.
     * You only need to call this method with the class/es of the Channel/s.
     * It returns the specific Channel instance.
     * If you want to access multiple channels, the method returns a ChannelContainer
     * or ChannelFamilyContainer.
     * With these containers, you can interact with multiple channels.
     * So, for example, if you have two Channels with different API levels from the same type,
     * you can communicate directly with both.
     * But notice that the containers only provides a limited scope of methods.
     * It is recommended if you use this method in a component that you prepare
     * the access to the Channel/s in the initialize method.
     * If you use this method in an event function, use an initEvent to prepare the access.
     * @example
     * channel(ChatChannel_1,ChatChannel_2);
     * databox(InfoChannel);
     * @param channels
     * The class/es of the Channel/s.
     */
    channel<T extends AnyChannelClass>(...channels: ChannelFamilyClass[] | ChannelClass[] | [T]): ChannelFamilyContainer | ChannelContainer | T['prototype'] | undefined {
        switch (channels.length) {
            case 0:
                return undefined;
            case 1:
                return ComponentUtils.getInstanceSafe(channels[0]);
            default:
                return ChannelUtils.getChContainer(channels as ChannelFamilyClass[] | ChannelClass[]);
        }
    }
}
