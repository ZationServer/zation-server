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
            assert.equal(be.getName(),'BackError');
        });

        it('Overloaded',() => {
            const be = new BackError({name: 'error1'});
            assert.equal(be.getName(),'error1');
        });

        it('Overloaded-2',() => {
            const be = new BackError({name: 'error1',group : 'group2', type : 'type1'});
            assert.equal(be.getName(),'error1');
            assert.equal(be.getGroup(),'group2');
            assert.equal(be.getType(),'type1');
        });

        it('Overloaded-3',() => {
            const be = new BackError({name: 'error1'},'info2');
            assert.equal(be.getName(),'error1');
            assert.equal(be.getInfo().main,'info2');
        });

        it('Overloaded-4',() => {
            const be = new BackError({name: 'error1'},{length : 2});
            assert.equal(be.getName(),'error1');
            assert.deepEqual(be.getInfo(),{length : 2})
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
                    d: 'No Description defined in Error' });

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

        it('setName',() => {
            const be = new BackError({name: 'error1'});
            be.setName('error2');
            assert.equal(be.getName(),'error2');
        });

        it('setGroup',() => {
            const be = new BackError({group : 'g1'});
            be.setGroup('g2');
            assert.equal(be.getGroup(),'g2');
        });

        it('setDescription',() => {
            const be = new BackError({description : 'desc'});
            be.setDescription('desc2');
            assert.equal(be.getDescription(),'desc2');
        });

        it('setType',() => {
            const be = new BackError({type : 't1'});
            be.setType('t2');
            assert.equal(be.getType(),'t2');
        });

        it('setPrivate',() => {
            const be = new BackError({private: false});
            be.setPrivate(true);
            assert(be.isPrivate());
        });

        it('setSendInfo',() => {
            const be = new BackError({sendInfo: false});
            be.setSendInfo(true);
            assert(be.isSendInfo());
        });

        it('setIsCustom',() => {
            const be = new BackError({custom: true});
            be.setCustom(false);
            assert(!be.isCustom());
        });

        it('setInfo',() => {
            const be = new BackError({},{length : 1});
            be.setInfo({length : 5});
            assert.deepEqual(be.getInfo(),{length : 5});
        });

        it('throw',() => {
            const be = new BackError({},{length : 1});
            expect(() => {
                be.throw();
            }).to.throw();
        });

        it('toString',() => {
            const eb = new BackError({name : 'error1'});
            assert.equal(eb.toString(),'BackError  Name: error1 Group: undefined  Description: No Description defined in Error  Type: NormalError  Info: {}  Private: false  Custom: true');
        });
    });

});