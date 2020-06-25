/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {StarterConfig}       from "../definitions/main/starterConfig";
import {InternalMainConfig}  from "../definitions/main/mainConfig";
import InternalData          from "../../definitions/internalData";
import ConfigLocations       from "./configLocations";
// noinspection TypeScriptPreferShortImport
import {StartMode}           from "../../../core/startMode";
import {JwtSignOptions}      from "../../definitions/jwt";

export default interface ZcTransport {
    starterConfig: StarterConfig,
    mainConfig: InternalMainConfig,
    internalData: InternalData,
    rootPath: string,
    startMode: StartMode,
    configLocations: ConfigLocations,
    preLoadJwtSignOptions: JwtSignOptions
}