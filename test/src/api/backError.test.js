/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const BackError       = require("../../../dist/lib/api/BackError").default;
const assert          = require("chai").assert;
const expect          = require("chai").expect;

describe('API.BackError',() => {

    describe('Constructor',() => {

        it('Default',() => {
            const te = new BackError();
            assert.equal(te.getName(),'BackError');
        });

        it('Overloaded',() => {
            const te = new BackError({name: 'error1'});
            assert.equal(te.getName(),'error1');
        });

        it('Overloaded-2',() => {
            const te = new BackError({name: 'error1',group : 'group2', type : 'type1'});
            assert.equal(te.getName(),'error1');
            assert.equal(te.getGroup(),'group2');
            assert.equal(te.getType(),'type1');
        });

        it('Overloaded-3',() => {
            const te = new BackError({name: 'error1'},'info2');
            assert.equal(te.getName(),'error1');
            assert.equal(te.getInfo().main,'info2');
        });

        it('Overloaded-4',() => {
            const te = new BackError({name: 'error1'},{length : 2});
            assert.equal(te.getName(),'error1');
            assert.deepEqual(te.getInfo(),{length : 2})
        });
    });

    describe('Methods',() => {

        describe('toResponseError',() => {

            it('normal',() => {
                const te = new BackError({name: 'error1'});
                assert.deepEqual(te._toResponseError(true),{ n: 'error1',
                    g: undefined,
                    t: 'NORMAL_ERROR',
                    zs: false,
                    i: {},
                    d: 'No Description define in Error' });

                assert.deepEqual(te._toResponseError(),{ n: 'error1',
                    g: undefined,
                    t: 'NORMAL_ERROR',
                    zs: false,
                    i: {}});
            });

            it('private',() => {
                const te = new BackError({name: 'error1', private : true});
                assert.deepEqual
                (te._toResponseError(true),{ n: 'BackError', t: 'NORMAL_ERROR', zs: false });
            });

        });

        it('setName',() => {
            const te = new BackError({name: 'error1'});
            te.setName('error2');
            assert.equal(te.getName(),'error2');
        });

        it('setGroup',() => {
            const te = new BackError({group : 'g1'});
            te.setGroup('g2');
            assert.equal(te.getGroup(),'g2');
        });

        it('setDescription',() => {
            const te = new BackError({description : 'desc'});
            te.setDescription('desc2');
            assert.equal(te.getDescription(),'desc2');
        });

        it('setType',() => {
            const te = new BackError({type : 't1'});
            te.setType('t2');
            assert.equal(te.getType(),'t2');
        });

        it('setPrivate',() => {
            const te = new BackError({private: false});
            te.setPrivate(true);
            assert(te.isPrivate());
        });

        it('setSendInfo',() => {
            const te = new BackError({sendInfo: false});
            te.setSendInfo(true);
            assert(te.isSendInfo());
        });

        it('setIsFromZationSystem',() => {
            const te = new BackError({fromZationSystem : false});
            te.setFromZationSystem(true);
            assert(te.isFromZationSystem());
        });

        it('setInfo',() => {
            const te = new BackError({},{length : 1});
            te.setInfo({length : 5});
            assert.deepEqual(te.getInfo(),{length : 5});
        });

        it('throw',() => {
            const te = new BackError({},{length : 1});
            expect(() => {
                te.throw();
            }).to.throw();
        });

        it('toString',() => {
            const eb = new BackError({name : 'error1'});
            assert.equal(eb.toString(),'BackError  Name: error1 Group: undefined  Description: No Description define in Error  Type: NORMAL_ERROR  Info: {}  isPrivate:false  isFromZationSystem:false');
        });
    });

});