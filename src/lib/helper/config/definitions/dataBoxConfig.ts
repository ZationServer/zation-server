/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {AuthAccessConfig, SystemAccessConfig, VersionAccessConfig} from "./configComponents";
import {DataBoxClass}   from "../../../api/dataBox/DataBox";
import {DataIdBoxClass} from "../../../api/dataBox/DataIdBox";

export interface DataBoxConfig extends VersionAccessConfig, SystemAccessConfig, AuthAccessConfig
{
}

export type DataBoxClassDef = DataBoxClass | DataIdBoxClass