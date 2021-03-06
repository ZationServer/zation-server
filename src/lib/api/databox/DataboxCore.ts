/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {DataboxConfig, DbAccessFunction}  from '../../main/config/definitions/parts/databoxConfig';
import Bag                                from "../Bag";
import {ClientErrorName}                  from "../../main/definitions/clientErrorName";
const  Jwt                              = require('jsonwebtoken');
import {JwtSignFunction, JwtVerifyFunction, JwtVerifyOptions} from "../../main/definitions/jwt";
// noinspection ES6PreferShortImport
import {buildKeyArray}                    from "../../main/databox/keyArrayUtils.js";
import {DataboxConnectReq, DataboxConnectRes, DataboxInfo, DbToken} from '../../main/databox/dbDefinitions';
import {ConsumeInputFunction, ValidateInputFunction}                from '../../main/input/inputClosureCreator';
import ErrorUtils                         from "../../main/utils/errorUtils";
import Component                          from '../component/Component';
import {componentTypeSymbol}              from '../../main/component/componentUtils';
import Socket                             from '../Socket';
import MidTaskScheduler                   from './../../main/utils/midTaskScheduler';
import Logger                             from '../../main/log/logger';
import {ErrorEventHolder}                 from '../../main/error/errorEventHolder';
import {PreparedEvents}                   from '../../main/config/definitions/parts/events';
import NoDataError                        from '../../main/databox/noDataError';
import BackError                          from '../BackError';
import BackErrorBag                       from '../BackErrorBag';
import {AnyDataboxClass}                  from './AnyDataboxClass';

/**
 * If you always want to present the most recent data on the client,
 * the Databox is the best choice.
 * The Databox will keep the data up to date on the client in real-time.
 * Also, it will handle all problematic cases, for example,
 * when the connection to the server is lost,
 * and the client did not get an update of the data.
 * It's also the right choice if you want to present a significant amount of data
 * because Databoxes support the functionality to stream the data
 * to the clients whenever a client needs more data.
 * Additionally, it keeps the network traffic low because it
 * only sends the changed data information, not the whole data again.
 */
export default abstract class DataboxCore extends Component {

    /**
     * @description
     * The Databox token version indicates the version of the data tokens.
     * You should change that version whenever you make a significant change in the session data structure.
     * It helps to protect your system against old tokens with different structures.
     * @default 0
     */
    protected readonly dbTokenVersion: number = 0;

    protected readonly _parsedReloadStrategy?: [string,any?];
    protected readonly _initialData: any;
    protected readonly _unregisterDelay: number;
    protected readonly _preparedData: DbPreparedData;
    private readonly _sendErrorDescription: boolean;
    private readonly _preparedTokenSessionKey: string;

    private readonly _parallelFetch: boolean;
    private readonly _optionsInputConsumer: ConsumeInputFunction;
    private readonly _fetchInputConsumer: ConsumeInputFunction;
    private readonly _memberInputValidator: ValidateInputFunction;

    protected readonly _connectionProcessMidTaskScheduler = new MidTaskScheduler();

    /**
     * @internal
     */
    protected readonly _errorEvent: PreparedEvents['error'] = ErrorEventHolder.get();

    protected constructor(identifier: string, bag: Bag, preparedData: DbPreparedData, apiLevel: number | undefined) {
        super(identifier,apiLevel);
        this._preparedData = preparedData;
        this._sendErrorDescription = bag.getMainConfig().sendErrorDescription || bag.isDebug();

        this._parallelFetch = preparedData.parallelFetch;
        this._optionsInputConsumer = preparedData.consumeOptionsInput;
        this._fetchInputConsumer = preparedData.consumeFetchInput;
        this._memberInputValidator = preparedData.validateMemberInput;
        this._unregisterDelay = preparedData.unregisterDelay;
        this._initialData = preparedData.initialData;
        if(preparedData.reloadStrategy) {
            const parsedStrategy: [string,any?] = [preparedData.reloadStrategy.name];
            if(preparedData.reloadStrategy.options !== undefined)
                parsedStrategy[1] = preparedData.reloadStrategy.options;
            this._parsedReloadStrategy = parsedStrategy;
        }

        this._preparedTokenSessionKey =
            `${bag.getZationConfig().getDataboxKey()}.${this.dbTokenVersion}.${this.identifier}${apiLevel !== undefined ? apiLevel: ''}`;
    }

    /**
     * @description
     * This property is used for getting the configuration of this Databox.
     */
    public static readonly config: DataboxConfig = {};

    /**
     * **Not override this method.**
     */
    isParallelFetch(): boolean {
        return this._parallelFetch;
    }

    /**
     * @internal
     * **Not override this method.**
     * A function to consume the fetch input.
     * @param input
     * @private
     */
    async _consumeFetchInput(input: any): Promise<any>
    {
        try {
            return await this._fetchInputConsumer(input);
        }
        catch (inputError) {
            const err: any = new Error('Invalid input to fetch data.');
            err.name = ClientErrorName.InvalidInput;
            err.backErrors = ErrorUtils.dehydrate(inputError,this._sendErrorDescription);
            throw err;
        }
    }

    /**
     * @internal
     * **Not override this method.**
     * A function to validate the member input.
     * @param member
     * @private
     */
    async _validateMemberInput(member: any): Promise<void>
    {
        try {await this._memberInputValidator(member);}
        catch (inputError) {
            const err: any = new Error('Invalid member input.');
            err.name = ClientErrorName.InvalidMember;
            err.backErrors = ErrorUtils.dehydrate(inputError,this._sendErrorDescription);
            throw err;
        }
    }

    /**
     * @internal
     * **Not override this method.**
     * A function to consume the options input.
     * @param options
     * @private
     */
    async _consumeOptionsInput(options: any): Promise<any>
    {
        try {return await this._optionsInputConsumer(options);}
        catch (inputError) {
            const err: any = new Error('Invalid options input.');
            err.name = ClientErrorName.InvalidInput;
            err.backErrors = ErrorUtils.dehydrate(inputError,this._sendErrorDescription);
            throw err;
        }
    }

    /**
     * @internal
     * **Not override this method.**
     * A function that is used internally to process a connection request to this databox.
     * In case of failure or denied, it will throw an error.
     * @param socket
     * @param request
     * @param sendResponse
     */
    protected abstract _processConRequest(socket: Socket, request: DataboxConnectReq, sendResponse: (response: DataboxConnectRes) => void): Promise<void>;

    /**
     * @internal
     * @param socket
     * @param request
     * @param sendResponse
     */
    public async _handleConRequest(socket: Socket, request: DataboxConnectReq, sendResponse: (response: DataboxConnectRes) => void) {
        await this._connectionProcessMidTaskScheduler.scheduleTask(() => this._processConRequest(socket,request,sendResponse))
    }

    /**
     * @internal
     * **Not override this method.**
     * A method that gets called to check if a socket still has access to this Databox.
     * Otherwise, the socket will be kicked out.
     * @private
     */
    abstract _recheckSocketAccess(socket: Socket): Promise<void>;

    /**
     * @internal
     * **Not override this method.**
     * A function that is used internally to check if a socket has access to a Databox.
     * If the access is denied, it will throw an error.
     * @param socket
     * @param dbInfo
     */
    async _checkAccess(socket: Socket, dbInfo: DataboxInfo){
        if(!(await this._preparedData.checkAccess(socket,dbInfo))){
            const err: any = new Error('Access to this Databox denied.');
            err.name = ClientErrorName.AccessDenied;
            throw err;
        }
    }

    /**
     * @internal
     * **Not override this method.**
     * Processes the db token.
     * @param signedToken
     * @param tokenKeyAppend
     * @private
     */
    async _processDbToken(signedToken: string, tokenKeyAppend?: string): Promise<DbToken> {
        try {
            const tmpDbToken = await this._verifyDbToken(signedToken,tokenKeyAppend);
            if(tmpDbToken){
                return tmpDbToken;
            }
        }
        catch (e) {}
        const err: any = new Error('Invalid Token');
        err.name = ClientErrorName.InvalidToken;
        throw err;
    }

    /**
     * @internal
     * **Not override this method.**
     * Verify a session token of the Databox.
     * This method is used internally.
     * @param token
     * @param keyAppend
     */
    async _verifyDbToken(token: string, keyAppend: string = ''): Promise<DbToken | undefined> {
        return new Promise<DbToken | undefined>((resolve) => {(Jwt.verify as JwtVerifyFunction)
            (token,this._preparedTokenSessionKey+keyAppend,{
                ignoreExpiration: true
            } as JwtVerifyOptions,(err, token: DbToken) => {
                resolve(err ? undefined: token);
            });
        });
    }

    /**
     * @internal
     * **Not override this method.**
     * Sign a session token of the Databox.
     * This method is used internally.
     * @param dbToken
     * @param keyAppend
     */
    async _signDbToken(dbToken: DbToken, keyAppend: string = ''): Promise<string> {
        return new Promise<string>((resolve,reject) => {
            (Jwt.sign as JwtSignFunction)(dbToken,this._preparedTokenSessionKey+keyAppend,{},(err,signedToken) => {
                err ? reject(new Error('Sign token failed')): resolve(signedToken);
            });
        });
    }

    /**
     * **Not override this method.**
     * @internal
     * @private
     */
    protected _handleUnexpectedMiddlewareError(err: Error, midName: string) {
        Logger.log.error(`${this.toString()} error was thrown in the middleware ${midName}`,err);
        this._errorEvent(err);
    }

    /**
     * **Not override this method.**
     * @internal
     * @private
     */
    protected _handleFetchErr(err: any) {
        if(err instanceof NoDataError) return err;

        if(!(err instanceof BackError || err instanceof BackErrorBag)) {
            Logger.log.error(`Unknown error while processing a databox fetch request:`,err);
            this._errorEvent(err);
        }

        const errWrapper: any = new Error();
        errWrapper.name = ClientErrorName.FetchProcessError;
        errWrapper.backErrors = ErrorUtils.dehydrate(err,this._sendErrorDescription);
        return errWrapper;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * This method can be used to build a raw key array.
     * These arrays are useful to present data in a sequence and as a key-value map.
     * Later, when you use the Databox,
     * you easily can access the items by the key.
     * If you did not use a key array, the only possibility to
     * access the elements in an array is per index.
     * But this is problematical if every client has a different amount
     * of elements because then you are not able to change one specific item.
     * (Because you would change on each client a different item.)
     * You have more possibilities to create a key array, all are explained in the examples.
     * @example
     * // 1: From objects with a key property
     * // This one is useful when you have objects,
     * // where each of them has the same property that indicates a key.
     * // For example, I have 20 message objects,
     * // and each message object has an id property.
     * // Then you quickly can build the key array by invoking this
     * // method with an array that contains the 20 messages and the property name,
     * // which represents the key.
     * buildKeyArray([{id: '2033323',msg: 'hello'},{id: '2435435',msg: 'hi'}], 'id');
     *
     * // 2: From objects with a key and value property
     * // That option is useful when you want to point with the key to only
     * // a single property value of the object instead of to the whole object.
     * // Therefore you specify in which property the value can be found.
     * // In the message example, we could use the msg property as a value and the id as a key.
     * // The fourth parameter indicates if the data should be compressed.
     * // By default, this is enabled. Compress will convert every object
     * // into a key-value pair array; this helps to remove unnecessary properties
     * // and makes the data that needs to be sent smaller.
     * buildKeyArray([{id: '2033323',msg: 'hello'},
     *  {id: '2435435',msg: 'hi'}], 'id', 'msg', true);
     *
     * // 3: From key-value pair arrays
     * // This option will build the key-array from key-value pair arrays.
     * // That means you specify key-value pairs with arrays.
     * // The first item of each array represents the key and the second item the associated value.
     * buildKeyArray([['2033323','hello'],['2435435','hi']])
     */
    protected buildKeyArray: typeof buildKeyArray = buildKeyArray;

    /**
     * **Not override this method.**
     * Returns the identifier of the Databox from the app config.
     */
    public getIdentifier() {
        return this.identifier;
    }

    /**
     * Decorator for set the Databox config.
     * But notice that when you use the decorator
     * that you cannot set the config property by yourself.
     * @param databoxConfig
     * @example
     * @Databox.Config({});
     */
    public static Config(databoxConfig: DataboxConfig) {
        return (target: typeof DataboxCore) => {
            (target as any)[nameof<AnyDataboxClass>(s => s.config)] = databoxConfig;
        }
    }
}

DataboxCore.prototype[componentTypeSymbol] = 'Databox';

export interface DbPreparedData {
    checkAccess: DbAccessFunction,
    consumeOptionsInput: ConsumeInputFunction,
    consumeFetchInput: ConsumeInputFunction,
    validateMemberInput: ValidateInputFunction,
    parallelFetch: boolean,
    maxBackpressure: number,
    maxSocketInputChannels: number,
    fetchLastCudData: number | false,
    unregisterDelay: number,
    maxSocketMembers: number,
    initialData: any,
    reloadStrategy: {name: string, options?: any} | null
}