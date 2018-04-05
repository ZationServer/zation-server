/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const path           = require('path');

class HtmlTool
{
    static writeHtml(res,pathToHtml)
    {
        res.sendFile(path.resolve(pathToHtml));
    }
}

module.exports = HtmlTool;