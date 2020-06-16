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
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     * @param value
     */
    set(path: string | string[],value: any): ObjectPathSequence

    /**
     * @description
     * Delete a value.
     * @example
     * delete('email');
     * @param path
     * The path to the property can be a string array or a string.
     * In case of a string, the keys are split with dots.
     */
    delete(path?: string | string[]): ObjectPathSequence

    /**
     * @description
     * Commit your changes.
     */
    commit(): Promise<void>

}