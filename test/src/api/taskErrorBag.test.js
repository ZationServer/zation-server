const assert          = require("chai").assert;
const expect          = require("chai").expect;
const TaskErrorBag    = require('../../../dist/lib/api/TaskErrorBag');
const TaskError       = require('../../../dist/lib/api/TaskError');

describe('API.TaskErrorBag',() => {

    describe('Constructor',() => {

        it('Default',() => {
            const eb = new TaskErrorBag();
            assert(eb.isEmpty());
        });

        it('Overloaded',() => {
            const eb = new TaskErrorBag(new TaskError({name : 'test1'}));
            assert(!eb.isEmpty());
        });
    });

    describe('Methods',() => {

       it('IsEmpty',() => {
           const eb = new TaskErrorBag();
           assert(eb.isEmpty());
           eb.addTaskError(new TaskError());
           assert(!eb.isEmpty());
       });

        it('IsNotEmpty',() => {
            const eb = new TaskErrorBag();
            assert(!eb.isNotEmpty());
            eb.addTaskError(new TaskError());
            assert(eb.isNotEmpty());
        });

        it('AddTaskError',() => {
            const eb = new TaskErrorBag();
            eb.addTaskError(new TaskError({name : 'error1'}));
            assert.equal(eb.getTaskErrors()[0].name,'error1');
        });

        it('AddNewTaskError',() => {
            const eb = new TaskErrorBag();
            eb.addNewTaskError({name : 'error1'});
            assert.equal(eb.getTaskErrors()[0].name,'error1');
        });

        it('GetJsonObj',() => {
            const eb = new TaskErrorBag();
            eb.addNewTaskError({name : 'error1'});
            const json = eb._getJsonObj(true);
            // noinspection JSCheckFunctionSignatures
            assert.sameDeepMembers(json, [ { n: 'error1',
                g: undefined,
                t: 'NORMAL_ERROR',
                zs: false,
                i: {},
                d: 'No Description define in Error' } ]
            );
        });

        it('AddFromTaskErrorBag',() => {
            const eb1 = new TaskErrorBag(new TaskError({name : 'test1'}));
            const eb2 = new TaskErrorBag();
            eb2.addFromTaskErrorBag(eb1);
            assert.equal(eb2.getTaskErrors()[0],eb1.getTaskErrors()[0]);
        });

        it('emptyBag',() => {
            const eb = new TaskErrorBag(new TaskError({name : 'test1'}));
            assert(eb.isNotEmpty());
            eb.emptyBag();
            assert(eb.isEmpty());
        });

        it('getTaskErrorCount',() => {
            const eb = new TaskErrorBag();
            assert.equal(eb.getTaskErrorCount(),0);
            eb.addTaskError(new TaskError({name : 'test1'}));
            assert.equal(eb.getTaskErrorCount(),1);
            eb.addNewTaskError({});
            eb.addNewTaskError({});
            assert.equal(eb.getTaskErrorCount(),3);
            eb.emptyBag();
            assert.equal(eb.getTaskErrorCount(),0);
        });

        it('throw',() => {
            const eb = new TaskErrorBag();
            expect(()=> {
                eb.throw();
            }).to.throw();
        });

        it('throwIfHasError',() => {
            const eb = new TaskErrorBag();
            expect(()=> {
                eb.throwIfHasError();
            }).not.throw();
            eb.addNewTaskError({});
            expect(()=> {
                eb.throwIfHasError();
            }).to.throw();
        });

        it('toString',() => {
            const eb = new TaskErrorBag(new TaskError({name : 'test1'}));
            assert.equal(eb.toString(),'TaskErrorBag-> 1 TaskErrors  ->\n     0: TaskError  Name: test1 Group: undefined  Description: No Description define in Error  Type: NORMAL_ERROR  Info: {}  isPrivate:false  isFromZationSystem:false \n');
        });

    });

});