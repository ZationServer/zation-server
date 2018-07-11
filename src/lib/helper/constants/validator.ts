/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class KEYS
{
    static readonly TYPE                  = 'type';

    //VALIDATOR FUNCTIONS
    static readonly FUNCTION_ENUM                 = 'enum';
    static readonly FUNCTION_PRIVATE_ENUM         = 'privateEnum';
    static readonly FUNCTION_MIN_LENGTH           = 'minLength';
    static readonly FUNCTION_MAX_LENGTH           = 'maxLength';
    static readonly FUNCTION_LENGTH               = 'length';
    static readonly FUNCTION_CONTAINS             = 'contains';
    static readonly FUNCTION_EQUALS               = 'equals';
    static readonly FUNCTION_BIGGER_THAN          = 'biggerThan';
    static readonly FUNCTION_LESSER_THAN          = 'lesserThan';
    static readonly FUNCTION_REGEX                = 'regex';
    static readonly FUNCTION_ENDS_WITH            = 'endsWith';
    static readonly FUNCTION_STARTS_WITH          = 'startsWith';

    //VALIDATOR FORMAT
    static readonly FORMAT_IS_LETTERS             = 'isLetters';
}

class TYPE
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
    
    //Not supported
    static readonly FILE             = 'file';
    //File Extensions
}

class FORMAT_LETTERS
{
    static readonly UPPER_CASE              = 'uppercase';
    static readonly LOWER_CASE              = 'lowercase';
}

class ValidatorConst
{
    static readonly KEYS = KEYS;
    static readonly TYPE = TYPE;
    static readonly FORMAT_LETTERS = FORMAT_LETTERS;


    static readonly ONLY_NUMBER_FUNCTIONS =
        [
            ValidatorConst.KEYS.FUNCTION_LESSER_THAN,
            ValidatorConst.KEYS.FUNCTION_BIGGER_THAN
        ];

    static readonly ONLY_STRING_FUNCTIONS =
        [
            ValidatorConst.KEYS.FUNCTION_ENDS_WITH,
            ValidatorConst.KEYS.FUNCTION_STARTS_WITH,
            ValidatorConst.KEYS.FUNCTION_REGEX,
            ValidatorConst.KEYS.FUNCTION_CONTAINS,
            ValidatorConst.KEYS.FUNCTION_LENGTH,
            ValidatorConst.KEYS.FUNCTION_MIN_LENGTH,
            ValidatorConst.KEYS.FUNCTION_MAX_LENGTH,
            ValidatorConst.KEYS.FORMAT_IS_LETTERS
        ];

}

export = ValidatorConst;