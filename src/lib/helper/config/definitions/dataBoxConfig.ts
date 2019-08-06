/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {AuthAccessConfig, SystemAccessConfig, VersionAccessConfig} from "./configComponents";
import {DataBoxClass}                                              from "../../../api/dataBox/DataBox";
import {DataBoxFamilyClass}                                        from "../../../api/dataBox/DataBoxFamily";
import {InputConfig}                                               from "./inputConfig";

export interface DataBoxConfig extends VersionAccessConfig, SystemAccessConfig, AuthAccessConfig, InputConfig
{
    /**
     * This option can be activated when you have designed
     * this DataBox in such a way that the fetching of data
     * is independent of the previous fetch.
     * Then the system is able to fetch the data in
     * parallel that will increase the performance in some cases.
     * @default false
     */
    parallelFetch ?: boolean;

    /**
     * The maximal backpressure that a client can build up with by calling fetch data.
     * This option is unnecessary if the parallel fetch option is activated.
     * @default 30
     */
    maxBackpressure ?: number;
}

export type DataBoxClassDef = DataBoxClass | DataBoxFamilyClass