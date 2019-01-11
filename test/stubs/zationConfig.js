const sinon           = require("sinon");
const ZationConfig    = require('./../../dist/lib/main/zationConfig');

let zcStub = sinon.createStubInstance(ZationConfig);

sinon.stub(zcStub,"appConfig").value({});
sinon.stub(zcStub,"channelConfig").value({});
sinon.stub(zcStub,"mainConfig").value({});
sinon.stub(zcStub,"errorConfig").value({});
sinon.stub(zcStub,"eventConfig").value({});
sinon.stub(zcStub,"serviceConfig").value({});
sinon.stub(zcStub,"starterConfig").value({});

module.exports = zcStub;