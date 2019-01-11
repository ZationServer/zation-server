const assert = require('assert');
const TaskErrorBag    = require('../../../dist/lib/api/TaskErrorBag');
const typeValidator   = require('../../../dist/lib/helper/validator/validatorLibrary').type;
const validationTypes = require('../../../dist/lib/helper/constants/validationTypes').ValidationTypes;

describe('Type Validation',() => {

    describe('Object',() => {
        it('Object should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.OBJECT]({},eb,{});
            assert(eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.OBJECT](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Null should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.OBJECT](null,eb,{});
            assert(!eb.isEmpty());
        });

        it('String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.OBJECT]('hallo',eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Array',() => {
        it('Array should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.ARRAY]([],eb,{});
            assert(eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.ARRAY](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.ARRAY]('hallo',eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.ARRAY]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('String',() => {
        it('String should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.STRING]('hallo',eb,{});
            assert(eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.STRING](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.STRING]({},eb,{});
            assert(!eb.isEmpty());
        });
    })

});