/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackErrorConstruct   from "../main/constants/backErrorConstruct";
import BackError, {DryBackError} from './BackError';

export default class BackErrorBag
{
    private backErrors: BackError[];

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Creates an BackErrorBag.
     * Here you can collect BackErrors
     * and throw them later all together.
     * Then all errors are sent to the client.
     * @example
     * new BackErrorBag(myError,myError2).throw();
     * @param backError
     */
    constructor(...backError: BackError[])
    {
        this.backErrors = backError;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Adds a new BackError to the bag.
     * By using the constructor of the BackError class.
     * @example
     * addNewBackError({name: 'valueNotMatchesWithMinLength'},{minLength: 5, inputLength: 3});
     * @param backErrorConstruct
     * Create a new BackError construct.
     * @param info
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an valueNotMatchesWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    addNewBackError(backErrorConstruct: BackErrorConstruct = {}, info?: object | string): void
    {
        this.addBackError(new BackError(backErrorConstruct,info));
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns all BackErrors from the bag as an BackError array.
     */
    getBackErrors(): BackError[]
    {
        return this.backErrors;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Add all BackErrors of an other BackErrorBag to this bag.
     * @param backErrorBag
     */
    addFromBackErrorBag(...backErrorBag: BackErrorBag[]): void
    {
        for(let j = 0;  j < backErrorBag.length; j++) {
            this.addBackError(...backErrorBag[j].getBackErrors());
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @internal
     * @description
     * This method is used internal!
     * @param withDesc
     */
    _dehydrate(withDesc: boolean): DryBackError[]
    {
        const obj: DryBackError[] = [];
        for(let i = 0; i < this.backErrors.length; i++) {
            obj.push(this.backErrors[i]._dehydrate(withDesc));
        }
        return obj;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Add BackError/s to this bag.
     * @param backError
     */
    addBackError(...backError: BackError[]): void
    {
        this.backErrors.push(...backError);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Empty the bag.
     * So all BackErrors in this bag will be removed.
     */
    emptyBag(): void
    {
        this.backErrors = [];
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Throw this bag if it has at least one BackError.
     */
    throwIfHasError(): void
    {
        if(this.isNotEmpty()) {
            throw this;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Throw this bag.
     * Does not matter if the bag is empty or not.
     */
    throw(): void
    {
        throw this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the count of BackErrors there are in the bag.
     */
    getBackErrorCount(): number
    {
        return this.backErrors.length;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the BackErrorBag is not empty.
     * It means that the bag hast at least one BackError.
     */
    isNotEmpty(): boolean
    {
        return this.backErrors.length > 0;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the BackErrorBag is empty.
     */
    isEmpty(): boolean
    {
        return this.backErrors.length === 0;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the complete information as a string.
     */
    toString(): string
    {
        let text = `BackErrorBag-> ${this.backErrors.length} BackErrors  ->\n`;
        for(let i = 0; i < this.backErrors.length; i++)
        {
            text += `     ${i}: ${this.backErrors[i]} \n`;
        }
        return text;
    }

}

