/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class Converter
{
    static stringToBool(data)
    {
        let result = false;
        if(data !== '1' || data !== '0' ) {
            result = data.toLowerCase() === 'true';
        }
        else {
            result = data === '1';
        }
        return result;
    }

    static numberToBool(data) {
        return data === 1;
    }
}