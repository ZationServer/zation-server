/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const BackErrorBag       = require("../../../../dist/lib/api/BackErrorBag").default;
const Base64TestData     = require("../../../testData/base64");
const ZationConfigStub   = require("../../../stubs/zationConfigFull");
const {ValidationTypes}  = require("../../../../dist");
const {FormatLetters}    = require("../../../../dist/lib/helper/constants/validation");
const ConfigPreCompiler  = require("../../../../dist/lib/helper/configUtils/configPreCompiler").default;
const {ValidatorLibrary} = require("../../../../dist/lib/helper/validator/validatorLibrary");
const assert             = require("chai").assert;

const ValidatorFunctions  = ValidatorLibrary.Functions;

describe('Function Validation',() => {

    describe('Regex',() => {

        describe('Regex Normal',() => {
            it('Not matching input should produce an error',() => {
                const eb = new BackErrorBag();
                ValidatorFunctions.regex('aba',/^[0-9]*$/,eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.regex('23',/^[0-9]*$/,eb,{});
                assert(eb.isEmpty());
            });

            it('Not a string should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.regex(23,/^[0-9]*$/,eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('Regex Object',() => {
            it('Double not matching regex should produce two errors',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.regex('aba',{onlyNumbers : /^[0-9]*$/,minLength : /^.{6,}$/},eb,{});
                assert(eb.getBackErrorCount() === 2);
            });

            it('Double matching regex should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.regex('73849578',{onlyNumbers : /^[0-9]*$/,minLength : /^.{6,}$/},eb,{});
                assert(eb.isEmpty());
            });
        });
    });

    describe('Enum',() => {

        it('Not matching input should produce an error with info',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.enum('c',['m','w'],eb,{});
            assert(!eb.isEmpty());
            assert(eb.getBackErrors()[0].getInfo().enum !== undefined);
        });

        it('Matching should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.enum('m',['m','w'],eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('PrivateEnum',() => {

        it('Not matching input should produce an error with no info',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.privateEnum('c',['m','w'],eb,{});
            assert(!eb.isEmpty());
            assert(eb.getBackErrors()[0].getInfo().enum === undefined);
        });

        it('Matching should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.privateEnum('m',['m','w'],eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('MinLength',() => {

        it('Not matching input should produce an error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.minLength('c',2,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.minLength('mm',2,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.minLength(2,2,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('MaxLength',() => {

        it('Not matching input should produce an error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.maxLength('cmc',2,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.maxLength('mm',2,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.maxLength(2,2,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('Length',() => {

        it('Not matching input should produce an error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.length('cmc',2,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.length('mm',2,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.length(5,2,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('Contains',() => {

        describe('Contains Normal',() => {

            it('Not matching input should produce an error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.contains('hi luca','hello',eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.contains('mh, hello luca','hello',eb,{});
                assert(eb.isEmpty());
            });

            it('Not a string should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.contains(5,'hello',eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('Contains Array',() => {

            it('Not matching input should produce an error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.contains('hi luca',['hello','hi'],eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.contains('mh, hello luca',['luca','mh'],eb,{});
                assert(eb.isEmpty());
            });

            it('Not a string should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.contains(5,['hello','mh'],eb,{});
                assert(eb.isEmpty());
            });
        });

    });

    describe('Equals',() => {

        it('Not matching input should produce an error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.equals('hi luca','hello luca',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.equals('hello luca','hello luca',eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('MinValue',() => {

        it('Not matching input should produce an error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.minValue(7,10,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.minValue(10,10,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a number should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.minValue('hello',5,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('MaxValue',() => {

        it('Not matching input should produce an error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.maxValue(15,12,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.maxValue(10,15,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a number should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.maxValue('hello',5,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('StartsWith',() => {

        it('Not matching input should produce an error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.startsWith('hi luca','hello',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.startsWith('hello luca','hello',eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.startsWith(5,'hello',eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('EndsWith',() => {

        it('Not matching input should produce an error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.endsWith('hi luca','peter',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.endsWith('hello peter','peter',eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.endsWith(5,'hello',eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('Letters',() => {

        describe('UpperCase',() => {
            it('Not matching input should produce an error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.letters('aba',FormatLetters.UPPER_CASE,eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.letters('ABA',FormatLetters.UPPER_CASE,eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('LowerCase',() => {
            it('Not matching input should produce an error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.letters('ABA',FormatLetters.LOWER_CASE,eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.letters('aba',FormatLetters.LOWER_CASE,eb,{});
                assert(eb.isEmpty());
            });
        });

        it('Not a string should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.letters(5,FormatLetters.UPPER_CASE,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('CharClass',() => {

        /*
           Use pre compiler for compile the char class
        */
        let config={charClass : 'a-z'};
        // @ts-ignore
        new ConfigPreCompiler(ZationConfigStub).preCompileValidationFunctions(config);

        it('Not matching input should produce an error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.charClass('lucA',config.charClass,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.charClass('luca',config.charClass,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.charClass(5,config.charClass,eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('Before',() => {

        it('Not matching input should produce an error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.before('04/12/2017',Date.parse('03/12/2016'),eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.before('02/11/2015',Date.parse('03/12/2016'),eb,{});
            assert(eb.isEmpty());
        });

        it('A number should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.before(5,Date.parse('10/03/2016'),eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('After',() => {

        it('Not matching input should produce an error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.after('04/14/2016',Date.parse('03/18/2019'),eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.after('12/11/2019',Date.parse('03/12/2016'),eb,{});
            assert(eb.isEmpty());
        });

        it('A number should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.after(5,Date.parse('10/03/2016'),eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('MinByteSize',() => {

        describe('String',() => {
            it('Not matching input should produce an error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.minByteSize('a',40,eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.minByteSize('hello my name is tom',10,eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('Base64',() => {

            it('Not matching input should produce an error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.minByteSize(Base64TestData.d1.data,Base64TestData.d1.fileByte*2,eb,{},undefined,ValidationTypes.BASE64);
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.minByteSize(Base64TestData.d1.data,Base64TestData.d1.fileByte,eb,{},undefined,ValidationTypes.BASE64);
                assert(eb.isEmpty());
            });
        });

        it('A number should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.minByteSize(5,10,eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('MaxByteSize',() => {

        describe('String',() => {
            it('Not matching input should produce an error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.maxByteSize('a',0,eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.maxByteSize('hello my name is tom',200,eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('Base64',() => {

            it('Not matching input should produce an error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.maxByteSize(Base64TestData.d1.data,Base64TestData.d1.fileByte,eb,{},undefined,ValidationTypes.BASE64);
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.maxByteSize(Base64TestData.d1.data,Base64TestData.d1.fileByte*2,eb,{},undefined,ValidationTypes.BASE64);
                assert(eb.isEmpty());
            });
        });

        it('A number should produce no error',() => {
            const eb = new BackErrorBag;
            ValidatorFunctions.maxByteSize(5,10,eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('MimeType',() => {

        describe('MimeType Normal',() => {

            it('Not matching input should produce an error (string)',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.mimeType(Base64TestData.d2.data,'text',eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error (string)',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.mimeType(Base64TestData.d2.data,Base64TestData.d2.mimeType,eb,{});
                assert(eb.isEmpty());
            });

            it('A number should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.mimeType(5,'image',eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('MimeType Array',() => {

            it('Not matching input should produce an error (array)',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.mimeType(Base64TestData.d2.data,['text','audio'],eb,{});
                assert(!eb.isEmpty());
            });


            it('Matching should produce no error (array)',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.mimeType(Base64TestData.d2.data,[Base64TestData.d2.mimeType,'audio'],eb,{});
                assert(eb.isEmpty());
            });

            it('A number should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.mimeType(5,['image','audio'],eb,{});
                assert(eb.isEmpty());
            });
        });
    });

    describe('MimeSubType',() => {

        describe('MimeSubType Normal',() => {

            it('Not matching input should produce an error (string)',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.mimeSubType(Base64TestData.d2.data,'jpg',eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error (string)',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.mimeSubType(Base64TestData.d2.data,Base64TestData.d2.subType,eb,{});
                assert(eb.isEmpty());
            });

            it('A number should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.mimeSubType(5,'image',eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('MimeSubType Array',() => {

            it('Not matching input should produce an error (array)',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.mimeSubType(Base64TestData.d2.data,['jpg','svg'],eb,{});
                assert(!eb.isEmpty());
            });


            it('Matching should produce no error (array)',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.mimeSubType(Base64TestData.d2.data,[Base64TestData.d2.subType,'jpg'],eb,{});
                assert(eb.isEmpty());
            });

            it('A number should produce no error',() => {
                const eb = new BackErrorBag;
                ValidatorFunctions.mimeSubType(5,['jpg','png'],eb,{});
                assert(eb.isEmpty());
            });
        });
    });

});