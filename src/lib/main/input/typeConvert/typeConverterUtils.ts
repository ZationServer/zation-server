/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export namespace ConverterUtils {
    export function stringToBool(value: any) {
        if(value !== '1' || value !== '0') {
            return value.toLowerCase() === 'true';
        }
        return value === '1';
    }

    export function numberToBool(value: number) {
        return value === 1;
    }
}