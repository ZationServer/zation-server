/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const Validator : any        = require('validator');

export default class EasyValidator
{
    static isString(data)
    {
        return typeof data === 'string';
    }

    static isChar(data)
    {
        return typeof data === 'string' && data.length === 1;
    }

    static isNull(data)
    {
        return data === null;
    }

    static isObject(data)
    {
        return data !== null && typeof data === 'object';
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
        if(typeof data !== 'string'){
            return false;
        }

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
        if(typeof data !== 'string'){
            return false;
        }

        const parse = parseFloat(data);
        return !isNaN(parse) && EasyValidator.isFloat(parse);
    }

    static isStringNumber(data)
    {
        if(typeof data !== 'string'){
            return false;
        }

        // @ts-ignore
        return !isNaN(data);
    }

    static isFloat(data)
    {
        return EasyValidator.isNumber(data) && data % 1 !== 0;
    }

    static isSha512(data)
    {
        return typeof data === 'string' && data.match(/^[a-fA-F0-9]{128}$/);
    }

    static isSha384(data)
    {
        return typeof data === 'string' && data.match(/^[a-fA-F0-9]{96}$/);
    }

    static isSha256(data)
    {
        return typeof data === 'string' && data.match(/^[a-fA-F0-9]{64}$/);
    }

    static isSha1(data)
    {
        return typeof data === 'string' && data.match(/^[a-fA-F0-9]{40}$/);
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
        if(typeof data !== 'string'){
            return false;
        }
        return data.match(/^[a-fA-F0-9]{32}$/);
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
        return typeof data === 'string' && data.match(/^[+]*[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/);
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

    static isLatLong(data)
    {
        return (typeof data === 'number' && data <= 90 && data >= -90) ||
            (typeof data === 'string' && data.match(/^[+]*[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/));
    }

    static isMongoId(data)
    {
        // noinspection JSUnresolvedFunction
        try {
            return Validator.isMongoId(data);
        }
        catch (e) {
            return false;
        }
    }

    static isBase64(data)
    {
        return EasyValidator.isString(data) && (new RegExp('^(data:\\w+\\/[a-zA-Z+\\-.]+;base64,)?(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\/]{3}=)?$', 'gi')).
        test(data);
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
        return EasyValidator.isString(data) && ['true', 'false', '1', '0'].indexOf(data) >= 0;
    }

    static isNumberBoolean(data)
    {
        return EasyValidator.isNumber(data) && data === 0 || data === 1;
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