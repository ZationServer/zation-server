/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const assert             = require("chai").assert;
const BackErrorBag       = require('../../../../../dist/lib/api/BackErrorBag').default;
const typeValidator      = require('../../../../../dist/lib/main/models/validator/validatorLibrary').ValidatorLibrary.Types;
const Base64TestData     = require('../../../../testData/base64');

describe('Type Validation',() => {

    describe('Object',() => {
        it('Object should produce true',() => {
            assert(typeValidator.object(true)({}));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.object(true)(1));
        });

        it('Null should produce false',() => {
            assert(!typeValidator.object(true)(null));
        });

        it('String should produce false',() => {
            assert(!typeValidator.object(true)('hallo'));
        });
    });

    describe('Array',() => {
        it('Array should produce true',() => {
            assert(typeValidator.array(true)([]));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.array(true)(1));
        });

        it('String should produce false',() => {
            assert(!typeValidator.array(true)('hallo'));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.array(true)({}));
        });
    });

    describe('String',() => {
        it('String should produce true',() => {
            assert(typeValidator.string(true)('hallo'));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.string(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.string(true)({}));
        });
    });

    describe('Char',() => {
        it('Char should produce true',() => {
            assert(typeValidator.char(true)('t'));
        });

        it('String should produce false',() => {
            assert(!typeValidator.char(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.char(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.char(true)({}));
        });
    });

    describe('Null',() => {
        it('Null should produce true',() => {
            assert(typeValidator.null(true)(null));
        });

        it('String should produce false',() => {
            assert(!typeValidator.null(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.null(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.null(true)({}));
        });
    });

    describe('Int',() => {
        describe('(strict = true)',() => {
            it('Int should produce true',() => {
                assert(typeValidator.int(true)(10));
            });

            it('Float should produce false',() => {
                assert(!typeValidator.int(true)(10.35));
            });

            it('Letter String should produce false',() => {
                assert(!typeValidator.int(true)("test"));
            });

            it('Int String should produce false',() => {
                assert(!typeValidator.int(true)("10"));
            });

            it('Float String should produce false',() => {
                assert(!typeValidator.int(true)("10.40"));
            });

            it('Object should produce false',() => {
                assert(!typeValidator.int(true)({}));
            });
        });

        describe('(strict = false)',() => {
            it('Int should produce true',() => {
                assert(typeValidator.int(false)(10));
            });

            it('Float should produce false',() => {
                assert(!typeValidator.int(false)(10.35));
            });

            it('Letter String should produce false',() => {
                assert(!typeValidator.int(false)("test"));
            });

            it('Int String should produce true',() => {
                assert(typeValidator.int(false)("10"));
            });

            it('Float String should produce false',() => {
                assert(!typeValidator.int(false)("10.40"));
            });

            it('Object should produce false',() => {
                assert(!typeValidator.int(false)({}));
            });
        });
    });

    describe('Float',() => {

        describe('(strict = true)',() => {
            it('Float should produce true',() => {
                assert(typeValidator.float(true)(10.45));
            });

            it('Int (with .0) should produce false',() => {
                assert(!typeValidator.float(true)(10.0));
            });

            it('Letter String should produce false',() => {
                assert(!typeValidator.float(true)("test"));
            });

            it('Int String should produce false',() => {
                assert(!typeValidator.float(true)("10"));
            });

            it('Float String should produce false',() => {
                assert(!typeValidator.float(true)("10.23"));
            });

            it('Object should produce false',() => {
                assert(!typeValidator.float(true)({}));
            });
        });

        describe('(strict = false)',() => {
            it('Float should produce true',() => {
                assert(typeValidator.float(false)(10.45));
            });

            it('Int (with .0) should produce false',() => {
                assert(!typeValidator.float(false)(10.0));
            });

            it('Letter String should produce false',() => {
                assert(!typeValidator.float(false)("test"));
            });

            it('Int String should produce false',() => {
                assert(!typeValidator.float(false)("10"));
            });

            it('Float String should produce true',() => {
                assert(typeValidator.float(false)("10.23"));
            });

            it('Object should produce false',() => {
                assert(!typeValidator.float(false)({}));
            });
        });
    });

    describe('Number',() => {

        describe('(strict = true)',() => {
            it('Float should produce true',() => {
                assert(typeValidator.number(true)(10.45));
            });

            it('Int should produce true',() => {
                assert(typeValidator.number(true)(10));
            });

            it('Letter String should produce false',() => {
                assert(!typeValidator.number(true)("test"));
            });

            it('Int String should produce false',() => {
                assert(!typeValidator.number(true)("10"));
            });

            it('Float String should produce false',() => {
                assert(!typeValidator.number(true)("10.23"));
            });

            it('Object should produce false',() => {
                assert(!typeValidator.number(true)({}));
            });
        });

        describe('(strict = false)',() => {
            it('Float should produce true',() => {
                assert(typeValidator.number(false)(10.45));
            });

            it('Int should produce true',() => {
                assert(typeValidator.number(false)(10));
            });

            it('Letter String should produce false',() => {
                assert(!typeValidator.number(false)("test"));
            });

            it('Int String should produce true',() => {
                assert(typeValidator.number(false)("10"));
            });

            it('Float String should produce true',() => {
                assert(typeValidator.number(false)("10.23"));
            });

            it('Object should produce false',() => {
                assert(!typeValidator.number(false)({}));
            });
        });
    });

    describe('Date',() => {
        it('String Date version-1 should produce true',() => {
            assert(typeValidator.date(true)('Tue Jan 15 2019 00:30:01 GMT+0100 (Mitteleuropäische Normalzeit)'));
        });

        it('String Date version-2 should produce true',() => {
            assert(typeValidator.date(true)('12-01-2014'));
        });

        it('Letter String should produce false',() => {
            assert(!typeValidator.date(true)("hello"));
        });

        it('Small Number should produce true',() => {
            assert(typeValidator.date(true)(1220));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.date(true)({}));
        });

        it('Boolean should produce false',() => {
            assert(!typeValidator.date(true)(true));
        });
    });

    describe('Email',() => {
        it('String Email version-1 should produce true',() => {
            assert(typeValidator.email(true)('luca@zation.de'));
        });

        it('String Email version-2 should produce true',() => {
            assert(typeValidator.email(true)('example@gmail.com'));
        });

        it('Email String (without @) should produce false',() => {
            assert(!typeValidator.email(true)("examplegmail.com"));
        });

        it('Letter String should produce false',() => {
            assert(!typeValidator.email(true)("hello"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.email(true)(1220));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.email(true)({}));
        });

        it('Boolean should produce false',() => {
            assert(!typeValidator.email(true)(true));
        });
    });

    describe('Boolean',() => {

        describe('(strict = true)',() => {
            it('Boolean should produce true',() => {
                assert(typeValidator.boolean(true)(true));
            });

            it('0/1 Int should produce false',() => {
                assert(!typeValidator.boolean(true)(10));
            });

            it('Letter String should produce false',() => {
                assert(!typeValidator.boolean(true)("test"));
            });

            it('0/1 String should produce false',() => {
                assert(!typeValidator.boolean(true)("0"));
            });

            it('Float String should produce false',() => {
                assert(!typeValidator.boolean(true)("10.23"));
            });

            it('Object should produce false',() => {
                assert(!typeValidator.boolean(true)({}));
            });
        });

        describe('(strict = false)',() => {
            it('Boolean should produce true',() => {
                assert(typeValidator.boolean(false)(true));
            });

            it('0/1 Int should produce true',() => {
                assert(typeValidator.boolean(false)(1));
            });

            it('Letter String should produce false',() => {
                assert(!typeValidator.boolean(false)("test"));
            });

            it('0/1 String should produce true',() => {
                assert(typeValidator.boolean(false)("1"));
            });

            it('Float String should produce false',() => {
                assert(!typeValidator.boolean(false)("10.23"));
            });

            it('Object should produce false',() => {
                assert(!typeValidator.boolean(false)({}));
            });
        });
    });

    describe('SHA512',() => {
        it('Sha 512 string should produce true',() => {
            assert(typeValidator.sha512(true)('9B71D224BD62F3785D96D46AD3EA3D73319BFBC2890CAADAE2DFF72519673CA72323C3D99BA5C11D7C7ACC6E14B8C5DA0C4663475C2E5C3ADEF46F73BCDEC043'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.sha512(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.sha512(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.sha512(true)({}));
        });
    });

    describe('SHA256',() => {
        it('Sha 256 string should produce true',() => {
            assert(typeValidator.sha256(true)('2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.sha256(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.sha256(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.sha256(true)({}));
        });
    });

    describe('SHA384',() => {
        it('Sha 384 string should produce true',() => {
            assert(typeValidator.sha384(true)('59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.sha384(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.sha384(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.sha384(true)({}));
        });
    });

    describe('SHA1',() => {
        it('Sha 1 string should produce true',() => {
            assert(typeValidator.sha1(true)('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.sha1(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.sha1(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.sha1(true)({}));
        });
    });

    describe('MD5',() => {
        it('MD5 string should produce true',() => {
            assert(typeValidator.md5(true)('5d41402abc4b2a76b9719d911017c592'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.md5(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.md5(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.md5(true)({}));
        });
    });

    describe('HexColor',() => {
        it('HexColor string should produce true',() => {
            assert(typeValidator.hexColor(true)('#66ff99'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.hexColor(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.hexColor(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.hexColor(true)({}));
        });
    });

    describe('Hexadecimal',() => {
        it('Hexadecimal string should produce true',() => {
            assert(typeValidator.hexadecimal(true)('3E8'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.hexadecimal(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.hexadecimal(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.hexadecimal(true)({}));
        });
    });

    describe('Ip4',() => {
        it('Ip4 version-1 string should produce true',() => {
            assert(typeValidator.ip4(true)('198.18.0.0'));
        });

        it('Ip4 version-2 string should produce true',() => {
            assert(typeValidator.ip4(true)('192.168.179.1'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.ip4(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.ip4(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.ip4(true)({}));
        });
    });

    describe('Ip6',() => {
        it('Ip6 string should produce true',() => {
            assert(typeValidator.ip6(true)('2001:0db8:85a3:08d3:1319:8a2e:0370:7344'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.ip6(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.ip6(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.ip6(true)({}));
        });
    });

    describe('ISBN-10',() => {
        it('ISBN 10 string should produce true',() => {
            assert(typeValidator.isbn10(true)('3-88229-192-3'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.isbn10(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.isbn10(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.isbn10(true)({}));
        });
    });

    describe('ISBN-13',() => {
        it('ISBN 13 string should produce true',() => {
            assert(typeValidator.isbn13(true)('978-3-88229-192-6'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.isbn13(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.isbn13(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.isbn13(true)({}));
        });
    });

    describe('JSON',() => {
        it('JSON string should produce true',() => {
            assert(typeValidator.json(true)('{"name":"hello","age":10}'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.json(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.json(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.json(true)({}));
        });
    });

    describe('URL',() => {
        it('URL string should produce true',() => {
            assert(typeValidator.url(true)('https://www.google.de/?gws_rd=ssl'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.url(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.url(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.url(true)({}));
        });
    });

    describe('MimeType',() => {
        it('MimeType string should produce true',() => {
            assert(typeValidator.mimeType(true)('application/json'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.mimeType(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.mimeType(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.mimeType(true)({}));
        });
    });

    describe('MacAddress',() => {
        it('MacAddress string should produce true',() => {
            assert(typeValidator.macAddress(true)('00:80:41:ae:fd:7e'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.macAddress(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.macAddress(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.macAddress(true)({}));
        });
    });

    describe('MobileNumber',() => {
        it('MobileNumber version-1 string should produce true',() => {
            assert(typeValidator.mobileNumber(true)('+447700900068'));
        });

        it('MobileNumber version-2 string should produce true',() => {
            assert(typeValidator.mobileNumber(true)('07700 900068'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.mobileNumber(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.mobileNumber(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.mobileNumber(true)({}));
        });
    });

    describe('UUID-3',() => {
        it('UUID-3 string should produce true',() => {
            assert(typeValidator.uuid3(true)('9125a8dc-52ee-365b-a5aa-81b0b3681cf6'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.uuid3(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.uuid3(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.uuid3(true)({}));
        });
    });

    describe('UUID-4',() => {
        it('UUID-4 string should produce true',() => {
            assert(typeValidator.uuid4(true)('10ba038e-48da-487b-96e8-8d3b99b6d18a'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.uuid4(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.uuid4(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.uuid4(true)({}));
        });
    });

    describe('UUID-5',() => {
        it('UUID-5 string should produce true',() => {
            assert(typeValidator.uuid5(true)('fdda765f-fc57-5604-a269-52a7df8164ec'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.uuid5(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.uuid5(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.uuid5(true)({}));
        });
    });

    describe('Base64',() => {
        it('Base64 version-1 string should produce true',() => {
            assert(typeValidator.base64(true)(Base64TestData.d1.data));
        });

        it('Base64 version-2 string should produce true',() => {
            assert(typeValidator.base64(true)(Base64TestData.d2.data));
        });

        it('Number String should produce false',() => {
            assert(!typeValidator.base64(true)("2"));
        });

        it('Broken String should produce false',() => {
            assert(!typeValidator.base64(true)("data:image/png;base64,iVB"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.base64(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.base64(true)({}));
        });
    });

    describe('ASCII',() => {
        it('ASCII string should produce true',() => {
            assert(typeValidator.ascii(true)('hello'));
        });

        it('No ASCII String should produce false',() => {
            assert(!typeValidator.ascii(true)("\t\ud83d\ude34"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.ascii(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.ascii(true)({}));
        });
    });

    describe('UserId',() => {
        it('String should produce true',() => {
            assert(typeValidator.userId(true)('user3'));
        });

        it('Number should produce true',() => {
            assert(typeValidator.userId(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.userId(true)({}));
        });
    });

    describe('MongoId',() => {
        it('MongoId string should produce true',() => {
            assert(typeValidator.mongoId(true)('507f191e810c19729de860ea'));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.mongoId(true)("test"));
        });

        it('Number should produce false',() => {
            assert(!typeValidator.mongoId(true)(1));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.mongoId(true)({}));
        });
    });

    describe('LatLong',() => {
        it('LatLong number should produce true',() => {
            assert(typeValidator.latLong(true)(22.319589));
        });

        it('Hello String should produce false',() => {
            assert(!typeValidator.latLong(true)("hello"));
        });

        it('Number 100 should produce false',() => {
            assert(!typeValidator.latLong(true)(100));
        });

        it('Object should produce false',() => {
            assert(!typeValidator.latLong(true)({}));
        });
    });

});