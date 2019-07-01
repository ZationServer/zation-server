/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {DataBoxConfig}        from "../../helper/config/definitions/dataBoxConfig";
import SmallBag               from "./../SmallBag";
import DataBoxCore            from "./DataBoxCore";

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
 *
 * The Data ID box gives you the possibility to define a
 * family of DataBoxes that only differ by an id.
 * That is useful in a lot of cases, for example,
 * if you want to have a dataBox family for user profiles.
 * Than the DataBoxes only differ by the ids of the users.
 */
export default class DataIdBox extends DataBoxCore {

    protected constructor(id : string,smallBag: SmallBag,apiLevel : number | undefined) {
        super(id,smallBag,apiLevel);
    }

    /**
     * **Can be overridden.**
     * This method is used to get the current data or more data of the DataBox.
     * You usually request your database and return the data, and if no more data is available,
     * you should throw a NoMoreDataAvailableError or call the internal noMoreDataAvailable method.
     * A client can call that method multiple times.
     * That's why the indicator parameter indicates the number of the current call.
     * Also, you extra get a session object, this object you can use to save variables that are
     * important to get more data in the future, for example, the last id of the item that the client had received.
     * The data what you are returning can be of any type.
     * But if you want to return more complex data,
     * it is recommended that the information consists of key-value able components
     * so that you can identify each value with a key path.
     * That can be done by using an object, a key-array, or a regular array which contains objects
     * (Than the property 'key' of the object will be used).
     * @param id
     * @param indicator
     * @param sessionData
     */
    protected getData(id : string,indicator : number,sessionData : object){
        this.noMoreDataAvailable();
    }


    // noinspection JSUnusedGlobalSymbols
    /**
     * **Can be overridden.**
     * Check if the id is valid for this DataBox.
     * To block the id, you only need to return an object (that can be error information) or false.
     * If you want to allow the id, you have to return nothing or a true.
     * @param id
     * @param smallBag
     */
    public isIdValid(id : string,smallBag : SmallBag) : Promise<boolean | Record<string,any> | void> | boolean | Record<string,any> | void {
    }

    /**
     * **Not override this method.**
     * The close function will close the DataBox with the id for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param id
     * @param code
     * @param data
     */
    close(id : string,code : number,data : any){
    }

    /**
     * **Not override this method.**
     * The reload function will force all clients of the DataBox to reload the data.
     * This method is used internally if it was detected that a worker had
     * missed a cud (create, update, or delete) operation.
     * @param id
     * @param forEveryServer
     */
    doReload(id : string,forEveryServer : boolean = false){
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an insert into the DataBox.
     * Can be used to insert the data in the database.
     * @param id
     * @param keyPath
     * @param value
     */
    protected async beforeInsert(id : string,keyPath : string[],value : any) {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an update of data in the DataBox.
     * Can be used to update the data in the database.
     * @param id
     * @param keyPath
     * @param value
     */
    protected async beforeUpdate(id : string,keyPath : string[],value : any) {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before a delete of data in the DataBox.
     * Can be used to delete the data in the database.
     * @param id
     * @param keyPath
     */
    protected async beforeDelete(id : string,keyPath : string[]) {
    }
}

export interface DataIdBoxClass {
    config: DataBoxConfig;

    new(id : string,smallBag: SmallBag,apiLevel : number | undefined): DataIdBox;

    prototype: any;
}
