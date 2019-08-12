/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const ZationConfigFull  = require("../../dist/lib/helper/configManager/zationConfigFull").default;
const sinon             = require("sinon");

const zcStub = sinon.createStubInstance(ZationConfigFull);

sinon.stub(zcStub,"appConfig").value({});
sinon.stub(zcStub,"channelConfig").value({});
sinon.stub(zcStub,"mainConfig").value({});
sinon.stub(zcStub,"eventConfig").value({});
sinon.stub(zcStub,"serviceConfig").value({});
sinon.stub(zcStub,"starterConfig").value({});

module.exports = zcStub;