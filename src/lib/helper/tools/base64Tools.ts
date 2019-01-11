/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class Base64Tools
{
    static getByteSize(base64 : string) : number
    {
        return (
            (4*Math.ceil(base64.replace(/^data:image\/\w+;base64,/, "").length/3)) -
            (base64.endsWith("==") ? 2 : (base64.endsWith('=') ? 1 : 0))
        );
    }

    public static getContentType(base64 : string) : null | string
    {
        let result : null | string = null;

        if (typeof base64 !== 'string') {
            return result;
        }

        let contentType = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

        if(contentType && contentType.length){
            result = contentType[1]
        }

        return result;
    }

    public static getContentInfo(base64 : string) : null | {subType : string, mimeType : string}
    {
        let res : null | {subType : string, mimeType : string} = null;
        const contentType = Base64Tools.getContentType(base64);
        if(contentType) {
            let tmpSplit = contentType.split('/');
            res = {
                mimeType : tmpSplit[0],
                subType : tmpSplit[1]
            }
        }
        return res;
    }

    public static getMimeType(base64 : string) : null | string
    {
        let res : null | string = null;
        const contentType = Base64Tools.getContentType(base64);
        if(contentType) {
            res = contentType.split('/')[0];
        }
        return res;
    }

    public static getSubType(base64 : string) : null | string
    {
        let res : null | string = null;
        const contentType = Base64Tools.getContentType(base64);
        if(contentType) {
            res = contentType.split('/')[1];
        }
        return res;
    }
}

export = Base64Tools;