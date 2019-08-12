/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const stringifyObject  = require('stringify-object');

const options = {
    indent: '  '
};

export default class StringifyUtils
{
    public static object(obj : any) : string {
        return stringifyObject(obj,options);
    }
}