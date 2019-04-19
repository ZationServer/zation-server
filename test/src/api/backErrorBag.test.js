/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const BackErrorBag    = require("../../../dist/lib/api/BackErrorBag").default;
const {BackError}     = require("../../../dist/lib/api/BackError");
const assert          = require("chai").assert;
const expect          = require("chai").expect;

describe('API.BackErrorBag',() => {

    describe('Constructor',() => {

        it('Default',() => {
            const eb = new BackErrorBag();
            assert(eb.isEmpty());
        });

        it('Overloaded',() => {
            const eb = new BackErrorBag(new BackError({name : 'test1'}));
            assert(!eb.isEmpty());
        });
    });

    describe('Methods',() => {

       it('IsEmpty',() => {
           const eb = new BackErrorBag();
           assert(eb.isEmpty());
           eb.addBackError(new BackError());
           assert(!eb.isEmpty());
       });

        it('IsNotEmpty',() => {
            const eb = new BackErrorBag();
            assert(!eb.isNotEmpty());
            eb.addBackError(new BackError());
            assert(eb.isNotEmpty());
        });

        it('AddBackError',() => {
            const eb = new BackErrorBag();
            eb.addBackError(new BackError({name : 'error1'}));
            assert.equal(eb.getBackErrors()[0].name,'error1');
        });

        it('AddNewBackError',() => {
            const eb = new BackErrorBag();
            eb.addNewBackError({name : 'error1'});
            assert.equal(eb.getBackErrors()[0].name,'error1');
        });

        it('GetJsonObj',() => {
            const eb = new BackErrorBag();
            eb.addNewBackError({name : 'error1'});
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

        it('AddFromBackErrorBag',() => {
            const eb1 = new BackErrorBag(new BackError({name : 'test1'}));
            const eb2 = new BackErrorBag();
            eb2.addFromBackErrorBag(eb1);
            assert.equal(eb2.getBackErrors()[0],eb1.getBackErrors()[0]);
        });

        it('emptyBag',() => {
            const eb = new BackErrorBag(new BackError({name : 'test1'}));
            assert(eb.isNotEmpty());
            eb.emptyBag();
            assert(eb.isEmpty());
        });

        it('getBackErrorCount',() => {
            const eb = new BackErrorBag();
            assert.equal(eb.getBackErrorCount(),0);
            eb.addBackError(new BackError({name : 'test1'}));
            assert.equal(eb.getBackErrorCount(),1);
            eb.addNewBackError({});
            eb.addNewBackError({});
            assert.equal(eb.getBackErrorCount(),3);
            eb.emptyBag();
            assert.equal(eb.getBackErrorCount(),0);
        });

        it('throw',() => {
            const eb = new BackErrorBag();
            expect(()=> {
                eb.throw();
            }).to.throw();
        });

        it('throwIfHasError',() => {
            const eb = new BackErrorBag();
            expect(()=> {
                eb.throwIfHasError();
            }).not.throw();
            eb.addNewBackError({});
            expect(()=> {
                eb.throwIfHasError();
            }).to.throw();
        });

        it('toString',() => {
            const eb = new BackErrorBag(new BackError({name : 'test1'}));
            assert.equal(eb.toString(),'BackErrorBag-> 1 BackErrors  ->\n     0: BackError  Name: test1 Group: undefined  Description: No Description define in Error  Type: NORMAL_ERROR  Info: {}  isPrivate:false  isFromZationSystem:false \n');
        });

    });

});