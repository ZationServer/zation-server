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

export type extractNonStrictValidationType<T> =
    T extends 'int' ? number | string :
        T extends 'float' ? number | string :
            T extends 'number' ? number | string :
                T extends 'date' ? any :
                    T extends 'boolean' ? boolean | number | string :
                        extractStrictValidationType<T>;

export type extractStrictValidationType<T> =
    T extends 'object' ? Record<string,any> :
        T extends 'array' ? any[] :
            T extends 'string' ? string :
                T extends 'char' ? string :
                    T extends 'null' ? null :
                        T extends 'all' ? any :
                            T extends 'int' ? number :
                                T extends 'float' ? number :
                                    T extends 'number' ? number :
                                        T extends 'date' ? Date :
                                            T extends 'email' ? string :
                                                T extends 'boolean' ? boolean :
                                                    T extends 'sha512' ? string :
                                                        T extends 'sha256' ? string :
                                                            T extends 'sha384' ? string :
                                                                T extends 'sha1' ? string :
                                                                    T extends 'md5' ? string :
                                                                        T extends 'hexColor' ? string :
                                                                            T extends 'hexadecimal' ? string :
                                                                                T extends 'ip4' ? string :
                                                                                    T extends 'ip6' ? string :
                                                                                        T extends 'isbn10' ? string :
                                                                                            T extends 'isbn13' ? string :
                                                                                                T extends 'json' ? string :
                                                                                                    T extends 'url' ? string :
                                                                                                        T extends 'mimeType' ? string :
                                                                                                            T extends 'macAddress' ? string :
                                                                                                                T extends 'mobileNumber' ? string :
                                                                                                                    T extends 'uuid3' ? string :
                                                                                                                        T extends 'uuid4' ? string :
                                                                                                                            T extends 'uuid5' ? string :
                                                                                                                                T extends 'base64' ? string :
                                                                                                                                    T extends 'ascii' ? string :
                                                                                                                                        T extends 'userId' ? number | string :
                                                                                                                                            T extends 'mongoId' ? string :
                                                                                                                                                T extends 'latLong' ? number : any;
