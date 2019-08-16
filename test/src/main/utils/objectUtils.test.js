/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const ObjectUtils     = require("../../../../dist/lib/main/utils/objectUtils").default;
const assert          = require("chai").assert;

describe('MAIN.UTILS.ObjectUtils',() => {

    describe('Methods',() => {

        it('MergeObjects test-1',() => {

            const obj1 = {
                name : 'luca',
                age : 19,
            };
            const obj2 = {
                hello : 'hello',
                age : 10
            };
            const obj3 = {
                foo : 'foo',
                name : 'peter'
            };

            assert.deepEqual(ObjectUtils.mergeObjects([obj1,obj2,obj3]),{
                name : 'luca',
                age : 19,
                hello : 'hello',
                foo : 'foo'
            });

        });

        it('MergeObjects test-2',() => {
            assert.deepEqual(ObjectUtils.mergeObjects([]),{});
        });

        it('MergeObjects test-3',() => {
            assert.deepEqual(ObjectUtils.mergeObjects([{hello : 'hello'}]),{hello : 'hello'});
        });

        it('MergeObjects test-4',() => {

            const obj1 = {
                name : 'luca',
                age : 19,
                testData : {
                    yeah : 'yeah'
                }
            };
            const obj2 = {
                hello : 'hello',
                age : 10
            };
            const obj3 = {
                foo : 'foo',
                name : 'peter',
                testData: {
                    yo : 'yo'
                }
            };

            assert.deepEqual(ObjectUtils.mergeObjects([obj1,obj2,obj3]),{
                name : 'luca',
                age : 19,
                hello : 'hello',
                foo : 'foo',
                testData : {
                    yeah : 'yeah',
                    yo : 'yo'
                }
            });

        });

        it('AddObToOb',() => {

            const obj1 = {
                name : 'luca',
                age : 19,
            };
            const obj2 = {
                hello : 'hello',
                age : 10
            };

            ObjectUtils.addObToOb(obj1,obj2,true);
            assert.deepEqual(obj1,{
                name : 'luca',
                age : 10,
                hello : 'hello'
            });

        });

        it('OnlyAddObToOb',() => {

            const obj1 = {
                name : 'luca',
                age : 19,
            };
            const obj2 = {
                hello : 'hello',
                hello2 : 'hello2'
            };

            ObjectUtils.onlyAddObToOb(obj1,obj2,true,{hello:''});
            assert.deepEqual(obj1,{
                name : 'luca',
                age : 19,
                hello : 'hello'
            });

        });

        it('GetObjValues',() => {

            const obj1 = {
                name : 'luca',
                age : 19,
            };
            assert.deepEqual(ObjectUtils.getObjValues(obj1),['luca',19]);
        });

        it('HasOneOf',() => {

            const obj1 = {
                name : 'luca',
                age : 19,
            };

            assert(ObjectUtils.hasOneOf(obj1,['name']));
            assert.isFalse(ObjectUtils.hasOneOf(obj1,['hello']));
        });

        it('GetFoundKeys',() => {

            const obj1 = {
                name : 'luca',
                age : 19,
            };
            assert.deepEqual(ObjectUtils.getFoundKeys(obj1,['name']),['name']);
            assert.deepEqual(ObjectUtils.getFoundKeys(obj1,['hello']),[]);
        });

    });

});