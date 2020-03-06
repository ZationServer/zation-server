/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export type ValidationTypeRecord = Record<ValidationType,any>;

export type ValidationType =
    'object' |
    'array' |
    'string' |
    'char' |
    'null' |
    'all' |
    'int' |
    'float' |
    'number' |
    'date' |
    'email' |
    'boolean' |
    'sha512' |
    'sha256' |
    'sha384' |
    'sha1' |
    'md5' |
    'hexColor' |
    'hexadecimal' |
    'ip4' |
    'ip6' |
    'isbn10' |
    'isbn13' |
    'json' |
    'url' |
    'mimeType' |
    'macAddress' |
    'mobileNumber' |
    'uuid3' |
    'uuid4' |
    'uuid5' |
    'base64' |
    'ascii' |
    'userId' |
    'mongoId' |
    'latLong';