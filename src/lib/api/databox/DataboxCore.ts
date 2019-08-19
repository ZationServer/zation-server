/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {DataboxConfig}                    from "../../main/config/definitions/databoxConfig";
import Bag                                from "../Bag";
import NoMoreDataAvailableError           from "../../main/databox/noMoreDataAvailable";
import {VersionSystemAccessCheckFunction} from "../../main/systemVersion/systemVersionChecker";
import UpSocket                           from "../../main/sc/socket";
import {ClientErrorName}                  from "../../main/constants/clientErrorName";
const  Jwt                              = require('jsonwebtoken');
import {JwtSignFunction, JwtVerifyFunction, JwtVerifyOptions} from "../../main/constants/jwt";
import DbKeyArrayUtils                    from "../../main/databox/dbKeyArrayUtils";
import {DataboxInfo, DbToken}             from "../../main/databox/dbDefinitions";
import {InputConsumeFunction}             from "../../main/input/inputClosureCreator";
import ErrorUtils                         from "../../main/utils/errorUtils";
import {DbAccessCheckFunction}            from "../../main/databox/databoxAccessHelper";

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
export default abstract class DataboxCore {
    /**
     * @description
     * The prepared bag from the worker.
     */
    protected bag: Bag;

    /**
     * @description
     * The name of the DataCollection from the app config.
     */
    protected readonly name: string;

    /**
     * @description
     * The Databox token version indicates the version of the data tokens.
     * You should change that version whenever you make a significant change in the session data structure.
     * Than this prevent you for old tokens with old structures.
     * @default 0
     */
    protected readonly dbTokenVersion : number = 0;

    private readonly _dbPreparedData : DbPreparedData;
    private readonly _sendErrorDescription : boolean;
    private readonly _preparedTokenSessionKey : string;

    /**
     * @description
     * The API level of the DataCollection from the app config.
     * It can be undefined if no API level is defined.
     */
    protected readonly apiLevel: number | undefined;

    private readonly _parallelFetch : boolean;
    private readonly _initInputConsumer : InputConsumeFunction;
    private readonly _fetchInputConsumer : InputConsumeFunction;

    protected constructor(name : string, bag: Bag, dbPreparedData : DbPreparedData, apiLevel : number | undefined) {
        this.name = name;
        this.apiLevel = apiLevel;
        this.bag = bag;
        this._dbPreparedData = dbPreparedData;
        this._sendErrorDescription = this.bag.getMainConfig().sendErrorDescription;

        this._parallelFetch = dbPreparedData.parallelFetch;
        this._initInputConsumer = dbPreparedData.initInputConsumer;
        this._fetchInputConsumer = dbPreparedData.fetchInputConsumer;

        this._preparedTokenSessionKey =
            `${bag.getZationConfig().getDataboxKey()}.${this.dbTokenVersion}.${this.name}${apiLevel !== undefined ? apiLevel : ''}`;
    }

    /**
     * **Not override this method.**
     */
    isParallelFetch() : boolean {
        return this._parallelFetch;
    }

    /**
     * **Not override this method.**
     * A function to consume the fetch input.
     * @param input
     * @private
     */
    async _consumeFetchInput(input : any) : Promise<any>
    {
        try {
            return await this._fetchInputConsumer(input);
        }
        catch (inputError) {
            const err : any = new Error('Invalid input to fetch data.');
            err.name = ClientErrorName.INVALID_INPUT;
            err.backErrors = ErrorUtils.convertErrorToResponseErrors(inputError,this._sendErrorDescription);
            throw err;
        }
    }

    /**
     * **Not override this method.**
     * A function to consume the init input.
     * @param input
     * @private
     */
    async _consumeInitInput(input : any) : Promise<any>
    {
        try {
            return await this._initInputConsumer(input);
        }
        catch (inputError) {
            const err : any = new Error('Invalid init input.');
            err.name = ClientErrorName.INVALID_INPUT;
            err.backErrors = ErrorUtils.convertErrorToResponseErrors(inputError,this._sendErrorDescription);
            throw err;
        }
    }

    /**
     * **Not override this method.**
     * A function that is used internally to check if a socket has access to a Databox.
     * If the access is denied, it will throw an error.
     * @param socket
     * @param dbInfo
     */
    async _checkAccess(socket : UpSocket,dbInfo : DataboxInfo){
        const {systemAccessCheck,versionAccessCheck} = this._dbPreparedData;

        if(!systemAccessCheck(socket.baseSHBridge)){
            const err : any = new Error('Access to this Databox with client system denied.');
            err.name = ClientErrorName.NO_ACCESS_WITH_SYSTEM;
            throw err;
        }

        if(!versionAccessCheck(socket.baseSHBridge)){
            const err : any = new Error('Access to this Databox with client version denied.');
            err.name = ClientErrorName.NO_ACCESS_WITH_VERSION;
            throw err;
        }

        if(await this._accessCheck(socket,dbInfo)){
            const err : any = new Error('Access to this Databox denied.');
            err.name = ClientErrorName.ACCESS_DENIED;
            throw err;
        }
    }

    /**
     * **Not override this method.**
     * Verify a session token of the Databox.
     * This method is used internally.
     * @param token
     * @param keyAppend
     */
    async _verifyDbToken(token : string, keyAppend : string = '') : Promise<DbToken | undefined> {
        return new Promise<DbToken | undefined>((resolve) => {(Jwt.verify as JwtVerifyFunction)
            (token,this._preparedTokenSessionKey+keyAppend,{
                ignoreExpiration : true
            } as JwtVerifyOptions,(err, token : DbToken) => {
                resolve(err ? undefined : token);
            });
        });
    }

    /**
     * **Not override this method.**
     * Sign a session token of the Databox.
     * This method is used internally.
     * @param dbToken
     * @param keyAppend
     */
    async _signDbToken(dbToken : DbToken, keyAppend : string = '') : Promise<string> {
        return new Promise<string>((resolve,reject) => {
            (Jwt.sign as JwtSignFunction)(dbToken,this._preparedTokenSessionKey+keyAppend,{},(err,signedToken) => {
                err ? reject(new Error('Sign token failed')) : resolve(signedToken);
            });
        });
    }

    /**
     * **Not override this method.**
     * Checks if the client has access to the Databox.
     * @param socket
     * @param dbInfo
     */
    async _accessCheck(socket : UpSocket, dbInfo : DataboxInfo) : Promise<boolean> {
        return await this._dbPreparedData.accessCheck(socket.authEngine,socket.zSocket,dbInfo);
    }

    /**
     * @description
     * This property is used for getting the configuration of this DataCollection.
     */
    public static readonly config: DataboxConfig = {};

    /**
     * **Can be overridden.**
     * @description
     * Gets invokes when the zation system is creating instance of the DataCollection (in worker start).
     * @param bag
     */
    initialize(bag: Bag): Promise<void> | void {
    }

    // noinspection JSMethodCanBeStatic
    /**
     * **Not override this method.**
     * This method should be called in the fetchData method
     * whenever no more data is available for the client.
     */
    protected noMoreDataAvailable(){
        throw new NoMoreDataAvailableError();
    }

    // noinspection JSMethodCanBeStatic
    /**
     * **Not override this method.**
     * This method should be called in a cud middleware
     * to block the operation.
     */
    protected block(){
        throw new Error('Block cud operation');
    }

    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * This method can be used to build a raw key array.
     * These arrays are useful to present data in a sequence and as a key-value map.
     * To create a key array you need to have an array that contains objects,
     * and each object has the same property that indicates the key.
     * Later, when you use the Databox,
     * you easily can access the items by the key.
     * If you did not use a key array, the only possibility to access the elements in an array is per index.
     * But this is problematical if every client has a different amount of elements because
     * then you not able to change one specific item.
     * (Because you would change  on each client a different item.)
     */
    protected buildKeyArray<T>(array : T[],key : keyof T) {
        return DbKeyArrayUtils.buildKeyArray(array,key);
    }

    /**
     * **Not override this method.**
     * Returns the name of the DataCollection from the app config.
     */
    public getName() {
        return this.name;
    }
}

export interface DbPreparedData {
    versionAccessCheck : VersionSystemAccessCheckFunction,
    systemAccessCheck : VersionSystemAccessCheckFunction,
    accessCheck : DbAccessCheckFunction,
    initInputConsumer : InputConsumeFunction,
    fetchInputConsumer : InputConsumeFunction,
    parallelFetch : boolean,
    maxBackpressure : number,
    maxSocketInputChannels : number
}