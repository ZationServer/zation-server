/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const BackErrorBag       = require("../../../../../dist/lib/api/BackErrorBag").default;
const Base64TestData     = require("../../../../testData/base64");
const {FormatLetters}    = require("../../../../../dist/lib/main/definitions/validation");
const {ValidatorLibrary} = require("../../../../../dist/lib/main/models/validator/validatorLibrary");
const assert             = require("chai").assert;

const ValidatorFunctions  = ValidatorLibrary.Functions;

describe('Function Validation',() => {

    describe('Regex',() => {

        describe('Regex Normal', () => {
            it('Not matching input should produce an error',async () => {
                const eb = new BackErrorBag();
                await ValidatorFunctions.regex(/^[0-9]*$/)('aba',eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.regex(/^[0-9]*$/)('23',eb,{});
                assert(eb.isEmpty());
            });

            it('Not a string should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.regex(/^[0-9]*$/)(23,eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('Regex Object',() => {
            it('Double not matching regex should produce two errors',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.regex({onlyNumbers : /^[0-9]*$/,minLength : /^.{6,}$/})('aba',eb,{});
                assert(eb.count === 2);
            });

            it('Double matching regex should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.regex({onlyNumbers : /^[0-9]*$/,minLength : /^.{6,}$/})('73849578',eb,{});
                assert(eb.isEmpty());
            });
        });
    });

    describe('In',() => {

        it('Not matching input should produce an error with info',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.in(['m','w'])('c',eb,{});
            assert(!eb.isEmpty());
            assert(eb.getBackErrors()[0].getInfo().values !== undefined);
        });

        it('Matching should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.in(['m','w'])('m',eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('PrivateIn',() => {

        it('Not matching input should produce an error with no info',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.privateIn(['m','w'])('c',eb,{});
            assert(!eb.isEmpty());
            assert(eb.getBackErrors()[0].getInfo().values === undefined);
        });

        it('Matching should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.privateIn(['m','w'])('m',eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('MinLength',() => {

        it('Not matching input should produce an error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.minLength(2)('c',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.minLength(2)('mm',eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.minLength(2)(2,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('MaxLength',() => {

        it('Not matching input should produce an error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.maxLength(2)('cmc',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.maxLength(2)('mm',eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.maxLength(2)(2,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('Length',() => {

        it('Not matching input should produce an error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.length(2)('cmc',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.length(2)('mm',eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.length(2)(5,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('Contains',() => {

        describe('Contains Normal',() => {

            it('Not matching input should produce an error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.contains('hello')('hi luca',eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.contains('hello')('mh, hello luca',eb,{});
                assert(eb.isEmpty());
            });

            it('Not a string should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.contains('hello')(5,eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('Contains Array',() => {

            it('Not matching input should produce an error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.contains(['hello','hi'])('hi luca',eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.contains(['luca','mh'])('mh, hello luca',eb,{});
                assert(eb.isEmpty());
            });

            it('Not a string should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.contains(['hello','mh'])(5,eb,{});
                assert(eb.isEmpty());
            });
        });

    });

    describe('Equals',() => {

        it('Not matching input should produce an error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.equals('hello luca')('hi luca',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.equals('hello luca')('hello luca',eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('MinValue',() => {

        it('Not matching input should produce an error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.minValue(10)(7,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.minValue(10)(10,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a number should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.minValue(5)('hello',eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('MaxValue',() => {

        it('Not matching input should produce an error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.maxValue(12)(15,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.maxValue(15)(10,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a number should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.maxValue(5)('hello',eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('StartsWith',() => {

        it('Not matching input should produce an error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.startsWith('hello')('hi luca',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.startsWith('hello')('hello luca',eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.startsWith('hello')(5,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('EndsWith',() => {

        it('Not matching input should produce an error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.endsWith('peter')('hi luca',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.endsWith('peter')('hello peter',eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.endsWith('hello')(5,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('Letters',() => {

        describe('UpperCase',() => {
            it('Not matching input should produce an error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.letters(FormatLetters.UpperCase)('aba',eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.letters(FormatLetters.UpperCase)('ABA',eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('LowerCase',() => {
            it('Not matching input should produce an error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.letters(FormatLetters.LowerCase)('ABA',eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.letters(FormatLetters.LowerCase)('aba',eb,{});
                assert(eb.isEmpty());
            });
        });

        it('Not a string should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.letters(FormatLetters.UpperCase)(5,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('CharClass',() => {
        it('Not matching input should produce an error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.charClass('a-z')('lucA',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.charClass('a-z')('luca',eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.charClass('a-z')(5,eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('Before',() => {

        it('Not matching input should produce an error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.before(Date.parse('03/12/2016'))('04/12/2017',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.before(Date.parse('03/12/2016'))('02/11/2015',eb,{});
            assert(eb.isEmpty());
        });

        it('A number should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.before(Date.parse('10/03/2016'))(5,eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('After',() => {

        it('Not matching input should produce an error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.after(Date.parse('03/18/2019'))('04/14/2016',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.after(Date.parse('03/12/2016'))('12/11/2019',eb,{});
            assert(eb.isEmpty());
        });

        it('A number should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.after(Date.parse('10/03/2016'))(5,eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('MinByteSize',() => {

        describe('String',() => {
            it('Not matching input should produce an error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.minByteSize(40)('a',eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.minByteSize(10)('hello my name is tom',eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('Base64',() => {

            it('Not matching input should produce an error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.minByteSize(Base64TestData.d1.fileByte*2)(Base64TestData.d1.data,eb,{},undefined,'base64');
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.minByteSize(Base64TestData.d1.fileByte)(Base64TestData.d1.data,eb,{},undefined,'base64');
                assert(eb.isEmpty());
            });
        });

        it('A number should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.minByteSize(10)(5,eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('MaxByteSize',() => {

        describe('String',() => {
            it('Not matching input should produce an error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.maxByteSize(0)('a',eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.maxByteSize(200)('hello my name is tom',eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('Base64',() => {

            it('Not matching input should produce an error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.maxByteSize(Base64TestData.d1.fileByte)(Base64TestData.d1.data,eb,{},undefined,'base64');
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.maxByteSize(Base64TestData.d1.fileByte*2)(Base64TestData.d1.data,eb,{},undefined,'base64');
                assert(eb.isEmpty());
            });
        });

        it('A number should produce no error',async () => {
            const eb = new BackErrorBag;
            await ValidatorFunctions.maxByteSize(10)(5,eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('MimeType',() => {

        describe('MimeType Normal',() => {

            it('Not matching input should produce an error (string)',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.mimeType('text')(Base64TestData.d2.data,eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error (string)',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.mimeType(Base64TestData.d2.mimeType)(Base64TestData.d2.data,eb,{});
                assert(eb.isEmpty());
            });

            it('A number should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.mimeType('image')(5,eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('MimeType Array',() => {

            it('Not matching input should produce an error (array)',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.mimeType(['text','audio'])(Base64TestData.d2.data,eb,{});
                assert(!eb.isEmpty());
            });


            it('Matching should produce no error (array)',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.mimeType([Base64TestData.d2.mimeType,'audio'])(Base64TestData.d2.data,eb,{});
                assert(eb.isEmpty());
            });

            it('A number should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.mimeType(['image','audio'])(5,eb,{});
                assert(eb.isEmpty());
            });
        });
    });

    describe('MimeSubType',() => {

        describe('MimeSubType Normal',() => {

            it('Not matching input should produce an error (string)',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.mimeSubType('jpg')(Base64TestData.d2.data,eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error (string)',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.mimeSubType(Base64TestData.d2.subType)(Base64TestData.d2.data,eb,{});
                assert(eb.isEmpty());
            });

            it('A number should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.mimeSubType('image')(5,eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('MimeSubType Array',() => {

            it('Not matching input should produce an error (array)',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.mimeSubType(['jpg','svg'])(Base64TestData.d2.data,eb,{});
                assert(!eb.isEmpty());
            });


            it('Matching should produce no error (array)',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.mimeSubType([Base64TestData.d2.subType,'jpg'])(Base64TestData.d2.data,eb,{});
                assert(eb.isEmpty());
            });

            it('A number should produce no error',async () => {
                const eb = new BackErrorBag;
                await ValidatorFunctions.mimeSubType(['jpg','png'])(5,eb,{});
                assert(eb.isEmpty());
            });
        });
    });

});