/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export type OriginChecker = (hostname ?: string,protocol ?: string,port ?: string) => boolean;

export default class OriginsUtils
{
    /**
     * Create a closure to check origin and process origins.
     * @param validOrigins
     */
    static createOriginChecker(validOrigins : string[] | string | null) : OriginChecker
    {
        let origins : string[];
        if(validOrigins !== null){
            origins = Array.isArray(validOrigins) ? validOrigins : [validOrigins];
        }
        else {
            return () => true;
        }

        for(let i = 0; i < origins.length; i++) {
            if(origins[i] ===  '*:*') {
                return () => true;
            }
            if(origins[i].indexOf(':') === -1){
                origins[i] = origins[i] + ':*';
            }
        }

        return (hostname,protocol,port) => {
            port = port || (protocol === 'https:' ? '443' : '80');
            let isOk : boolean = false;
            for(let i = 0; i < origins.length; i++) {
                try {
                    // @ts-ignore
                    isOk = ~origins[i].indexOf(hostname + ':' + port) ||
                        ~origins[i].indexOf(hostname + ':*') ||
                        ~origins[i].indexOf('*:' + port);
                    if(isOk){break;}
                } catch (e) {}
            }
            return isOk;
        }
    }
}

