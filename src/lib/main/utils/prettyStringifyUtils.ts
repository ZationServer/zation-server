/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const stringifyObject  = require('stringify-object');

const options = {
    indent: '  '
};

export default class PrettyStringifyUtils
{
    public static object(obj: any): string {
        return stringifyObject(obj,options);
    }
}