/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Validator       = require('validator');

class EasyValidator
{
    static isString(data)
    {
        return (typeof data === 'string' || data instanceof String);
    }

    static isInt(data)
    {
        let isIntRegex = /^[-+]?[0-9]+$/;
        return isIntRegex.test(data);
    }

    static equals(p1,p2)
    {
        return p1 === p2;
    }

    static isFloat(data)
    {
        let isFloatRegex = /^(?:[-+])?(?:[0-9]+)?(?:\.[0-9]*)?(?:[eE][+-]?(?:[0-9]+))?$/;
        return isFloatRegex.test(data);
    }

    static isSha512(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHash(data,'Sha512');
    }

    static isSha384(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHash(data,'Sha384');
    }

    static isSha256(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHash(data,'Sha256');
    }

    static isSha1(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHash(data,'Sha1');
    }

    static isHexColor(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHexColor(data);
    }

    static isMd5(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHash(data,'md5');
    }

    static isJSON(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isJSON(data);
    }

    static isHexadecimal(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isHexadecimal(data);
    }

    static isIP5(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isIP(data,'4');
    }

    static isIP6(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isIP(data,'6');
    }

    static isISB10(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isISBN(data,'10');
    }

    static isISB13(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isISBN(data,'13');
    }

    static isUrl(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isURL(data);
    }

    static isMimeType(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isMimeType(data);
    }

    static isMACAddress(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isMACAddress(data);
    }

    static isMobilePhone(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isMobilePhone(data);
    }

    static isUUID3(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isUUID(data,'3');
    }

    static isUUID4(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isUUID(data,'4');
    }

    static isUUID5(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isUUID(data,'5');
    }

    static isBase64(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isBase64(data);
    }

    static isLatLong(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isLatLong(data);
    }

    static isAscii(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isAscii(data);
    }

    static isBoolean(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isBoolean(data);
    }

    static isUpperCase(data)
    {
        if (typeof data === 'string' || data instanceof String)
        {
            return data.toUpperCase() === data;
        }
        else
        {
            return false;
        }
    }

    static validEnum(v,input)
    {
        let found = false;
        for(let i = 0; i < v.length; i++)
        {
            if(v[i] === input)
            {
                found = true;
                break;
            }
        }
        return found;
    }

    static isLowerCase(data)
    {
        if (typeof data === 'string' || data instanceof String)
        {
            return data.toLowerCase() === data;
        }
        else
        {
            return false;
        }
    }

    static isDate(date)
    {
        if(EasyValidator.isString(date))
        {
            // noinspection JSUnresolvedFunction
            date = Date.parse(date);
            return !isNaN(date) ? new Date(date) : null;
        }
        return null;
    }

    static stringToBool(data)
    {
        let result = false;
        if(data !== '1' || data !== '0' )
        {
            result = data.toUpperCase() === 'true'
        }
        else
        {
            result = data === '1';
        }
        return result;
    }

    static isEmail(data)
    {
        // noinspection JSUnresolvedFunction
        return Validator.isEmail(data);
    }
}

module.exports = EasyValidator;