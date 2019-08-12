/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export default class RequireUtils
{
    public static safeRequire(path : string,defaultValue : any = {}) : any {
        try {
            return require(path)
        }
        catch (e) {
            return defaultValue;
        }
    }
}