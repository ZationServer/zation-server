/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const Validator: any        = require('validator');

export namespace ValidatorUtils {
    export const isObject = (data: any) => typeof data === 'object' && data;
    export const isArray = (data: any) => Array.isArray(data);
    export const isString = (data: any) => typeof data === 'string';
    export const isChar = (data: any) => typeof data === 'string' && data.length === 1;
    export const isNull = (data: any) => data === null;
    export const isInteger = (data: any) => Number.isInteger(data);
    export const isStringInteger = (() => {
        const stringIntRegex = /^[-+]?[0-9]+$/;
        return (data: any) => typeof data === 'string' && stringIntRegex.test(data)
    })();
    export const isFloat = (data: any) => typeof data === 'number' && data % 1 !== 0;
    export const isStringFloat = (data: any) => {
        if(typeof data !== 'string') return false;
        const parse = parseFloat(data);
        return !isNaN(parse) && isFloat(parse);
    }
    export const isNumber = (data: any) => typeof data === 'number';
    export const isStringNumber = (data: any) => typeof data === 'string' && !isNaN(data as any);
    export const isDate = (data: any) => !isNaN(Date.parse(data));
    export const isEmail = (data: any) => {
        try {return Validator.isEmail(data);}
        catch (_) {return false;}
    };
    export const isBoolean = (data: any) => typeof data === 'boolean';
    export const isStringBoolean = (() => {
        const boolStrEnum = ['true', 'false', '1', '0'];
        return (data: any) => typeof data === 'string' && boolStrEnum.indexOf(data) >= 0;
    })();
    export const isNumberBoolean = (data: any) => typeof data === 'number' && data === 0 || data === 1;
    export const isSha512 = (() => {
        const regex = /^[a-fA-F0-9]{128}$/;
        return (data: any) => typeof data === 'string' && regex.test(data);
    })();
    export const isSha384 = (() => {
        const regex = /^[a-fA-F0-9]{96}$/;
        return (data: any) => typeof data === 'string' && regex.test(data);
    })();
    export const isSha256 = (() => {
        const regex = /^[a-fA-F0-9]{64}$/;
        return (data: any) => typeof data === 'string' && regex.test(data);
    })();
    export const isSha1 = (() => {
        const regex = /^[a-fA-F0-9]{40}$/;
        return (data: any) => typeof data === 'string' && regex.test(data);
    })();
    export const isMd5 = (() => {
        const regex = /^[a-fA-F0-9]{32}$/;
        return (data: any) => typeof data === 'string' && regex.test(data);
    })();
    export const isHexColor = (data: any) => {
        try {return Validator.isHexColor(data);}
        catch (_) {return false;}
    };
    export const isHexadecimal = (data: any) => {
        try {return Validator.isHexadecimal(data);}
        catch (_) {return false;}
    };
    export const isIP4 = (data: any) => {
        try {return Validator.isIP(data,'4');}
        catch (_) {return false;}
    };
    export const isIP6 = (data: any) => {
        try {return Validator.isIP(data,'6');}
        catch (_) {return false;}
    };
    export const isISBN10 = (data: any) => {
        try {return Validator.isISBN(data,'10');}
        catch (_) {return false;}
    };
    export const isISBN13 = (data: any) => {
        try {return Validator.isISBN(data,'13');}
        catch (_) {return false;}
    };
    export const isJSON = (data: any) => {
        try {return Validator.isJSON(data);}
        catch (_) {return false;}
    };
    export const isURL = (data: any) => {
        try {return Validator.isURL(data);}
        catch (_) {return false;}
    };
    export const isMimeType = (data: any) => {
        try {return Validator.isMimeType(data);}
        catch (_) {return false;}
    };
    export const isMACAddress = (data: any) => {
        try {return Validator.isMACAddress(data);}
        catch (_) {return false;}
    };
    export const isMobileNumber = (() => {
        const regex = /^[+]*[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/;
        return (data: any) => typeof data === 'string' && regex.test(data);
    })();
    export const isUUID3 = (data: any) => {
        try {return Validator.isUUID(data,'3');}
        catch (_) {return false;}
    };
    export const isUUID4 = (data: any) => {
        try {return Validator.isUUID(data,'4');}
        catch (_) {return false;}
    };
    export const isUUID5 = (data: any) => {
        try {return Validator.isUUID(data,'5');}
        catch (_) {return false;}
    };
    export const isBase64 = (() => {
        const regex = new RegExp('^(data:\\w+\\/[a-zA-Z+\\-.]+;base64,)?(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\/]{3}=)?$', 'gi');
        return (data: any) => typeof data === 'string' && regex.test(data);
    })();
    export const isAscii = (data: any) => {
        try {return Validator.isAscii(data);}
        catch (_) {return false;}
    };
    export const isUserId = (data: any) => typeof data === 'string' || typeof data === 'number';
    export const isMongoId = (data: any) => {
        try {return Validator.isMongoId(data);}
        catch (_) {return false;}
    };
    export const isLatLong = (data: any) => typeof data === 'number' && data <= 90 && data >= -90;

    export function createInChecker(values: any[]): (value) => boolean {
        const length = values.length;
        return (value) => {
            for(let i = 0; i < length; i++) if(values[i] === value) return true;
            return false;
        }
    }

    export function createContainsChecker(contains: any | any[]): (value: string) => boolean {
        if(Array.isArray(contains)) {
            const length = contains.length;
            return (value) => {
                for(let i = 0; i < length; i++) if(value.indexOf(contains[i]) === -1) return false;
                return true;
            }
        }
        else {
            return (value) => value.indexOf(value) !== -1;
        }
    }
}