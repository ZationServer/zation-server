/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const assert             = require("chai").assert;
const BackErrorBag       = require('../../../../dist/lib/api/BackErrorBag').default;
const typeValidator      = require('../../../../dist/lib/main/validator/validatorLibrary').ValidatorLibrary.Types;
const {ValidationTypes}  = require("../../../../dist");
const Base64TestData     = require('../../../testData/base64');

describe('Type Validation',() => {

    describe('Object',() => {
        it('Object should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.OBJECT]({},eb,{});
            assert(eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.OBJECT](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Null should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.OBJECT](null,eb,{});
            assert(!eb.isEmpty());
        });

        it('String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.OBJECT]('hallo',eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Array',() => {
        it('Array should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ARRAY]([],eb,{});
            assert(eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ARRAY](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ARRAY]('hallo',eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ARRAY]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('String',() => {
        it('String should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.STRING]('hallo',eb,{});
            assert(eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.STRING](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.STRING]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Char',() => {
        it('Char should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.CHAR]('t',eb,{});
            assert(eb.isEmpty());
        });

        it('String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.CHAR]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.CHAR](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.CHAR]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Null',() => {
        it('Null should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.NULL](null,eb,{});
            assert(eb.isEmpty());
        });

        it('String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.NULL]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.NULL](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.NULL]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Int',() => {

        describe('(strict = true)',() => {
            it('Int should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.INT](10,eb,{},true);
                assert(eb.isEmpty());
            });

            it('Float should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.INT](10.35,eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.INT]("test",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Int String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.INT]("10",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.INT]("10.40",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.INT]({},eb,{},true);
                assert(!eb.isEmpty());
            });
        });

        describe('(strict = false)',() => {
            it('Int should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.INT](10,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Float should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.INT](10.35,eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.INT]("test",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Int String should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.INT]("10",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.INT]("10.40",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.INT]({},eb,{},false);
                assert(!eb.isEmpty());
            });
        });
    });

    describe('Float',() => {

        describe('(strict = true)',() => {
            it('Float should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.FLOAT](10.45,eb,{},true);
                assert(eb.isEmpty());
            });

            it('Int (with .0) should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.FLOAT](10.0,eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.FLOAT]("test",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Int String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.FLOAT]("10",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.FLOAT]("10.23",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.FLOAT]({},eb,{},true);
                assert(!eb.isEmpty());
            });
        });

        describe('(strict = false)',() => {
            it('Float should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.FLOAT](10.45,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Int (with .0) should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.FLOAT](10.0,eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.FLOAT]("test",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Int String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.FLOAT]("10",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Float String should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.FLOAT]("10.23",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.FLOAT]({},eb,{},false);
                assert(!eb.isEmpty());
            });
        });
    });

    describe('Number',() => {

        describe('(strict = true)',() => {
            it('Float should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.NUMBER](10.45,eb,{},true);
                assert(eb.isEmpty());
            });

            it('Int should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.NUMBER](10,eb,{},true);
                assert(eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.NUMBER]("test",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Int String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.NUMBER]("10",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.NUMBER]("10.23",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.NUMBER]({},eb,{},true);
                assert(!eb.isEmpty());
            });
        });

        describe('(strict = false)',() => {
            it('Float should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.NUMBER](10.45,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Int should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.NUMBER](10,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.NUMBER]("test",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Int String should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.NUMBER]("10",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Float String should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.NUMBER]("10.23",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.NUMBER]({},eb,{},false);
                assert(!eb.isEmpty());
            });
        });
    });

    describe('Date',() => {
        it('String Date version-1 should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.DATE]('Tue Jan 15 2019 00:30:01 GMT+0100 (Mitteleuropäische Normalzeit)',eb,{});
            assert(eb.isEmpty());
        });

        it('String Date version-2 should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.DATE]('12-01-2014',eb,{});
            assert(eb.isEmpty());
        });

        it('Letter String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.DATE]("hello",eb,{});
            assert(!eb.isEmpty());
        });

        it('Small Number should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.DATE](1220,eb,{});
            assert(eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.DATE]({},eb,{});
            assert(!eb.isEmpty());
        });

        it('Boolean should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.DATE](true,eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Email',() => {
        it('String Email version-1 should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.EMAIL]('luca@zation.de',eb,{});
            assert(eb.isEmpty());
        });

        it('String Email version-2 should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.EMAIL]('example@gmail.com',eb,{});
            assert(eb.isEmpty());
        });

        it('Email String (without @) should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.EMAIL]("examplegmail.com",eb,{});
            assert(!eb.isEmpty());
        });

        it('Letter String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.EMAIL]("hello",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.EMAIL](1220,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.EMAIL]({},eb,{});
            assert(!eb.isEmpty());
        });

        it('Boolean should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.EMAIL](true,eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Boolean',() => {

        describe('(strict = true)',() => {
            it('Boolean should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.BOOLEAN](true,eb,{},true);
                assert(eb.isEmpty());
            });

            it('0/1 Int should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.BOOLEAN](10,eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.BOOLEAN]("test",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('0/1 String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.BOOLEAN]("0",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.BOOLEAN]("10.23",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.BOOLEAN]({},eb,{},true);
                assert(!eb.isEmpty());
            });
        });

        describe('(strict = false)',() => {
            it('Boolean should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.BOOLEAN](true,eb,{},false);
                assert(eb.isEmpty());
            });

            it('0/1 Int should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.BOOLEAN](1,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.BOOLEAN]("test",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('0/1 String should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.BOOLEAN]("1",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.BOOLEAN]("10.23",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator[ValidationTypes.BOOLEAN]({},eb,{},false);
                assert(!eb.isEmpty());
            });
        });
    });

    describe('SHA512',() => {
        it('Sha 512 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA512]
            ('9B71D224BD62F3785D96D46AD3EA3D73319BFBC2890CAADAE2DFF72519673CA72323C3D99BA5C11D7C7ACC6E14B8C5DA0C4663475C2E5C3ADEF46F73BCDEC043',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA512]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA512](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA512]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('SHA256',() => {
        it('Sha 256 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA256]
            ('2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA256]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA256](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA256]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('SHA384',() => {
        it('Sha 384 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA384]
            ('59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA384]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA384](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA384]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('SHA1',() => {
        it('Sha 1 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA1]
            ('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA1]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA1](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.SHA1]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('MD5',() => {
        it('MD5 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MD5]
            ('5d41402abc4b2a76b9719d911017c592',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MD5]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MD5](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MD5]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('HexColor',() => {
        it('HexColor string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.HEX_COLOR]('#66ff99',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.HEX_COLOR]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.HEX_COLOR](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.HEX_COLOR]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Hexadecimal',() => {
        it('Hexadecimal string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.HEXADECIMAL]('3E8',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.HEXADECIMAL]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.HEXADECIMAL](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.HEXADECIMAL]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Ip4',() => {
        it('Ip4 version-1 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.IP_4]('198.18.0.0',eb,{});
            assert(eb.isEmpty());
        });

        it('Ip4 version-2 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.IP_4]('192.168.179.1',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.IP_4]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.IP_4](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.IP_4]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Ip6',() => {
        it('Ip6 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.IP_6]('2001:0db8:85a3:08d3:1319:8a2e:0370:7344',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.IP_6]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.IP_6](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.IP_6]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('ISBN-10',() => {
        it('ISBN 10 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ISBN_10]('3-88229-192-3',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ISBN_10]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ISBN_10](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ISBN_10]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('ISBN-13',() => {
        it('ISBN 13 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ISBN_13]('978-3-88229-192-6',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ISBN_13]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ISBN_13](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ISBN_13]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('JSON',() => {
        it('JSON string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.JSON]('{"name":"hello","age":10}',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.JSON]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.JSON](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.JSON]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('URL',() => {
        it('URL string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.URL]('https://www.google.de/?gws_rd=ssl',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.URL]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.URL](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.URL]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('MimeType',() => {
        it('MimeType string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MIME_TYPE]('application/json',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MIME_TYPE]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MIME_TYPE](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MIME_TYPE]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('MacAddress',() => {
        it('MacAddress string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MAC_ADDRESS]('00:80:41:ae:fd:7e',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MAC_ADDRESS]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MAC_ADDRESS](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MAC_ADDRESS]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('MobileNumber',() => {
        it('MobileNumber version-1 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MOBILE_NUMBER]('+447700900068',eb,{});
            assert(eb.isEmpty());
        });

        it('MobileNumber version-2 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MOBILE_NUMBER]('07700 900068',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MOBILE_NUMBER]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MOBILE_NUMBER](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MOBILE_NUMBER]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('UUID-3',() => {
        it('UUID-3 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.UUID_3]('9125a8dc-52ee-365b-a5aa-81b0b3681cf6',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.UUID_3]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.UUID_3](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.UUID_3]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('UUID-4',() => {
        it('UUID-4 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.UUID_4]('10ba038e-48da-487b-96e8-8d3b99b6d18a',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.UUID_4]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.UUID_4](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.UUID_4]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('UUID-5',() => {
        it('UUID-5 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.UUID_5]('fdda765f-fc57-5604-a269-52a7df8164ec',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.UUID_5]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.UUID_5](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.UUID_5]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Base64',() => {
        it('Base64 version-1 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.BASE64](Base64TestData.d1.data,eb,{});
            assert(eb.isEmpty());
        });

        it('Base64 version-2 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.BASE64](Base64TestData.d2.data,eb,{});
            assert(eb.isEmpty());
        });

        it('Number String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.BASE64]("2",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.BASE64](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.BASE64]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('ASCII',() => {
        it('ASCII string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ASCII]('hello',eb,{});
            assert(eb.isEmpty());
        });

        it('No ASCII String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ASCII]("\t\ud83d\ude34",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ASCII](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.ASCII]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('UserId',() => {
        it('String should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.USER_ID]('user3',eb,{});
            assert(eb.isEmpty());
        });

        it('Number should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.USER_ID](1,eb,{});
            assert(eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.USER_ID]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('MongoId',() => {
        it('MongoId string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MONGO_ID]('507f191e810c19729de860ea',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MONGO_ID]("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MONGO_ID](1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.MONGO_ID]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('LatLong',() => {
        it('LatLong string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.LAT_LONG]('22.319589',eb,{});
            assert(eb.isEmpty());
        });

        it('LatLong number should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.LAT_LONG](22.319589,eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.LAT_LONG]("hello",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number 100 should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.LAT_LONG](100,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator[ValidationTypes.LAT_LONG]({},eb,{});
            assert(!eb.isEmpty());
        });
    });

});