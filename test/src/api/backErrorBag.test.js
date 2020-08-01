/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const BackErrorBag    = require("../../../dist/lib/api/BackErrorBag").default;
const BackError       = require("../../../dist/lib/api/BackError").default;
const assert          = require("chai").assert;
const expect          = require("chai").expect;

describe('Api.BackErrorBag',() => {

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
           eb.add(new BackError());
           assert(!eb.isEmpty());
       });

        it('IsNotEmpty',() => {
            const eb = new BackErrorBag();
            assert(!eb.isNotEmpty());
            eb.add(new BackError());
            assert(eb.isNotEmpty());
        });

        it('AddBackError',() => {
            const eb = new BackErrorBag();
            eb.add(new BackError({name : 'error1'}));
            assert.equal(eb.getBackErrors()[0].name,'error1');
        });

        it('AddNewBackError',() => {
            const eb = new BackErrorBag();
            eb.addNewBackError({name : 'error1'});
            assert.equal(eb.getBackErrors()[0].name,'error1');
        });

        it('dehydrate',() => {
            const eb = new BackErrorBag();
            eb.addNewBackError({name : 'error1'});
            const json = eb._dehydrate(true);
            // noinspection JSCheckFunctionSignatures
            assert.sameDeepMembers(json, [ { n: 'error1',
                g: undefined,
                t: 'NormalError',
                c: 1,
                i: {},
                d: 'No Description defined in Error' } ]
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
            eb.empty();
            assert(eb.isEmpty());
        });

        it('getBackErrorCount',() => {
            const eb = new BackErrorBag();
            assert.equal(eb.count,0);
            eb.add(new BackError({name : 'test1'}));
            assert.equal(eb.count,1);
            eb.addNewBackError({});
            eb.addNewBackError({});
            assert.equal(eb.count,3);
            eb.empty();
            assert.equal(eb.count,0);
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
            assert.equal(eb.toString(),'BackErrorBag-> 1 BackErrors  ->\n     0: BackError  Name: test1 Group: undefined  Description: No Description defined in Error  Type: NormalError  Info: {}  Private: false  Custom: true \n');
        });

    });

});