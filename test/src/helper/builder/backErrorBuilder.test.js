/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const BackErrorBuilder = require("../../../../dist/lib/helper/builder/backErrorBuilder").default;
const assert           = require("chai").assert;

describe('HELPER.BackErrorBuilder',() => {

    describe('Build', function () {

        it('BuildTest-1',() => {

            const te = BackErrorBuilder.build()
                .name('error1')
                .typ('MyType')
                .addInfo('length',2)
                .create();

            assert.equal(te.getName(),'error1');
            assert.equal(te.getType(),'MyType');
            assert.deepEqual(te.getInfo(),{length : 2});
        });

        it('BuildTest-2',() => {

            const te = BackErrorBuilder.build()
                .name('error1')
                .group('g1')
                .typeDatabaseError()
                .description('des')
                .private(true)
                .create();

            assert.equal(te.getName(),'error1');
            assert.equal(te.getType(),'DATABASE_ERROR');
            assert.equal(te.getDescription(),'des');
            assert(te.isPrivate());
        });

        it('BuildTest-3',() => {

            const te = BackErrorBuilder.build()
                .name('error1')
                .sendInfo(true)
                .fromZationSystem(true)
                .setInfo({length : 1})
                .typeAuthError()
                .typeInputError()
                .typeNormalError()
                .create();

            assert.equal(te.getName(),'error1');
            assert.equal(te.getType(),'NORMAL_ERROR');
            assert(te.isSendInfo());
            assert(te.isFromZationSystem());
        });

        it('BuildTest-3',() => {

            const te = BackErrorBuilder.build()
                .name('error1')
                .addInfo('length',1)
                .addInfo('length',2,true)
                .typeTokenError()
                .typeTimeError()
                .typeCompatibilityError()
                .typeProtocolError()
                .typeSystemError()
                .typeValidationError()
                .typeNormalError()
                .create();

            assert.equal(te.getName(),'error1');
            assert.equal(te.getType(),'NORMAL_ERROR');
            assert.deepEqual(te.getInfo(),{length : 2});
        });

    });

});