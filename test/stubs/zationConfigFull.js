/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const ZationConfigFull  = require("../../dist/lib/main/config/manager/zationConfigFull").default;
const sinon             = require("sinon");

const zcStub = sinon.createStubInstance(ZationConfigFull);

sinon.stub(zcStub,"appConfig").value({});
sinon.stub(zcStub,"mainConfig").value({});
sinon.stub(zcStub,"eventConfig").value({});
sinon.stub(zcStub,"serviceConfig").value({});
sinon.stub(zcStub,"starterConfig").value({});

module.exports = zcStub;