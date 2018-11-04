/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ValidationTypes = require("./validationTypes");

class VALUE_KEYS
{
    static readonly TYPE                          = 'type';
    static readonly STRICT_TYPE                   = 'strictType';

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

    //Own validate functions
    static readonly VALIDATE                      = 'validate';
}

class ARRAY_KEYS
{
    static readonly MIN_LENGTH               = 'minLength';
    static readonly MAX_LENGTH               = 'maxLength';
    static readonly LENGTH                   = 'length';
}

class FORMAT_LETTERS
{
    static readonly UPPER_CASE              = 'uppercase';
    static readonly LOWER_CASE              = 'lowercase';
}

class VALUE
{
    static readonly KEYS = VALUE_KEYS;
    static readonly TYPE = ValidationTypes;
    static readonly FORMAT_LETTERS = FORMAT_LETTERS;


    static readonly ONLY_NUMBER_FUNCTIONS =
        [
            VALUE_KEYS.FUNCTION_LESSER_THAN,
            VALUE_KEYS.FUNCTION_BIGGER_THAN
        ];

    static readonly ONLY_STRING_FUNCTIONS =
        [
            VALUE_KEYS.FUNCTION_ENDS_WITH,
            VALUE_KEYS.FUNCTION_STARTS_WITH,
            VALUE_KEYS.FUNCTION_REGEX,
            VALUE_KEYS.FUNCTION_CONTAINS,
            VALUE_KEYS.FUNCTION_LENGTH,
            VALUE_KEYS.FUNCTION_MIN_LENGTH,
            VALUE_KEYS.FUNCTION_MAX_LENGTH,
            VALUE_KEYS.FORMAT_IS_LETTERS
        ];
}

class ARRAY
{
    static readonly KEYS = ARRAY_KEYS;
}

class ValidatorConst
{
    static readonly VALUE = VALUE;
    static readonly ARRAY = ARRAY;
}

export = ValidatorConst;