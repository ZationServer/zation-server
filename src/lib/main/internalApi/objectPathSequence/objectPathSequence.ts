/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export interface ObjectPathSequence {

    /**
     * @description
     * Sets a value.
     * @example
     * set('email','example@gmail.com');
     * @param path
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @param value
     */
    set(path: string | string[],value: any): ObjectPathSequence

    /**
     * @description
     * Deletes a value.
     * @example
     * delete('email');
     * @param path
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     */
    delete(path?: string | string[]): ObjectPathSequence

    /**
     * @description
     * Clears the object.
     * @example
     * clear();
     */
    clear(): ObjectPathSequence

    /**
     * @description
     * Returns if the sequence has uncommitted changes.
     */
    hasUncommittedChanges(): boolean

    /**
     * @description
     * Commit your changes.
     */
    commit(): Promise<void>

}