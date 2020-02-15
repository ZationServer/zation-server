/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

/**
 * Simple internally used error bag.
 */
export default class ErrorBag<T extends Error = Error>
{
    private readonly errors : T[] = [];

    toString() : string
    {
        let output : string = '';
        for(let i = 0; i < this.errors.length; i++) {
            output += this.errors[i].toString();
        }
        return output;
    }

    addError(error: T) : void {
        this.errors.push(error);
    }

    getErrors() : T[] {
        return this.errors;
    }

    hasError() : boolean {
        return this.errors.length !== 0;
    }
}