const assert          = require("chai").assert;
const ObjectTools       = require('../../../../dist/lib/helper/tools/objectTools');

describe('HELPER.TOOLS.ObjectTools',() => {

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

            assert.deepEqual(ObjectTools.mergeObjects([obj1,obj2,obj3]),{
                name : 'luca',
                age : 19,
                hello : 'hello',
                foo : 'foo'
            });

        });

        it('MergeObjects test-2',() => {
            assert.deepEqual(ObjectTools.mergeObjects([]),{});
        });

        it('MergeObjects test-3',() => {
            assert.deepEqual(ObjectTools.mergeObjects([{hello : 'hello'}]),{hello : 'hello'});
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

            assert.deepEqual(ObjectTools.mergeObjects([obj1,obj2,obj3]),{
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

            ObjectTools.addObToOb(obj1,obj2,true);
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

            ObjectTools.onlyAddObToOb(obj1,obj2,true,{hello:''});
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
            assert.deepEqual(ObjectTools.getObjValues(obj1),['luca',19]);
        });

        it('HasOneOf',() => {

            const obj1 = {
                name : 'luca',
                age : 19,
            };

            assert(ObjectTools.hasOneOf(obj1,['name']));
            assert.isFalse(ObjectTools.hasOneOf(obj1,['hello']));
        });

        it('GetFoundKeys',() => {

            const obj1 = {
                name : 'luca',
                age : 19,
            };
            assert.deepEqual(ObjectTools.getFoundKeys(obj1,['name']),['name']);
            assert.deepEqual(ObjectTools.getFoundKeys(obj1,['hello']),[]);
        });

    });

});