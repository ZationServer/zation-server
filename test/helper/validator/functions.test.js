const assert = require('assert');
const TaskErrorBag    = require('../../../dist/lib/api/TaskErrorBag');
const funcValidator   = require('../../../dist/lib/helper/validator/validatorLibrary').function;
const FormatLetters   = require('../../../dist/lib/helper/constants/validation').FormatLetters;

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

});