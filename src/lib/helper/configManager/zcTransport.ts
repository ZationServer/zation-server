/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {StarterConfig} from "../configDefinitions/starterConfig";
import {InternalMainConfig} from "../configDefinitions/mainConfig";
import InternalData    from "../constants/internalData";
import ConfigLocations from "./configLocations";
// noinspection TypeScriptPreferShortImport
import {StartMode}     from "../constants/startMode";
import JwtSignOptions  from "../constants/jwt";

export default interface ZcTransport {
    starterConfig : StarterConfig,
    mainConfig : InternalMainConfig,
    internalData : InternalData,
    rootPath : string,
    startMode : StartMode,
    configLocations : ConfigLocations,
    preLoadJwtOptions : JwtSignOptions
}