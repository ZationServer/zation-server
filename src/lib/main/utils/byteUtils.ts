/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ValidationTypeRecord} from '../models/validator/validationType';
import {byteLength}           from "byte-length";
import Base64Utils            from "./base64Utils";

export default class ByteUtils
{
    static getByteSize(value: string,type: string | undefined): number {
         return type === nameof<ValidationTypeRecord>(s => s.base64) ? Base64Utils.getByteSize(value): byteLength(value);
    }
}