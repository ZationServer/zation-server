/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {StarterConfig} from "../definitions/starterConfig";
import {InternalMainConfig} from "../definitions/mainConfig";
import InternalData    from "../../constants/internalData";
import ConfigLocations from "./configLocations";
// noinspection TypeScriptPreferShortImport
import {StartMode}     from "../../constants/startMode";
import JwtSignOptions  from "../../constants/jwt";

export default interface ZcTransport {
    starterConfig : StarterConfig,
    mainConfig : InternalMainConfig,
    internalData : InternalData,
    rootPath : string,
    startMode : StartMode,
    configLocations : ConfigLocations,
    preLoadJwtSignOptions : JwtSignOptions
}