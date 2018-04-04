/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class ValidatorConst {}

ValidatorConst.TYPE                  = 'type';
//TYPES FOR VALIDATOR
ValidatorConst.TYPE_STRING           = 'string';
ValidatorConst.TYPE_ALL              = 'all';
ValidatorConst.TYPE_INT              = 'int';
ValidatorConst.TYPE_FLOAT            = 'float';
ValidatorConst.TYPE_DATE             = 'date';
ValidatorConst.TYPE_EMAIL            = 'email';
ValidatorConst.TYPE_BOOLEAN          = 'boolean';
ValidatorConst.TYPE_SHA512           = 'sha512';
ValidatorConst.TYPE_SHA256           = 'sha256';
ValidatorConst.TYPE_SHA384           = 'sha384';
ValidatorConst.TYPE_SHA1             = 'sha1';
ValidatorConst.TYPE_MD5              = 'md5';
ValidatorConst.TYPE_HEX_COLOR        = 'hexColor';
ValidatorConst.TYPE_HEXADECIMAL      = 'hexadecimal';
ValidatorConst.TYPE_IP_5             = 'ip5';
ValidatorConst.TYPE_IP_6             = 'ip6';
ValidatorConst.TYPE_ISBN_10          = 'isbn10';
ValidatorConst.TYPE_ISBN_13          = 'isbn13';
ValidatorConst.TYPE_JSON             = 'json';
ValidatorConst.TYPE_URL              = 'url';
ValidatorConst.TYPE_MIME_TYPE        = 'mimeType';
ValidatorConst.TYPE_MAC_ADDRESS      = 'macAddress';
ValidatorConst.TYPE_MOBILE_NUMBER    = 'mobileNumber';
ValidatorConst.TYPE_UUID_3           = 'uuid3';
ValidatorConst.TYPE_UUID_4           = 'uuid4';
ValidatorConst.TYPE_UUID_5           = 'uuid5';
ValidatorConst.TYPE_LAT_LONG         = 'latLong';
ValidatorConst.TYPE_BASE64           = 'base64';
ValidatorConst.TYPE_ASCII            = 'ascii';
//Not supported
ValidatorConst.TYPE_FILE             = 'file';

//File Extensions

//VALIDATOR FUNCTIONS
ValidatorConst.FUNCTION_MIN_LENGTH           = 'minLength';
ValidatorConst.FUNCTION_MAX_LENGTH           = 'maxLength';
ValidatorConst.FUNCTION_LENGTH               = 'length';
ValidatorConst.FUNCTION_CONTAINS             = 'contains';
ValidatorConst.FUNCTION_EQUALS               = 'equals';
ValidatorConst.FUNCTION_BIGGER_THAN          = 'biggerThan';
ValidatorConst.FUNCTION_LESSER_THAN          = 'lesserThan';
ValidatorConst.FUNCTION_REGEX                = 'regex';
ValidatorConst.FUNCTION_ENDS_WITH            = 'endsWith';
ValidatorConst.FUNCTION_STARTS_WITH          = 'startsWith';

//VALIDATOR FORMAT
ValidatorConst.FORMAT_IS_LETTERS                      = 'isLetters';
ValidatorConst.FORMAT_LETTERS_UPPER_CASE              = 'uppercase';
ValidatorConst.FORMAT_LETTERS_LOWER_CASE              = 'lowercase';

module.exports = ValidatorConst;