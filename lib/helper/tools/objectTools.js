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

}

module.exports = ObjectTools;