/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {TypeConverterLibrary} from './typeConverterLibrary';

export default class TypeConverterCreator {
    static createConverter(strictType: boolean): (input: any, type: string | undefined) => any {
        const library = strictType ? TypeConverterLibrary.strict : TypeConverterLibrary.nonStrict;
        return (input, type) => {
            if(type !== undefined && library[type]) return library[type](input);
            return input;
        }
    }
}