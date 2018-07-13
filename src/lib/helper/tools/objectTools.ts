/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */


class ObjectTools
{
    static addObToOb(mainOb : object,addOb : object,overwrite : boolean = false) : void
    {
        for(let key in addOb)
        {
            if(addOb.hasOwnProperty(key))
            {
                if(overwrite || !mainOb.hasOwnProperty(key))
                {
                    mainOb[key] = addOb[key];
                }
            }
        }
    }

    static onlyAddObToOb(mainOb : object,addOb : object,overwrite : boolean = false, onlyAddKeys : object) : void
    {
        for(let key in addOb)
        {
            if(addOb.hasOwnProperty(key))
            {
                if(onlyAddKeys.hasOwnProperty(key) && (overwrite || !mainOb.hasOwnProperty(key)))
                {
                    mainOb[key] = addOb[key];
                }
            }
        }
    }

    static getObjValues(obj : object) : any[]
    {
        let values : any[] = [];
        for(let k in obj)
        {
            if(obj.hasOwnProperty(k))
            {
                values.push(obj[k]);
            }
        }
        return values;
    }

    static hasOneOf(obj : object,keys : any[]) : boolean
    {
        for(let i = 0; i < keys.length; i++)
        {
            if(obj.hasOwnProperty(keys[i]))
            {
                return true;
            }
        }
        return false;
    }

    static getFoundKeys(obj : object,keys : any[]) : any[]
    {
        let found : any[] = [];

        for(let i = 0; i < keys.length; i++)
        {
            if(obj.hasOwnProperty(keys[i]))
            {
                found.push(keys[i]);
            }
        }
        return found;
    }

    static objectSize(obj : object) : number
    {
        let size = 0;
        for(let k in obj)
        {
            if(obj.hasOwnProperty(k))
            {
                size++;
            }
        }
        return size;
    }
}

export = ObjectTools;