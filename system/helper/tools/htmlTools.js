const path           = require('path');

class HtmlTool
{
    static writeHtml(res,pathToHtml,endRes = true)
    {
        res.sendFile(path.resolve(pathToHtml));
        if(endRes)
        {
            res.end();
        }
    }
}

module.exports = HtmlTool;