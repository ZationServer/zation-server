/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export interface ObjectPathSequence {

    /**
     * @description
     * Set a value.
     * @example
     * set('email','example@gmail.com');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     */
    set(path: string | string[],value: any): ObjectPathSequence

    /**
     * @description
     * Delete a value.
     * @example
     * delete('email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    delete(path?: string | string[]): ObjectPathSequence

    /**
     * @description
     * Commit your changes.
     */
    commit(): Promise<void>

}