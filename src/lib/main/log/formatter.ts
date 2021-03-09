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
                strings.push((value as Date).toJSON());
            }
            else if(value instanceof Error && value.stack !== undefined) {
                if(strings.length > 0) {
                    const lastItem = strings.length -1;
                    strings[lastItem] = `${strings[lastItem]} ${value.stack}`;
                }
                else {
                    strings.push(value.stack);
                }
            }
            else {
                strings.push(prettyStringifyObject(value));
            }
        }
        else {
            strings.push(String(value));
        }
    }
    return strings;
}