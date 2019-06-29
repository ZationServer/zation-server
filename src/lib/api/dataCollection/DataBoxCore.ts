/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {DataBoxConfig}           from "../../helper/config/definitions/dataBoxConfig";
import SmallBag                  from "./../SmallBag";
import NoMoreDataAvailableError  from "../../helper/dataBox/noMoreDataAvailable";

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
     * The API level of the DataCollection from the app config.
     * It can be undefined if no API level is defined.
     */
    protected readonly apiLevel: number | undefined;

    protected constructor(id : string,smallBag: SmallBag,apiLevel : number | undefined) {
        this.id = id;
        this.apiLevel = apiLevel;
        this.smallBag = smallBag;
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
}
