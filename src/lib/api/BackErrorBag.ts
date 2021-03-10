/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackError, {DryBackError} from './BackError';

export default class BackErrorBag
{
    private backErrors: BackError[];

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Creates a BackErrorBag.
     * With this bag, you can collect BackErrors and throw them all together.
     * The client will receive all errors in one package.
     * @example
     * new BackErrorBag(myError,myError2).throw();
     * @param backErrors
     */
    constructor(...backErrors: BackError[]) {
        this.backErrors = backErrors;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns all BackErrors of the bag.
     */
    getBackErrors(): BackError[] {
        return this.backErrors;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Adds all BackErrors of a BackErrorBags to this bag.
     * @param backErrorBags
     */
    addFromBackErrorBag(...backErrorBags: BackErrorBag[]): void {
        for(let j = 0; j < backErrorBags.length; j++) {
            this.add(...backErrorBags[j].getBackErrors());
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @internal
     * @description
     * This method is used internally.
     * @param withDesc
     */
    _dehydrate(withDesc: boolean): DryBackError[] {
        const obj: DryBackError[] = [];
        for(let i = 0; i < this.backErrors.length; i++) {
            obj.push(this.backErrors[i]._dehydrate(withDesc));
        }
        return obj;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Adds BackErrors to this bag.
     * @param backErrors
     */
    add(...backErrors: BackError[]): void {
        this.backErrors.push(...backErrors);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Empty the bag by removing all BackErrors.
     */
    empty(): void {
        this.backErrors = [];
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Throw this bag if it has at least one BackError.
     */
    throwIfHasError(): void {
        if(this.isNotEmpty()) throw this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Throw this bag no matter if it's empty or not
     */
    throw(): void {
        throw this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the count of BackErrors.
     */
    get count(): number {
        return this.backErrors.length;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if this bag is not empty.
     * It means that the bag has at least one BackError.
     */
    isNotEmpty(): boolean {
        return this.backErrors.length > 0;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the BackErrorBag is empty.
     */
    isEmpty(): boolean {
        return this.backErrors.length === 0;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the complete information as a string.
     */
    toString(): string {
        let text = `BackErrorBag -> ${this.backErrors.length} BackErrors ->\n`;
        for(let i = 0; i < this.backErrors.length; i++)
        {
            text += `     ${i}: ${this.backErrors[i]} \n`;
        }
        return text;
    }

}