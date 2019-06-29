/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {AuthAccessConfig, SystemAccessConfig, VersionAccessConfig} from "./configComponents";
import {DataBoxClass}   from "../../../api/dataCollection/DataBox";
import {DataIdBoxClass} from "../../../api/dataCollection/DataIdBox";

export interface DataBoxConfig extends VersionAccessConfig, SystemAccessConfig, AuthAccessConfig
{
}

export type DataBoxClassDef = DataBoxClass | DataIdBoxClass