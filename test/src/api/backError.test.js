/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const BackError       = require("../../../dist/lib/api/BackError").default;
const assert          = require("chai").assert;
const expect          = require("chai").expect;

describe('Api.BackError',() => {

    describe('Constructor',() => {

        it('Default',() => {
            const be = new BackError();
            assert.equal(be.name,'BackError');
        });

        it('Overloaded',() => {
            const be = new BackError({name: 'error1'});
            assert.equal(be.name,'error1');
        });

        it('Overloaded-2',() => {
            const be = new BackError({name: 'error1',group : 'group2', type : 'type1'});
            assert.equal(be.name,'error1');
            assert.equal(be.group,'group2');
            assert.equal(be.type,'type1');
        });

        it('Overloaded-3',() => {
            const be = new BackError({name: 'error1'},{length : 2});
            assert.equal(be.name,'error1');
            assert.deepEqual(be.info,{length : 2})
        });
    });

    describe('Methods',() => {

        describe('dehydrate',() => {

            it('normal',() => {
                const be = new BackError({name: 'error1'});
                assert.deepEqual(be._dehydrate(true),{ n: 'error1',
                    g: undefined,
                    t: 'NormalError',
                    c: 1,
                    i: {},
                    d: undefined });

                assert.deepEqual(be._dehydrate(),{ n: 'error1',
                    g: undefined,
                    t: 'NormalError',
                    c: 1,
                    i: {}});
            });

            it('private',() => {
                const be = new BackError({name: 'error1', private : true});
                assert.deepEqual
                (be._dehydrate(true),{ n: 'BackError', t: 'NormalError', c: 1 });
            });

        });

        it('throw',() => {
            const be = new BackError({},{length : 1});
            expect(() => {
                be.throw();
            }).to.throw();
        });

        it('toString',() => {
            const eb = new BackError({name : 'error1'});
            assert.equal(eb.toString(),'BackError -> Name: "error1" Group: "undefined" Description: "undefined" Type: "NormalError" Info: "{}" Private: "false" Custom: "true"');
        });
    });

});