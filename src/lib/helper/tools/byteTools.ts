/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ValidationTypes} from "../constants/validationTypes";
import {byteLength}      from "byte-length";
import Base64Tools       from "./base64Tools";

export default class ByteTools
{
    static getByteSize(value : string,type : string) : number {
         return type === ValidationTypes.BASE64 ? Base64Tools.getByteSize(value) : byteLength(value);
    }
}