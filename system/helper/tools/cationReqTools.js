const CA              = require('../constante/settings');
const cationConfig    = require('../../../App/Config/cation.config');

class CationReqTools
{
    static checkValidStructure(cationReq)
    {
        return cationReq[CA.INPUT_VERSION] !== undefined &&
            cationReq[CA.INPUT_SYSTEM] !== undefined &&
            (
                (
                    cationReq[CA.INPUT_TASK] !== undefined &&
                    cationReq[CA.INPUT_TASK][CA.INPUT_CONTROLLER] !== undefined &&
                    cationReq[CA.INPUT_TASK][CA.INPUT_PARAMS] !== undefined
                ) || (
                    cationReq[CA.INPUT_AUTH] !== undefined &&
                    cationReq[CA.INPUT_AUTH][CA.INPUT_PARAMS] !== undefined
                ));
    }

    static createCationAuth(cationReq)
    {
        if(cationReq[CA.INPUT_AUTH] !== undefined)
        {
            let name = cationConfig[CA.CATION_AUTH_CONTROLLER];
            cationReq[CA.INPUT_TASK] = cationReq[CA.INPUT_AUTH];
            delete cationReq[CA.INPUT_AUTH];
            cationReq[CA.INPUT_TASK][CA.INPUT_CONTROLLER] = name;
        }
        return cationReq;
    }
}

module.exports = CationReqTools;