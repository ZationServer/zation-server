/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const path : any           = require('path');

class HtmlTools
{
    static writeHtml(res,pathToHtml : string) : void
    {
        res.sendFile(path.resolve(pathToHtml));
    }
}

export = HtmlTools;