const assert          = require("chai").assert;
const TaskErrorBag    = require('../../../../dist/lib/api/TaskErrorBag');
const typeValidator   = require('../../../../dist/lib/helper/validator/validatorLibrary').type;
const validationTypes = require('../../../../dist/lib/helper/constants/validationTypes').ValidationTypes;

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
    });

    describe('Char',() => {
        it('Char should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.CHAR]('t',eb,{});
            assert(eb.isEmpty());
        });

        it('String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.CHAR]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.CHAR](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.CHAR]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Null',() => {
        it('Null should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.NULL](null,eb,{});
            assert(eb.isEmpty());
        });

        it('String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.NULL]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.NULL](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.NULL]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Int',() => {

        describe('(strict = true)',() => {
            it('Int should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.INT](10,eb,{},true);
                assert(eb.isEmpty());
            });

            it('Float should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.INT](10.35,eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.INT]("test",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Int String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.INT]("10",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.INT]("10.40",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.INT]({},eb,{},true);
                assert(!eb.isEmpty());
            });
        });

        describe('(strict = false)',() => {
            it('Int should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.INT](10,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Float should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.INT](10.35,eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.INT]("test",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Int String should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.INT]("10",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.INT]("10.40",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.INT]({},eb,{},false);
                assert(!eb.isEmpty());
            });
        });
    });

    describe('Float',() => {

        describe('(strict = true)',() => {
            it('Float should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.FLOAT](10.45,eb,{},true);
                assert(eb.isEmpty());
            });

            it('Int (with .0) should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.FLOAT](10.0,eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.FLOAT]("test",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Int String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.FLOAT]("10",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.FLOAT]("10.23",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.FLOAT]({},eb,{},true);
                assert(!eb.isEmpty());
            });
        });

        describe('(strict = false)',() => {
            it('Float should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.FLOAT](10.45,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Int (with .0) should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.FLOAT](10.0,eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.FLOAT]("test",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Int String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.FLOAT]("10",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Float String should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.FLOAT]("10.23",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.FLOAT]({},eb,{},false);
                assert(!eb.isEmpty());
            });
        });
    });

    describe('Number',() => {

        describe('(strict = true)',() => {
            it('Float should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.NUMBER](10.45,eb,{},true);
                assert(eb.isEmpty());
            });

            it('Int should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.NUMBER](10,eb,{},true);
                assert(eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.NUMBER]("test",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Int String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.NUMBER]("10",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.NUMBER]("10.23",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.NUMBER]({},eb,{},true);
                assert(!eb.isEmpty());
            });
        });

        describe('(strict = false)',() => {
            it('Float should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.NUMBER](10.45,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Int should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.NUMBER](10,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.NUMBER]("test",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Int String should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.NUMBER]("10",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Float String should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.NUMBER]("10.23",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.NUMBER]({},eb,{},false);
                assert(!eb.isEmpty());
            });
        });
    });

});