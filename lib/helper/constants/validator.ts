/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class ValidatorConst {}

ValidatorConst.KEYS = {};
ValidatorConst.KEYS.TYPE                  = 'type';

ValidatorConst.TYPE = {};
//TYPES FOR VALIDATOR
ValidatorConst.TYPE.STRING           = 'string';
ValidatorConst.TYPE.ALL              = 'all';
ValidatorConst.TYPE.INT              = 'int';
ValidatorConst.TYPE.FLOAT            = 'float';
ValidatorConst.TYPE.DATE             = 'date';
ValidatorConst.TYPE.EMAIL            = 'email';
ValidatorConst.TYPE.BOOLEAN          = 'boolean';
ValidatorConst.TYPE.SHA512           = 'sha512';
ValidatorConst.TYPE.SHA256           = 'sha256';
ValidatorConst.TYPE.SHA384           = 'sha384';
ValidatorConst.TYPE.SHA1             = 'sha1';
ValidatorConst.TYPE.MD5              = 'md5';
ValidatorConst.TYPE.HEX_COLOR        = 'hexColor';
ValidatorConst.TYPE.HEXADECIMAL      = 'hexadecimal';
ValidatorConst.TYPE.IP_5             = 'ip5';
ValidatorConst.TYPE.IP_6             = 'ip6';
ValidatorConst.TYPE.ISBN_10          = 'isbn10';
ValidatorConst.TYPE.ISBN_13          = 'isbn13';
ValidatorConst.TYPE.JSON             = 'json';
ValidatorConst.TYPE.URL              = 'url';
ValidatorConst.TYPE.MIME_TYPE        = 'mimeType';
ValidatorConst.TYPE.MAC_ADDRESS      = 'macAddress';
ValidatorConst.TYPE.MOBILE_NUMBER    = 'mobileNumber';
ValidatorConst.TYPE.UUID_3           = 'uuid3';
ValidatorConst.TYPE.UUID_4           = 'uuid4';
ValidatorConst.TYPE.UUID_5           = 'uuid5';
ValidatorConst.TYPE.LAT_LONG         = 'latLong';
ValidatorConst.TYPE.BASE64           = 'base64';
ValidatorConst.TYPE.ASCII            = 'ascii';
//Not supported
ValidatorConst.TYPE.FILE             = 'file';

//File Extensions

//VALIDATOR FUNCTIONS
ValidatorConst.KEYS.FUNCTION_ENUM                 = 'enum';
ValidatorConst.KEYS.FUNCTION_PRIVATE_ENUM         = 'privateEnum';
ValidatorConst.KEYS.FUNCTION_MIN_LENGTH           = 'minLength';
ValidatorConst.KEYS.FUNCTION_MAX_LENGTH           = 'maxLength';
ValidatorConst.KEYS.FUNCTION_LENGTH               = 'length';
ValidatorConst.KEYS.FUNCTION_CONTAINS             = 'contains';
ValidatorConst.KEYS.FUNCTION_EQUALS               = 'equals';
ValidatorConst.KEYS.FUNCTION_BIGGER_THAN          = 'biggerThan';
ValidatorConst.KEYS.FUNCTION_LESSER_THAN          = 'lesserThan';
ValidatorConst.KEYS.FUNCTION_REGEX                = 'regex';
ValidatorConst.KEYS.FUNCTION_ENDS_WITH            = 'endsWith';
ValidatorConst.KEYS.FUNCTION_STARTS_WITH          = 'startsWith';

//VALIDATOR FORMAT
ValidatorConst.KEYS.FORMAT_IS_LETTERS                 = 'isLetters';

ValidatorConst.FORMAT_LETTERS = {};
ValidatorConst.FORMAT_LETTERS.UPPER_CASE              = 'uppercase';
ValidatorConst.FORMAT_LETTERS.LOWER_CASE              = 'lowercase';

ValidatorConst.ONLY_NUMBER_FUNCTIONS = [
    ValidatorConst.KEYS.FUNCTION_LESSER_THAN,
    ValidatorConst.KEYS.FUNCTION_BIGGER_THAN
];

ValidatorConst.ONLY_STRING_FUNCTIONS = [
    ValidatorConst.KEYS.FUNCTION_ENDS_WITH,
    ValidatorConst.KEYS.FUNCTION_STARTS_WITH,
    ValidatorConst.KEYS.FUNCTION_REGEX,
    ValidatorConst.KEYS.FUNCTION_CONTAINS,
    ValidatorConst.KEYS.FUNCTION_LENGTH,
    ValidatorConst.KEYS.FUNCTION_MIN_LENGTH,
    ValidatorConst.KEYS.FUNCTION_MAX_LENGTH,
    ValidatorConst.KEYS.FORMAT_IS_LETTERS
];




module.exports = ValidatorConst;