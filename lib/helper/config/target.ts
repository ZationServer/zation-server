/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class Target
{
    constructor(mainTarget = '',pathName = 'InputPath',splitSign = '.',extraInfo,path)
    {
        this._splitSign = splitSign;
        this._mainTarget = mainTarget;
        this._pathName = pathName;
        this._extraInfo = extraInfo;
        this._path = path;
    }

    _clone()
    {
        return new Target(this._mainTarget,this._pathName,this._splitSign,this._extraInfo,this._path);
    }

    getLastPath()
    {
        let ar = this._path.split(this._splitSign);
        return ar[ar.length-1];
    }

    addPath(path)
    {
        let clone = this._clone();
        clone._addPath(path);
        return clone;
    }

    setExtraInfo(info)
    {
        let clone = this._clone();
        clone._setExtraInfo(info);
        return clone;
    }

    _addPath(path)
    {
        if(this._path === undefined)
        {
            this._path = path;
        }
        else
        {
            this._path = `${this._path}${this._splitSign}${path}`;
        }
    }

    _setExtraInfo(info)
    {
        this._extraInfo = info;
    }

    getTarget()
    {
        let extraInfo = this._extraInfo !== undefined ? `(${this._extraInfo}) ` : '';

        if(this._path === undefined)
        {
            if(this._mainTarget !== '')
            {
                return `${this._mainTarget} ${extraInfo}->`;
            }
            else
            {
                return '';
            }
        }
        else
        {
            return `${this._mainTarget}, ${this._pathName}: '${this._path}' ${extraInfo}->`;
        }
    }


}

module.exports = Target;