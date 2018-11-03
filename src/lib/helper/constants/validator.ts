/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ValidationTypes = require("./validationTypes");

class KEYS
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

class FORMAT_LETTERS
{
    static readonly UPPER_CASE              = 'uppercase';
    static readonly LOWER_CASE              = 'lowercase';
}

class ValidatorConst
{
    static readonly KEYS = KEYS;
    static readonly TYPE = ValidationTypes;
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