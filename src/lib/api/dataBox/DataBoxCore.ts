/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {DataBoxConfig}           from "../../helper/config/definitions/dataBoxConfig";
import SmallBag                  from "./../SmallBag";
import NoMoreDataAvailableError  from "../../helper/dataBox/noMoreDataAvailable";
import {VersionSystemAccessCheckFunction} from "../../helper/systemVersion/systemVersionChecker";
import {TokenStateAccessCheckFunction}    from "../../helper/auth/authAccessChecker";
import UpSocket                           from "../../helper/sc/socket";
import {ErrorName}                        from "../../helper/constants/errorName";
const  Jwt : any                        = require('jsonwebtoken');
import JwtVerifyOptions                   from "../../helper/constants/jwt";
import DbKeyArrayUtils from "../../helper/dataBox/dbKeyArrayUtils";
import {DbSessionData} from "../../helper/dataBox/dbDefinitions";

/**
 * If you want to present data on the client, the DataBox is the best choice.
 * The DataBox will keep the data up to date on the client in real time.
 * Also, it will handle all problematic cases, for example,
 * when the connection to the server is lost,
 * and the client did not get an update of the data.
 * It's also the right choice if you want to present a significant amount of data
 * because DataBoxes support the functionality to stream the data
 * to the client whenever the client need more data.
 * Additionally, it keeps the network traffic low because it
 * only sends the changed data information, not the whole data again.
 */
export default abstract class DataBoxCore {
    /**
     * @description
     * The prepared small bag from the worker.
     */
    protected smallBag: SmallBag;

    /**
     * @description
     * The id of the DataCollection from the app config.
     */
    protected readonly id: string;

    /**
     * @description
     * The DataBox token version indicates the version of the data tokens.
     * You should change that version whenever you make a significant change in the session data structure.
     * Than this prevent you for old tokens with old structures.
     * @default 0
     */
    protected readonly dbTokenVersion : number = 0;

    private readonly dbPreparedData : DbPreparedData;
    private readonly useTokenStateCheck : boolean;
    private readonly preparedTokenSessionKey : string;

    /**
     * @description
     * The API level of the DataCollection from the app config.
     * It can be undefined if no API level is defined.
     */
    protected readonly apiLevel: number | undefined;

    protected constructor(id : string,smallBag: SmallBag,dbPreparedData : DbPreparedData,apiLevel : number | undefined) {
        this.id = id;
        this.apiLevel = apiLevel;
        this.smallBag = smallBag;
        this.dbPreparedData = dbPreparedData;
        this.useTokenStateCheck = this.smallBag.getMainConfig().useTokenStateCheck;

        this.preparedTokenSessionKey =
            `${smallBag.getZationConfig().getDataBoxKey()}.${this.dbTokenVersion}.${this.id}${apiLevel !== undefined ? apiLevel : ''}`;
    }

    /**
     * **Not override this method.**
     * A function that is used internally to check if a socket has access to a DataBox.
     * If the access is denied, it will throw an error.
     * @param socket
     */
    async _checkAccess(socket : UpSocket){
        const {systemAccessCheck,versionAccessCheck} = this.dbPreparedData;

        if(!systemAccessCheck(socket.baseSHBridge)){
            const err : any = new Error('Access to this DataBox with client system denied.');
            err.name = ErrorName.NO_ACCESS_WITH_SYSTEM;
            throw err;
        }

        if(!versionAccessCheck(socket.baseSHBridge)){
            const err : any = new Error('Access to this DataBox with client version denied.');
            err.name = ErrorName.NO_ACCESS_WITH_VERSION;
            throw err;
        }

        if(await this._tokenStateAccessCheck(socket)){
            const err : any = new Error('Access to this DataBox denied.');
            err.name = ErrorName.ACCESS_DENIED;
            throw err;
        }
    }

    /**
     * **Not override this method.**
     * Verify a session token of the DataBox.
     * This method is used internally.
     * @param token
     * @param keyAppend
     */
    async _verifySessionToken(token : string, keyAppend : string = '') : Promise<DbSessionData | undefined> {
        return new Promise<DbSessionData | undefined>((resolve) => {
            Jwt.verify(token,this.preparedTokenSessionKey+keyAppend,{
                ignoreExpiration : true
            } as JwtVerifyOptions,(err, decoded) => {
                resolve(err ? undefined : decoded);
            });
        });
    }

    /**
     * **Not override this method.**
     * Sign a session token of the DataBox.
     * This method is used internally.
     * @param sessionData
     * @param keyAppend
     */
    async _signSessionToken(sessionData : DbSessionData, keyAppend : string = '') : Promise<string> {
        return new Promise<string>((resolve,reject) => {
            Jwt.sign(sessionData,this.preparedTokenSessionKey+keyAppend,{},(err,signedToken) => {
                err ? reject(new Error('Sign token failed')) : resolve(signedToken);
            });
        });
    }

    /**
     * **Not override this method.**
     * Checks if the client has token state access to the DataBox.
     * @param socket
     */
    async _tokenStateAccessCheck(socket : UpSocket) : Promise<boolean> {
        return !this.useTokenStateCheck || await this.dbPreparedData.tokenStateAccessCheck(socket.authEngine);
    }

    /**
     * @description
     * This property is used for getting the configuration of this DataCollection.
     */
    public static readonly config: DataBoxConfig = {};

    /**
     * @description
     * Gets invokes when the zation system is creating instance of the DataCollection (in worker start).
     * @param smallBag
     */
    async initialize(smallBag: SmallBag): Promise<void> {
    }

    // noinspection JSMethodCanBeStatic
    /**
     * This method should be called in the getData method
     * whenever no more data is available for the client.
     */
    protected noMoreDataAvailable(){
        throw new NoMoreDataAvailableError();
    }

    // noinspection JSMethodCanBeStatic
    /**
     * This method can be used to build a raw key array.
     * These arrays are useful to present data in a sequence and as a key-value map.
     * To create a key array you need to have an array that contains objects,
     * and each object has the same property that indicates the key.
     * Later, when you use the DataBox,
     * you easily can access the items by the key.
     * If you did not use a key array, the only possibility to access the elements in an array is per index.
     * But this is problematical if every client has a different amount of elements because
     * then you not able to change one specific item.
     * (Because you would change  on each client a different item.)
     */
    protected buildKeyArray<T>(array : T[],key : keyof T) {
        return DbKeyArrayUtils.buildKeyArray(array,key);
    }

    abstract kickOut(socket : UpSocket) : void;
}

export interface DbPreparedData {
    versionAccessCheck : VersionSystemAccessCheckFunction,
    systemAccessCheck : VersionSystemAccessCheckFunction,
    tokenStateAccessCheck : TokenStateAccessCheckFunction,
}