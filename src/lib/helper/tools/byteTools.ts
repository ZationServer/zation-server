/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ValidationTypes} from "../constants/validationTypes";
import Base64Tools     = require("./base64Tools");
import {byteLength}      from "byte-length";

class ByteTools
{
    static getByteSize(value : string,type : string) : number {
         return type === ValidationTypes.BASE64 ? Base64Tools.getByteSize(value) : byteLength(value);
    }
}

export = ByteTools;