const CA              = require('../constante/settings');
const TaskError       = require('../../api/TaskError');
const SyErrors        = require('../cationTaskErrors/systemTaskErrors');
const cationConfig    = require('../../../App/Config/cation.config');

class SystemVersionChecker
{

    static checkSystemAndVersion(cationReq)
    {
        if(cationConfig.hasOwnProperty(CA.CATION_VERSION_CONTROL))
        {
            if(cationConfig[CA.CATION_VERSION_CONTROL].hasOwnProperty(cationReq[CA.INPUT_SYSTEM]))
            {
                let serverMinVersion = parseFloat(cationConfig[CA.CATION_VERSION_CONTROL][cationReq[CA.INPUT_SYSTEM]]);
                if(serverMinVersion > parseFloat(cationReq[CA.INPUT_VERSION]))
                {
                    throw new TaskError(SyErrors.versionToOld,{minVersion : serverMinVersion});
                }
            }
            else
            {
                throw new TaskError(SyErrors.systemNotFound,{systemName : cationReq[CA.INPUT_SYSTEM]});
            }
        }
    }

}

module.exports = SystemVersionChecker;