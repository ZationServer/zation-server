/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const stringifyObject  = require('stringify-object');

const options = {
    indent: '  '
};

export function prettyStringifyObject(obj: object): string {
    return stringifyObject(obj,options);
}