const assert          = require("chai").assert;
const expect          = require("chai").expect;
const TaskError       = require('../../../dist/lib/api/TaskError');

describe('API.TaskError',() => {

    describe('Constructor',() => {

        it('Default',() => {
            const te = new TaskError();
            assert.equal(te.getName(),'TaskError');
        });

        it('Overloaded',() => {
            const te = new TaskError({name: 'error1'});
            assert.equal(te.getName(),'error1');
        });

        it('Overloaded-2',() => {
            const te = new TaskError({name: 'error1',group : 'group2', type : 'type1'});
            assert.equal(te.getName(),'error1');
            assert.equal(te.getGroup(),'group2');
            assert.equal(te.getType(),'type1');
        });

        it('Overloaded-3',() => {
            const te = new TaskError({name: 'error1'},'info2');
            assert.equal(te.getName(),'error1');
            assert.equal(te.getInfo().main,'info2');
        });

        it('Overloaded-4',() => {
            const te = new TaskError({name: 'error1'},{length : 2});
            assert.equal(te.getName(),'error1');
            assert.deepEqual(te.getInfo(),{length : 2})
        });
    });

    describe('Methods',() => {

        describe('getJsonObject',() => {

            it('normal',() => {
                const te = new TaskError({name: 'error1'});
                assert.deepEqual(te._getJsonObj(true),{ n: 'error1',
                    g: undefined,
                    t: 'NORMAL_ERROR',
                    zs: false,
                    i: {},
                    d: 'No Description define in Error' });

                assert.deepEqual(te._getJsonObj(),{ n: 'error1',
                    g: undefined,
                    t: 'NORMAL_ERROR',
                    zs: false,
                    i: {}});
            });

            it('private',() => {
                const te = new TaskError({name: 'error1', private : true});
                assert.deepEqual
                (te._getJsonObj(true),{ n: 'TaskError', t: 'NORMAL_ERROR', zs: false });
            });

        });

        it('setName',() => {
            const te = new TaskError({name: 'error1'});
            te.setName('error2');
            assert.equal(te.getName(),'error2');
        });

        it('setGroup',() => {
            const te = new TaskError({group : 'g1'});
            te.setGroup('g2');
            assert.equal(te.getGroup(),'g2');
        });

        it('setDescription',() => {
            const te = new TaskError({description : 'desc'});
            te.setDescription('desc2');
            assert.equal(te.getDescription(),'desc2');
        });

        it('setType',() => {
            const te = new TaskError({type : 't1'});
            te.setType('t2');
            assert.equal(te.getType(),'t2');
        });

        it('setPrivate',() => {
            const te = new TaskError({private: false});
            te.setPrivate(true);
            assert(te.isPrivate());
        });

        it('setSendInfo',() => {
            const te = new TaskError({sendInfo: false});
            te.setSendInfo(true);
            assert(te.isSendInfo());
        });

        it('setIsFromZationSystem',() => {
            const te = new TaskError({fromZationSystem : false});
            te.setFromZationSystem(true);
            assert(te.isFromZationSystem());
        });

        it('setInfo',() => {
            const te = new TaskError({},{length : 1});
            te.setInfo({length : 5});
            assert.deepEqual(te.getInfo(),{length : 5});
        });

        it('throw',() => {
            const te = new TaskError({},{length : 1});
            expect(() => {
                te.throw();
            }).to.throw();
        });

        it('toString',() => {
            const eb = new TaskError({name : 'error1'});
            assert.equal(eb.toString(),'TaskError  Name: error1 Group: undefined  Description: No Description define in Error  Type: NORMAL_ERROR  Info: {}  isPrivate:false  isFromZationSystem:false');
        });
    });

});