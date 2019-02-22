/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class OriginsEngine
{
    private readonly origins : string[];
    private alwaysOk : boolean = false;

    constructor(validOrigins : string[] | string | null) {
        if(validOrigins !== null){
            if (Array.isArray(validOrigins)) {
                this.origins = validOrigins;
            }
            else{
                this.origins = [validOrigins];
            }
            this.prepare();
        }
        else {
            this.alwaysOk = true;
        }
    }

    private prepare()
    {
        for(let i = 0; i < this.origins.length; i++) {
            if(this.origins[i] ===  '*:*') {
                this.alwaysOk = true;
                break;
            }
            if(this.origins[i].indexOf(':') === -1){
                this.origins[i] = this.origins[i] + ':*';
            }
        }
    }

    check(hostname : string,protocol ?: string,port ?: string) : boolean
    {
        if(this.alwaysOk){return true;}
        port = port || (protocol === 'https:' ? '443' : '80');
        let isOk : boolean = false;
        for(let i = 0; i < this.origins.length; i++) {
            try {
                // @ts-ignore
                isOk = ~this.origins[i].indexOf(hostname + ':' + port) ||
                    ~this.origins[i].indexOf(hostname + ':*') ||
                    ~this.origins[i].indexOf('*:' + port);
                if(isOk){break;}
            } catch (e) {}
        }
        return isOk;
    }
}

