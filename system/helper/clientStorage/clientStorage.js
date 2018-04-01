const CA            = require('../constante/settings');
const TaskError     = require('../../api/TaskError');
const SyErrors      = require('../cationTaskErrors/systemTaskErrors');

class ClientStorage
{
    static setClientDataMain(data,isSocket,socket,req,chController,ignoreCation = false,useToLogin = false)
    {
        let suc = false;
        if(data !== undefined)
        {
            let obj = {};
            for (let k in data) {
                if (data.hasOwnProperty(k)) {
                    if ((k !== CA.CLIENT_AUTH_GROUP && k !== CA.CLIENT_AUTH_ID) || ignoreCation) {
                        if (isSocket) {
                            obj[k] = data[k];
                        }
                        else {
                            req.session[k] = data[k];
                            suc = true;
                        }
                    }
                    else {
                        throw new TaskError(SyErrors.complicatedCationKeys, {key: k});
                    }
                }
            }
            if (isSocket) {
                let token = socket.getAuthToken();
                if(token !== null || useToLogin)
                {
                    // noinspection JSUnresolvedFunction
                    socket.setAuthToken(this.bringAuthTokenTogether(token, obj));
                    chController.checkSocketChannelAccess();
                    suc = true;
                }
            }
        }
        return suc;
    }

    static setClientData(data,isSocket,socket,req,chController)
    {
        ClientStorage.setClientDataMain(data,isSocket,socket,req,chController,false,false)
    }

    static setCationData(data,isSocket,socket,req,chController,useLogin)
    {
        ClientStorage.setClientDataMain(data,isSocket,socket,req,chController,true,useLogin);
    }

    static bringAuthTokenTogether(token,newData)
    {
        if(token === null)
        {
            return newData;
        }
        else
        {
            for(let k in newData)
            {
                if(newData.hasOwnProperty(k))
                {
                    token[k] = newData[k];
                }
            }
            return token;
        }
    }

    static getClientVariable(key,isSocket,socket,req)
    {
        let res = undefined;

        if(isSocket)
        {
            let authToken = socket.getAuthToken();
            if(authToken !== null)
            {
                res = authToken[key];
            }
        }
        else
        {
            res = req.session[key];
        }
        return res;
    }
}

module.exports = ClientStorage;