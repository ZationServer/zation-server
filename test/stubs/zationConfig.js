/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const ZationConfig    = require("../../dist/lib/main/zationConfig").default;
const sinon           = require("sinon");

const zcStub = sinon.createStubInstance(ZationConfig);

sinon.stub(zcStub,"appConfig").value({});
sinon.stub(zcStub,"channelConfig").value({});
sinon.stub(zcStub,"mainConfig").value({});
sinon.stub(zcStub,"eventConfig").value({});
sinon.stub(zcStub,"serviceConfig").value({});
sinon.stub(zcStub,"starterConfig").value({});

module.exports = zcStub;