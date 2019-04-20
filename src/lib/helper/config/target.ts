/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class Target
{
    private readonly splitSign : string;
    private readonly mainTarget : string;
    private readonly pathName : string;
    private extraInfo : string | undefined;
    private path : string | undefined;

    constructor(mainTarget : string = '',pathName : string = 'InputPath',splitSign : string = '.',extraInfo ?: string,path ?: string)
    {
        this.splitSign = splitSign;
        this.mainTarget = mainTarget;
        this.pathName = pathName;
        this.extraInfo = extraInfo;
        this.path = path;
    }

    private clone() : Target
    {
        return new Target(this.mainTarget,this.pathName,this.splitSign,this.extraInfo,this.path);
    }

    getMainTarget() : string
    {
        return this.mainTarget;
    }

    getLastPath() : string | undefined
    {
        if(this.path !== undefined)
        {
            let ar = this.path.split(this.splitSign);
            return ar[ar.length-1];
        }
        else
        {
            return undefined;
        }
    }

    addPath(path : string) : Target
    {
        let clone = this.clone();
        clone._addPath(path);
        return clone;
    }

    setExtraInfo(info : string) : Target
    {
        let clone = this.clone();
        clone._setExtraInfo(info);
        return clone;
    }

    private _addPath(path : string)
    {
        if(this.path === undefined)
        {
            this.path = path;
        }
        else
        {
            this.path = `${this.path}${this.splitSign}${path}`;
        }
    }

    private _setExtraInfo(info : string)
    {
        this.extraInfo = info;
    }

    getTarget() : string
    {
        const extraInfo = this.extraInfo !== undefined ? `(${this.extraInfo}) ` : '';

        if(this.path === undefined)
        {
            if(this.mainTarget !== '') {
                return `${this.mainTarget} ${extraInfo}->`;
            }
            else {
                return '';
            }
        }
        else
        {
            return `${this.mainTarget}, ${this.pathName}: '${this.path}' ${extraInfo}->`;
        }
    }
}