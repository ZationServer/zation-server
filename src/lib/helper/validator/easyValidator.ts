/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Validator : any        = require('validator');

class EasyValidator
{
    static isString(data)
    {
        return typeof data === 'string';
    }

    static isObject(data)
    {
        return typeof data === 'object';
    }

    static isNumber(data)
    {
        return typeof data === 'number';
    }

    static isArray(data)
    {
        return Array.isArray(data);
    }

    // noinspection JSUnusedGlobalSymbols
    static isStringInt(data)
    {
        const isIntRegex = /^[-+]?[0-9]+$/;
        return isIntRegex.test(data);
    }

    static equals(p1,p2)
    {
        return p1 === p2;
    }

    // noinspection JSUnusedGlobalSymbols
    static isStringFloat(data)
    {
        return EasyValidator.isFloat(parseFloat(data));
    }

    static isStringNumber(data)
    {
        return !isNaN(data);
    }

    static isFloat(data)
    {
        return EasyValidator.isNumber(data) && data % 1 !== 0;
    }

    static isSha512(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isHash(data,'Sha512');
        }
        catch (e) {
            return false;
        }
    }

    static isSha384(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isHash(data,'Sha384');
        }
        catch (e) {
            return false;
        }
    }

    static isSha256(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isHash(data,'Sha256');
        }
        catch (e) {
            return false;
        }

    }

    static isSha1(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isHash(data,'Sha1');
        }
        catch (e) {
            return false;
        }
    }

    static isHexColor(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isHexColor(data);
        }
        catch (e) {
            return false;
        }
    }

    static isMd5(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isHash(data,'md5');
        }
        catch (e) {
            return false;
        }
    }

    static isJSON(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isJSON(data);
        }
        catch (e) {
            return false;
        }
    }

    static isHexadecimal(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isHexadecimal(data);
        }
        catch (e) {
            return false;
        }
    }

    static isIP4(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isIP(data,'4');
        }
        catch (e) {
            return false;
        }
    }

    static isIP6(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isIP(data,'6');
        }
        catch (e) {
            return false;
        }
    }

    static isISB10(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isISBN(data,'10');
        }
        catch (e) {
            return false;
        }
    }

    static isISB13(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isISBN(data,'13');
        }
        catch (e) {
            return false;
        }
    }

    static isUrl(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isURL(data);
        }
        catch (e) {
            return false;
        }
    }

    static isMimeType(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isMimeType(data);
        }
        catch (e) {
            return false;
        }
    }

    static isMACAddress(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isMACAddress(data);
        }
        catch (e) {
            return false;
        }
    }

    static isMobilePhone(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isMobilePhone(data);
        }
        catch (e) {
            return false;
        }
    }

    static isUUID3(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isUUID(data,'3');
        }
        catch (e) {
            return false;
        }
    }

    static isUUID4(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isUUID(data,'4');
        }
        catch (e) {
            return false;
        }
    }

    static isUUID5(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isUUID(data,'5');
        }
        catch (e) {
            return false;
        }
    }

    static isBase64(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isBase64(data);
        }
        catch (e) {
            return false;
        }
    }

    static isAscii(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isAscii(data);
        }
        catch (e) {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    static isStringBoolean(data)
    {
        // noinspection JSUnresolvedFunction
        if(EasyValidator.isString(data)) {
            return ['true', 'false', '1', '0'].indexOf(data) >= 0;
        }
        else{
            return false;
        }
    }

    static isNumberBoolean(data)
    {
        if(EasyValidator.isNumber(data)) {
            return data === 0 || data === 1;
        }
        else{
            return false;
        }
    }

    static isBoolean(data)
    {
        return typeof data === 'boolean';
    }

    static isUpperCase(data : string)
    {
        return data === data.toUpperCase();
    }

    static isLowerCase(data : string)
    {
        return data === data.toLowerCase();
    }

    static validEnum(enumValues,input)
    {
        let found = false;
        for(let i = 0; i < enumValues.length; i++) {
            if(enumValues[i] === input) {
                found = true;
                break;
            }
        }
        return found;
    }

    static missingContains(input : string,contain : any | any[]) : string[]{
        const missing : any[] = [];
        if (Array.isArray(contain)) {
            for(let i = 0; i < contain.length; i++) {
                if(input.indexOf(contain[i]) === -1){
                    missing.push(contain[i]);
                }
            }
        }
        else{
            if(input.indexOf(contain) === -1) {
                missing.push(contain);
            }
        }
        return missing;
    }

    static isDate(data)
    {
        return !isNaN(Date.parse(data));
    }

    static isEmail(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isEmail(data);
        }
        catch (e) {
            return false;
        }
    }
}

export = EasyValidator;