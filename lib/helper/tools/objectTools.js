/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */


class ObjectTools
{
    static addObToOb(mainOb,addOb,overwrite = false)
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

    static getObjValues(obj)
    {
        let values = [];
        for(let k in obj)
        {
            if(obj.hasOwnProperty(k))
            {
                values.push(obj[k]);
            }
        }
        return values;
    }

    static hasOneOf(obj,keys)
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

    static getFoundKeys(obj,keys)
    {
        let found = [];

        for(let i = 0; i < keys.length; i++)
        {
            if(obj.hasOwnProperty(keys[i]))
            {
                found.push(keys[i]);
            }
        }
        return found;
    }

}

module.exports = ObjectTools;