/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export type ApiLevelSwitch<T> = Record<number,T>;

export type ApiLevelSwitchFunction<T> = (apiLevel : number) => T | undefined;

export default class ApiLevelUtils
{
    /**
     * Checks if the API level is compatible with the required API level.
     * @param apiLevel
     * @param reqApiLevel
     */
    static apiLevelIsCompatible(apiLevel : number, reqApiLevel : number) : boolean {
        return apiLevel >= reqApiLevel;
    }

    /**
     * Build a closure for selecting the API level.
     * The closure will return the correct mapped value with the best compatible API level.
     * If there is no compatible API level, the closure returns undefined.
     * Notice if you always have a 1 in the mapped values as an API level the closure will always return a value.
     * @param apiLevelSwitch
     */
    static createApiLevelSwitcher<T>(apiLevelSwitch : ApiLevelSwitch<T>) : ApiLevelSwitchFunction<T> {

        const optionsLevels =
            Object.keys(apiLevelSwitch)
                .map((item) => {return parseInt(item)})
                .sort((a,b) => b - a);

        return (apiLevel) => {
            for(let i = 0; i < optionsLevels.length; i++){
                if(ApiLevelUtils.apiLevelIsCompatible(apiLevel,optionsLevels[i])){
                    return apiLevelSwitch[i];
                }
            }
            return undefined;
        }
    }
}