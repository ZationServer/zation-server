/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
class ValidationTypes
{
    //TYPES FOR VALIDATOR
    static readonly STRING           = 'string';
    static readonly ALL              = 'all';
    static readonly INT              = 'int';
    static readonly FLOAT            = 'float';
    static readonly DATE             = 'date';
    static readonly EMAIL            = 'email';
    static readonly BOOLEAN          = 'boolean';
    static readonly SHA512           = 'sha512';
    static readonly SHA256           = 'sha256';
    static readonly SHA384           = 'sha384';
    static readonly SHA1             = 'sha1';
    static readonly MD5              = 'md5';
    static readonly HEX_COLOR        = 'hexColor';
    static readonly HEXADECIMAL      = 'hexadecimal';
    static readonly IP_5             = 'ip5';
    static readonly IP_6             = 'ip6';
    static readonly ISBN_10          = 'isbn10';
    static readonly ISBN_13          = 'isbn13';
    static readonly JSON             = 'json';
    static readonly URL              = 'url';
    static readonly MIME_TYPE        = 'mimeType';
    static readonly MAC_ADDRESS      = 'macAddress';
    static readonly MOBILE_NUMBER    = 'mobileNumber';
    static readonly UUID_3           = 'uuid3';
    static readonly UUID_4           = 'uuid4';
    static readonly UUID_5           = 'uuid5';
    static readonly LAT_LONG         = 'latLong';
    static readonly BASE64           = 'base64';
    static readonly ASCII            = 'ascii';
    static readonly NUMBER           = 'number';
    static readonly USER_ID          = 'userId';

    //Not supported
    static readonly FILE             = 'file';
    //File Extensions
}

export = ValidationTypes;