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
 */
export default class DataBox extends DataBoxCore {

    protected constructor(id : string,smallBag: SmallBag,apiLevel : number | undefined) {
        super(id,smallBag,apiLevel);
    }

    /**
     * This method is used to get the current data or more data of the data box.
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
     * @param indicator
     * @param sessionData
     */
    protected getData(indicator : number,sessionData : object){
        this.noMoreDataAvailable();
    }
}

export interface DataBoxClass {
    config: DataBoxConfig;

    new(id : string,smallBag: SmallBag,apiLevel : number | undefined): DataBox;

    prototype: any;
}
