/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const assert             = require("chai").assert;
const BackErrorBag       = require('../../../../dist/lib/api/BackErrorBag').default;
const typeValidator      = require('../../../../dist/lib/main/validator/validatorLibrary').ValidatorLibrary.Types;
const {ValidationType}   = require("../../../../dist");
const Base64TestData     = require('../../../testData/base64');

describe('Type Validation',() => {

    describe('Object',() => {
        it('Object should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.object({},eb,{});
            assert(eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.object(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Null should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.object(null,eb,{});
            assert(!eb.isEmpty());
        });

        it('String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.object('hallo',eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Array',() => {
        it('Array should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.array([],eb,{});
            assert(eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.array(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.array('hallo',eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.array({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('String',() => {
        it('String should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.string('hallo',eb,{});
            assert(eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.string(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.string({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Char',() => {
        it('Char should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.char('t',eb,{});
            assert(eb.isEmpty());
        });

        it('String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.char("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.char(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.char({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Null',() => {
        it('Null should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.null(null,eb,{});
            assert(eb.isEmpty());
        });

        it('String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.null("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.null(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.null({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Int',() => {

        describe('(strict = true)',() => {
            it('Int should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.int(10,eb,{},true);
                assert(eb.isEmpty());
            });

            it('Float should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.int(10.35,eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.int("test",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Int String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.int("10",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.int("10.40",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.int({},eb,{},true);
                assert(!eb.isEmpty());
            });
        });

        describe('(strict = false)',() => {
            it('Int should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.int(10,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Float should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.int(10.35,eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.int("test",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Int String should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.int("10",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.int("10.40",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.int({},eb,{},false);
                assert(!eb.isEmpty());
            });
        });
    });

    describe('Float',() => {

        describe('(strict = true)',() => {
            it('Float should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.float(10.45,eb,{},true);
                assert(eb.isEmpty());
            });

            it('Int (with .0) should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.float(10.0,eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.float("test",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Int String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.float("10",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.float("10.23",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.float({},eb,{},true);
                assert(!eb.isEmpty());
            });
        });

        describe('(strict = false)',() => {
            it('Float should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.float(10.45,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Int (with .0) should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.float(10.0,eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.float("test",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Int String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.float("10",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Float String should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.float("10.23",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.float({},eb,{},false);
                assert(!eb.isEmpty());
            });
        });
    });

    describe('Number',() => {

        describe('(strict = true)',() => {
            it('Float should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.number(10.45,eb,{},true);
                assert(eb.isEmpty());
            });

            it('Int should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.number(10,eb,{},true);
                assert(eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.number("test",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Int String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.number("10",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.number("10.23",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.number({},eb,{},true);
                assert(!eb.isEmpty());
            });
        });

        describe('(strict = false)',() => {
            it('Float should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.number(10.45,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Int should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.number(10,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.number("test",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Int String should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.number("10",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Float String should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.number("10.23",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.number({},eb,{},false);
                assert(!eb.isEmpty());
            });
        });
    });

    describe('Date',() => {
        it('String Date version-1 should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.date('Tue Jan 15 2019 00:30:01 GMT+0100 (Mitteleuropäische Normalzeit)',eb,{});
            assert(eb.isEmpty());
        });

        it('String Date version-2 should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.date('12-01-2014',eb,{});
            assert(eb.isEmpty());
        });

        it('Letter String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.date("hello",eb,{});
            assert(!eb.isEmpty());
        });

        it('Small Number should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.date(1220,eb,{});
            assert(eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.date({},eb,{});
            assert(!eb.isEmpty());
        });

        it('Boolean should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.date(true,eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Email',() => {
        it('String Email version-1 should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.email('luca@zation.de',eb,{});
            assert(eb.isEmpty());
        });

        it('String Email version-2 should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.email('example@gmail.com',eb,{});
            assert(eb.isEmpty());
        });

        it('Email String (without @) should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.email("examplegmail.com",eb,{});
            assert(!eb.isEmpty());
        });

        it('Letter String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.email("hello",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.email(1220,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.email({},eb,{});
            assert(!eb.isEmpty());
        });

        it('Boolean should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.email(true,eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Boolean',() => {

        describe('(strict = true)',() => {
            it('Boolean should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.boolean(true,eb,{},true);
                assert(eb.isEmpty());
            });

            it('0/1 Int should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.boolean(10,eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.boolean("test",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('0/1 String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.boolean("0",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.boolean("10.23",eb,{},true);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.boolean({},eb,{},true);
                assert(!eb.isEmpty());
            });
        });

        describe('(strict = false)',() => {
            it('Boolean should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.boolean(true,eb,{},false);
                assert(eb.isEmpty());
            });

            it('0/1 Int should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.boolean(1,eb,{},false);
                assert(eb.isEmpty());
            });

            it('Letter String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.boolean("test",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('0/1 String should produce no error',() => {
                const eb = new BackErrorBag;
                typeValidator.boolean("1",eb,{},false);
                assert(eb.isEmpty());
            });

            it('Float String should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.boolean("10.23",eb,{},false);
                assert(!eb.isEmpty());
            });

            it('Object should produce an error',() => {
                const eb = new BackErrorBag;
                typeValidator.boolean({},eb,{},false);
                assert(!eb.isEmpty());
            });
        });
    });

    describe('SHA512',() => {
        it('Sha 512 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha512
            ('9B71D224BD62F3785D96D46AD3EA3D73319BFBC2890CAADAE2DFF72519673CA72323C3D99BA5C11D7C7ACC6E14B8C5DA0C4663475C2E5C3ADEF46F73BCDEC043',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha512("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha512(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha512({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('SHA256',() => {
        it('Sha 256 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha256
            ('2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha256("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha256(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha256({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('SHA384',() => {
        it('Sha 384 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha384
            ('59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha384("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha384(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha384({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('SHA1',() => {
        it('Sha 1 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha1
            ('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha1("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha1(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.sha1({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('MD5',() => {
        it('MD5 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.md5
            ('5d41402abc4b2a76b9719d911017c592',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.md5("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.md5(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.md5({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('HexColor',() => {
        it('HexColor string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.hexColor('#66ff99',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.hexColor("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.hexColor(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.hexColor({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Hexadecimal',() => {
        it('Hexadecimal string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.hexadecimal('3E8',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.hexadecimal("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.hexadecimal(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.hexadecimal({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Ip4',() => {
        it('Ip4 version-1 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.ip4('198.18.0.0',eb,{});
            assert(eb.isEmpty());
        });

        it('Ip4 version-2 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.ip4('192.168.179.1',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.ip4("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.ip4(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.ip4({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Ip6',() => {
        it('Ip6 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.ip6('2001:0db8:85a3:08d3:1319:8a2e:0370:7344',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.ip6("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.ip6(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.ip6({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('ISBN-10',() => {
        it('ISBN 10 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.isbn10('3-88229-192-3',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.isbn10("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.isbn10(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.isbn10({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('ISBN-13',() => {
        it('ISBN 13 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.isbn13('978-3-88229-192-6',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.isbn13("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.isbn13(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.isbn13({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('JSON',() => {
        it('JSON string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.json('{"name":"hello","age":10}',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.json("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.json(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.json({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('URL',() => {
        it('URL string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.url('https://www.google.de/?gws_rd=ssl',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.url("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.url(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.url({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('MimeType',() => {
        it('MimeType string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.mimeType('application/json',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.mimeType("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.mimeType(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.mimeType({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('MacAddress',() => {
        it('MacAddress string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.macAddress('00:80:41:ae:fd:7e',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.macAddress("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.macAddress(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.macAddress({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('MobileNumber',() => {
        it('MobileNumber version-1 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.mobileNumber('+447700900068',eb,{});
            assert(eb.isEmpty());
        });

        it('MobileNumber version-2 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.mobileNumber('07700 900068',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.mobileNumber("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.mobileNumber(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.mobileNumber({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('UUID-3',() => {
        it('UUID-3 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.uuid3('9125a8dc-52ee-365b-a5aa-81b0b3681cf6',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.uuid3("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.uuid3(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.uuid3({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('UUID-4',() => {
        it('UUID-4 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.uuid4('10ba038e-48da-487b-96e8-8d3b99b6d18a',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.uuid4("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.uuid4(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.uuid4({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('UUID-5',() => {
        it('UUID-5 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.uuid5('fdda765f-fc57-5604-a269-52a7df8164ec',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.uuid5("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.uuid5(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.uuid5({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('Base64',() => {
        it('Base64 version-1 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.base64(Base64TestData.d1.data,eb,{});
            assert(eb.isEmpty());
        });

        it('Base64 version-2 string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.base64(Base64TestData.d2.data,eb,{});
            assert(eb.isEmpty());
        });

        it('Number String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.base64("2",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.base64(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.base64({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('ASCII',() => {
        it('ASCII string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.ascii('hello',eb,{});
            assert(eb.isEmpty());
        });

        it('No ASCII String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.ascii("\t\ud83d\ude34",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.ascii(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.ascii({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('UserId',() => {
        it('String should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.userId('user3',eb,{});
            assert(eb.isEmpty());
        });

        it('Number should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.userId(1,eb,{});
            assert(eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.userId({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('MongoId',() => {
        it('MongoId string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.mongoId('507f191e810c19729de860ea',eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.mongoId("test",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.mongoId(1,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.mongoId({},eb,{});
            assert(!eb.isEmpty());
        });
    });

    describe('LatLong',() => {
        it('LatLong string should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.latLong('22.319589',eb,{});
            assert(eb.isEmpty());
        });

        it('LatLong number should produce no error',() => {
            const eb = new BackErrorBag;
            typeValidator.latLong(22.319589,eb,{});
            assert(eb.isEmpty());
        });

        it('Hello String should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.latLong("hello",eb,{});
            assert(!eb.isEmpty());
        });

        it('Number 100 should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.latLong(100,eb,{});
            assert(!eb.isEmpty());
        });

        it('Object should produce an error',() => {
            const eb = new BackErrorBag;
            typeValidator.latLong({},eb,{});
            assert(!eb.isEmpty());
        });
    });

});