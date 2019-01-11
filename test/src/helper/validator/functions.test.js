const assert          = require("chai").assert;
const TaskErrorBag    = require('../../../../dist/lib/api/TaskErrorBag');
const funcValidator   = require('../../../../dist/lib/helper/validator/validatorLibrary').function;
const validationTypes = require('../../../../dist/lib/helper/constants/validationTypes').ValidationTypes;
const FormatLetters   = require('../../../../dist/lib/helper/constants/validation').FormatLetters;
const ConfigPreCompiler = require('../../../../dist/lib/helper/config/configPreCompiler');
const ZationConfigStub  = require('./../../../stubs/zationConfig');
const Base64TestData    = require('./../../../testData/base64');

describe('Function Validation',() => {

    describe('Regex',() => {

        describe('Regex Normal',() => {
            it('Not matching input should produce an error',() => {
                const eb = new TaskErrorBag;
                funcValidator.regex('aba',/^[0-9]*$/,eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.regex('23',/^[0-9]*$/,eb,{});
                assert(eb.isEmpty());
            });

            it('Not a string should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.regex(23,/^[0-9]*$/,eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('Regex Object',() => {
            it('Double not matching regex should produce two errors',() => {
                const eb = new TaskErrorBag;
                funcValidator.regex('aba',{onlyNumbers : /^[0-9]*$/,minLength : /^.{6,}$/},eb,{});
                assert(eb.getTaskErrorCount() === 2);
            });

            it('Double matching regex should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.regex('73849578',{onlyNumbers : /^[0-9]*$/,minLength : /^.{6,}$/},eb,{});
                assert(eb.isEmpty());
            });
        });
    });

    describe('Enum',() => {

        it('Not matching input should produce an error with info',() => {
            const eb = new TaskErrorBag;
            funcValidator.enum('c',['m','w'],eb,{});
            assert(!eb.isEmpty());
            assert(eb.getTaskErrors()[0].getInfo().enum !== undefined);
        });

        it('Matching should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.enum('m',['m','w'],eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('PrivateEnum',() => {

        it('Not matching input should produce an error with no info',() => {
            const eb = new TaskErrorBag;
            funcValidator.privateEnum('c',['m','w'],eb,{});
            assert(!eb.isEmpty());
            assert(eb.getTaskErrors()[0].getInfo().enum === undefined);
        });

        it('Matching should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.privateEnum('m',['m','w'],eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('MinLength',() => {

        it('Not matching input should produce an error',() => {
            const eb = new TaskErrorBag;
            funcValidator.minLength('c',2,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.minLength('mm',2,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.minLength(2,2,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('MaxLength',() => {

        it('Not matching input should produce an error',() => {
            const eb = new TaskErrorBag;
            funcValidator.maxLength('cmc',2,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.maxLength('mm',2,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.maxLength(2,2,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('Length',() => {

        it('Not matching input should produce an error',() => {
            const eb = new TaskErrorBag;
            funcValidator.length('cmc',2,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.length('mm',2,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.length(5,2,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('Contains',() => {

        describe('Contains Normal',() => {

            it('Not matching input should produce an error',() => {
                const eb = new TaskErrorBag;
                funcValidator.contains('hi luca','hello',eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.contains('mh, hello luca','hello',eb,{});
                assert(eb.isEmpty());
            });

            it('Not a string should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.contains(5,'hello',eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('Contains Array',() => {

            it('Not matching input should produce an error',() => {
                const eb = new TaskErrorBag;
                funcValidator.contains('hi luca',['hello','hi'],eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.contains('mh, hello luca',['luca','mh'],eb,{});
                assert(eb.isEmpty());
            });

            it('Not a string should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.contains(5,['hello','mh'],eb,{});
                assert(eb.isEmpty());
            });
        });

    });

    describe('Equals',() => {

        it('Not matching input should produce an error',() => {
            const eb = new TaskErrorBag;
            funcValidator.equals('hi luca','hello luca',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.equals('hello luca','hello luca',eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('MinValue',() => {

        it('Not matching input should produce an error',() => {
            const eb = new TaskErrorBag;
            funcValidator.minValue(7,10,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.minValue(10,10,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a number should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.minValue('hello',5,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('MaxValue',() => {

        it('Not matching input should produce an error',() => {
            const eb = new TaskErrorBag;
            funcValidator.maxValue(15,12,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.maxValue(10,15,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a number should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.maxValue('hello',5,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('StartsWith',() => {

        it('Not matching input should produce an error',() => {
            const eb = new TaskErrorBag;
            funcValidator.startsWith('hi luca','hello',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.startsWith('hello luca','hello',eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.startsWith(5,'hello',eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('EndsWith',() => {

        it('Not matching input should produce an error',() => {
            const eb = new TaskErrorBag;
            funcValidator.endsWith('hi luca','peter',eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.endsWith('hello peter','peter',eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.endsWith(5,'hello',eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('Letters',() => {

        describe('UpperCase',() => {
            it('Not matching input should produce an error',() => {
                const eb = new TaskErrorBag;
                funcValidator.letters('aba',FormatLetters.UPPER_CASE,eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.letters('ABA',FormatLetters.UPPER_CASE,eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('LowerCase',() => {
            it('Not matching input should produce an error',() => {
                const eb = new TaskErrorBag;
                funcValidator.letters('ABA',FormatLetters.LOWER_CASE,eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.letters('aba',FormatLetters.LOWER_CASE,eb,{});
                assert(eb.isEmpty());
            });
        });

        it('Not a string should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.letters(5,FormatLetters.UPPER_CASE,eb,{});
            assert(eb.isEmpty());
        });

    });

    describe('CharClass',() => {

        /*
           Use pre compiler for compile the char class
        */
        let config={charClass : 'a-z'};
        new ConfigPreCompiler(ZationConfigStub).preCompileValidationFunctions(config);

        it('Not matching input should produce an error',() => {
            const eb = new TaskErrorBag;
            funcValidator.charClass('lucA',config.charClass,eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.charClass('luca',config.charClass,eb,{});
            assert(eb.isEmpty());
        });

        it('Not a string should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.charClass(5,config.charClass,eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('Before',() => {

        it('Not matching input should produce an error',() => {
            const eb = new TaskErrorBag;
            funcValidator.before('04/12/2017',Date.parse('03/12/2016'),eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.before('02/11/2015',Date.parse('03/12/2016'),eb,{});
            assert(eb.isEmpty());
        });

        it('A number should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.before(5,Date.parse('10/03/2016'),eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('After',() => {

        it('Not matching input should produce an error',() => {
            const eb = new TaskErrorBag;
            funcValidator.after('04/14/2016',Date.parse('03/18/2019'),eb,{});
            assert(!eb.isEmpty());
        });

        it('Matching should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.after('12/11/2019',Date.parse('03/12/2016'),eb,{});
            assert(eb.isEmpty());
        });

        it('A number should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.after(5,Date.parse('10/03/2016'),eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('MinByteSize',() => {

        describe('String',() => {
            it('Not matching input should produce an error',() => {
                const eb = new TaskErrorBag;
                funcValidator.minByteSize('a',40,eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.minByteSize('hello my name is tom',10,eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('Base64',() => {

            it('Not matching input should produce an error',() => {
                const eb = new TaskErrorBag;
                funcValidator.minByteSize(Base64TestData.d1.data,Base64TestData.d1.fileByte*2,eb,{},undefined,validationTypes.BASE64);
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.minByteSize(Base64TestData.d1.data,Base64TestData.d1.fileByte,eb,{},undefined,validationTypes.BASE64);
                assert(eb.isEmpty());
            });
        });

        it('A number should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.minByteSize(5,10,eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('MaxByteSize',() => {

        describe('String',() => {
            it('Not matching input should produce an error',() => {
                const eb = new TaskErrorBag;
                funcValidator.maxByteSize('a',0,eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.maxByteSize('hello my name is tom',200,eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('Base64',() => {

            it('Not matching input should produce an error',() => {
                const eb = new TaskErrorBag;
                funcValidator.maxByteSize(Base64TestData.d1.data,Base64TestData.d1.fileByte,eb,{},undefined,validationTypes.BASE64);
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.maxByteSize(Base64TestData.d1.data,Base64TestData.d1.fileByte*2,eb,{},undefined,validationTypes.BASE64);
                assert(eb.isEmpty());
            });
        });

        it('A number should produce no error',() => {
            const eb = new TaskErrorBag;
            funcValidator.maxByteSize(5,10,eb,{});
            assert(eb.isEmpty());
        });
    });

    describe('MimeType',() => {

        describe('MimeType Normal',() => {

            it('Not matching input should produce an error (string)',() => {
                const eb = new TaskErrorBag;
                funcValidator.mimeType(Base64TestData.d2.data,'text',eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error (string)',() => {
                const eb = new TaskErrorBag;
                funcValidator.mimeType(Base64TestData.d2.data,Base64TestData.d2.mimeType,eb,{});
                assert(eb.isEmpty());
            });

            it('A number should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.mimeType(5,'image',eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('MimeType Array',() => {

            it('Not matching input should produce an error (array)',() => {
                const eb = new TaskErrorBag;
                funcValidator.mimeType(Base64TestData.d2.data,['text','audio'],eb,{});
                assert(!eb.isEmpty());
            });


            it('Matching should produce no error (array)',() => {
                const eb = new TaskErrorBag;
                funcValidator.mimeType(Base64TestData.d2.data,[Base64TestData.d2.mimeType,'audio'],eb,{});
                assert(eb.isEmpty());
            });

            it('A number should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.mimeType(5,['image','audio'],eb,{});
                assert(eb.isEmpty());
            });
        });
    });

    describe('SubType',() => {

        describe('SubType Normal',() => {

            it('Not matching input should produce an error (string)',() => {
                const eb = new TaskErrorBag;
                funcValidator.subType(Base64TestData.d2.data,'jpg',eb,{});
                assert(!eb.isEmpty());
            });

            it('Matching should produce no error (string)',() => {
                const eb = new TaskErrorBag;
                funcValidator.subType(Base64TestData.d2.data,Base64TestData.d2.subType,eb,{});
                assert(eb.isEmpty());
            });

            it('A number should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.subType(5,'image',eb,{});
                assert(eb.isEmpty());
            });
        });

        describe('SubType Array',() => {

            it('Not matching input should produce an error (array)',() => {
                const eb = new TaskErrorBag;
                funcValidator.subType(Base64TestData.d2.data,['jpg','svg'],eb,{});
                assert(!eb.isEmpty());
            });


            it('Matching should produce no error (array)',() => {
                const eb = new TaskErrorBag;
                funcValidator.subType(Base64TestData.d2.data,[Base64TestData.d2.subType,'jpg'],eb,{});
                assert(eb.isEmpty());
            });

            it('A number should produce no error',() => {
                const eb = new TaskErrorBag;
                funcValidator.subType(5,['jpg','png'],eb,{});
                assert(eb.isEmpty());
            });
        });
    });

});