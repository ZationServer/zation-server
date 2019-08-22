/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ValidationType}  from "../constants/validationType";
import {byteLength}      from "byte-length";
import Base64Utils       from "./base64Utils";

export default class ByteUtils
{
    static getByteSize(value : string,type : string | undefined) : number {
         return type === ValidationType.BASE64 ? Base64Utils.getByteSize(value) : byteLength(value);
    }
}