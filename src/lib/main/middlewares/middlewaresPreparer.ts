import {Middleware, PreparedMiddleware} from '../config/definitions/parts/middleware';
import FuncUtils                        from '../utils/funcUtils';
import {setValueReplacer}               from '../utils/valueReplacer';

export default class MiddlewaresPreparer {

    static prepare(middlewares: Middleware = {}): PreparedMiddleware {
        const res = {};
        let value;
        for(const k in middlewares) {
            if(middlewares.hasOwnProperty(k)){
                value = middlewares[k];
                res[k] = typeof value !== 'function' ? FuncUtils.createFuncMiddlewareAsyncInvoker(value) : value;
                setValueReplacer(res[k],v => res[k] = v);
            }
        }
        return res as PreparedMiddleware;
    }
}