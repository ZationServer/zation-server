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

    describe('Date',() => {
        it('String Date version-1 should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.DATE]('Tue Jan 15 2019 00:30:01 GMT+0100 (Mitteleuropäische Normalzeit)',eb,{});
            assert(eb.isEmpty());
        });

        it('String Date version-2 should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.DATE]('12-01-2014',eb,{});
            assert(eb.isEmpty());
        });

        it('Letter String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.DATE]("hello",eb,{});
            assert(!eb.isEmpty());
        });

        it('Small Number should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.DATE](1220,eb,{});
            assert(eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.DATE]({},eb,{});
            assert(!eb.isEmpty());
        });

        it('Boolean should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.DATE](true,eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Email',() => {
        it('String Email version-1 should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.EMAIL]('luca@zation.de',eb,{});
            assert(eb.isEmpty());
        });

        it('String Email version-2 should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.EMAIL]('example@gmail.com',eb,{});
            assert(eb.isEmpty());
        });

        it('Email String (without @) should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.EMAIL]("examplegmail.com",eb,{});
            assert(!eb.isEmpty());
        });

        it('Letter String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.EMAIL]("hello",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.EMAIL](1220,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.EMAIL]({},eb,{});
            assert(!eb.isEmpty());
        });

        it('Boolean should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.EMAIL](true,eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Boolean',() => {

        describe('(strict = true)',() => {
            it('Boolean should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.BOOLEAN](true,eb,{},true);
                assert(eb.isEmpty());
            });

            it('0/1 Int should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.BOOLEAN](10,eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.BOOLEAN]("test",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('0/1 String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.BOOLEAN]("0",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.BOOLEAN]("10.23",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.BOOLEAN]({},eb,{},true);
                assert(!eb.isEmpty());
            });
        });

        describe('(strict = false)',() => {
            it('Boolean should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.BOOLEAN](true,eb,{},false);
                assert(eb.isEmpty());
            });

            it('0/1 Int should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.BOOLEAN](1,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.BOOLEAN]("test",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('0/1 String should produce no error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.BOOLEAN]("1",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.BOOLEAN]("10.23",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new TaskErrorBag;
                typeValidator[validationTypes.BOOLEAN]({},eb,{},false);
                assert(!eb.isEmpty());
            });
        });
    });

    describe('SHA512',() => {
        it('Sha 512 string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA512]
            ('9B71D224BD62F3785D96D46AD3EA3D73319BFBC2890CAADAE2DFF72519673CA72323C3D99BA5C11D7C7ACC6E14B8C5DA0C4663475C2E5C3ADEF46F73BCDEC043',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA512]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA512](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA512]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('SHA256',() => {
        it('Sha 256 string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA256]
            ('2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA256]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA256](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA256]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('SHA384',() => {
        it('Sha 384 string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA384]
            ('59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA384]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA384](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA384]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('SHA1',() => {
        it('Sha 1 string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA1]
            ('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA1]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA1](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.SHA1]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('MD5',() => {
        it('MD5 string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.MD5]
            ('5d41402abc4b2a76b9719d911017c592',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.MD5]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.MD5](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.MD5]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('HexColor',() => {
        it('HexColor string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.HEX_COLOR]('#66ff99',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.HEX_COLOR]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.HEX_COLOR](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.HEX_COLOR]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Hexadecimal',() => {
        it('Hexadecimal string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.HEXADECIMAL]('3E8',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.HEXADECIMAL]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.HEXADECIMAL](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.HEXADECIMAL]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Ip4',() => {
        it('Ip4 version-1 string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.IP_4]('198.18.0.0',eb,{});
            assert(eb.isEmpty());
        });

        it('Ip4 version-2 string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.IP_4]('192.168.179.1',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.IP_4]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.IP_4](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.IP_4]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Ip6',() => {
        it('Ip6 string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.IP_6]('2001:0db8:85a3:08d3:1319:8a2e:0370:7344',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.IP_6]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.IP_6](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.IP_6]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('ISBN-10',() => {
        it('ISBN 10 string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.ISBN_10]('3-88229-192-3',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.ISBN_10]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.ISBN_10](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.ISBN_10]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('ISBN-13',() => {
        it('ISBN 13 string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.ISBN_13]('978-3-88229-192-6',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.ISBN_13]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.ISBN_13](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.ISBN_13]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('JSON',() => {
        it('JSON string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.JSON]('{"name":"hello","age":10}',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.JSON]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.JSON](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.JSON]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('URL',() => {
        it('URL string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.URL]('https://www.google.de/?gws_rd=ssl',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.URL]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.URL](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.URL]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('MimeType',() => {
        it('MimeType string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.MIME_TYPE]('application/json',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.MIME_TYPE]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.MIME_TYPE](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.MIME_TYPE]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('MacAddress',() => {
        it('MacAddress string should produce no error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.MAC_ADDRESS]('00:80:41:ae:fd:7e',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.MAC_ADDRESS]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.MAC_ADDRESS](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new TaskErrorBag;
            typeValidator[validationTypes.MAC_ADDRESS]({},eb,{});
            assert(!eb.isEmpty());
        });
    });


});