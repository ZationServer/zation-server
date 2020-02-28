/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {prettyStringifyObject} from '../utils/prettyStringifyUtils';

export function formatArgs(args: any[]): string[] {
    const strings: string[] = [];
    const length = args.length;
    let value;
    for(let i = 0; i < length; i++) {
        value = args[i];
        if(typeof value === 'object') {
            if(Object.prototype.toString.call(value) === '[object Date]') {
                strings[i] = (value as Date).toJSON();
            }
            else {
                strings[i] = prettyStringifyObject(value);
            }
        }
        else {
            strings[i] = value.toString();
        }
    }
    return strings;
}