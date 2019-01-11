const assert = require('assert');
const TaskErrorBag    = require('../../../dist/lib/api/TaskErrorBag');
const funcValidator   = require('../../../dist/lib/helper/validator/validatorLibrary').function;

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

});