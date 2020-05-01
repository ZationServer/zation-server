/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {checkComponentName, parseComponentClassName} from '../main/utils/componentUtils';
import {ComponentClass}          from "../main/config/definitions/parts/componentClass";
import Config                    from './Config';
import CustomChannel             from './CustomChannel';

/**
 * @description
 * Router class for creating a structure of
 * components and register them.
 * @example
 * const rootRouter = new Router('app');
 *
 * const chatRouter = new Router('chat');
 * rootRouter.use(chatRouter);
 *
 * // app/chat/sendMessage
 * chatRouter.use(SendMessageController);
 *
 * // app/chat/addMember
 * chatRouter.use(AddMemberController);
 *
 * rootRouter.register();
 */
export default class Router {

    private readonly _route: string;

    private readonly _components: {component: ComponentClass,override:
            {name?: string, apiLevel?: number | null}}[] = [];
    private readonly _customChs: {ch: CustomChannel,override: {name?: string}}[] = [];

    private readonly _innerRouters: Router[] = [];

    constructor(route: string = '') {
        if(route[route.length-1] !== '/'){
            route+='/';
        }
        this._route = route;
    }

    /**
     * Returns the route of the router.
     */
    get route(): string {
        return this._route;
    }

    /**
     * Attaches a router on this router.
     * Can be used to create deep structures.
     * @param router
     */
    use(router: Router)
    /**
     * Attaches a Component (Databox, Controller, DataboxFamily) to a Router.
     * You are able to register multiple components with the same name
     * but different API levels.
     * The identifier of the component will be created with the name of
     * the component and the router chain.
     * The use method parses the name and API level from the class name.
     * You need to follow a specific name convention, see the code examples.
     * But you are able to override the parsed name and API level with the
     * first parameter of this decorator.
     * Notice that you need to call register on the root Router
     * to register all components recursively.
     * @example
     * Example 1:
     * class SendMessageController extends Controller {}
     * Parsed: name = sendMessage, apiLevel = undefined
     *
     * Example 2:
     * class BlockUserController_4 extends Controller {}
     * Parsed: name = blockUser, apiLevel = 4
     *
     * Example 3:
     * class ProfileDatabox_13 extends Controller {}
     * Parsed: name = profile, apiLevel = 13
     * @param component
     * @param override
     * The parameter to override the parsed name and API level from the class name.
     */
    use(component: ComponentClass, override?: {name?: string, apiLevel?: number | null})
    /**
     * Attaches the custom channel to the Router.
     * Notice that each custom channel attached to this Router
     * needs to have a unique name.
     * You optionally can override the name with the second parameter.
     * @param customChannel
     * @param override
     */
    use(customChannel: CustomChannel, override?: {name?: string})
    use(value: ComponentClass | Router | CustomChannel, override: {name?: string, apiLevel?: number | null} = {}) {
        if(value instanceof Router){
            this._innerRouters.push(value);
        }
        else if(value instanceof CustomChannel){
            this._customChs.push({ch: value,override});
        }
        else {
            this._components.push({component: value,override});
        }
    }

    /**
     * Registers all components also from inner routers.
     * Notice to call the method only on the root router
     * and after attaching all components and routers.
     * Don't forget to import the file in the app config.
     */
    register() {
        this._register();
    }

    /**
     * @internal
     * @private
     */
    _register(tmpRoute: string = '') {
        tmpRoute += this.route;

        const comLength = this._components.length;
        for(let i = 0; i < comLength; i++) {
            const tmpComponent = this._components[i];
            let {name,apiLevel} = parseComponentClassName(tmpComponent.component.name);
            if(tmpComponent.override.name !== undefined){
                name = tmpComponent.override.name;
            }
            if(tmpComponent.override.apiLevel !== undefined){
                apiLevel = tmpComponent.override.apiLevel === null ?
                    undefined : parseInt(tmpComponent.override.apiLevel as any);
            }

            checkComponentName(name);
            Config.registerComponent(tmpRoute + name,tmpComponent.component,apiLevel);
        }

        const customChLength = this._customChs.length;
        for(let i = 0; i < customChLength; i++){
            const customChannel = this._customChs[i];
            Config.registerCustomCh(
                tmpRoute +
                (customChannel.override.name !== undefined ? customChannel.override.name : customChannel.ch.name),
                customChannel.ch.definition
            );
        }

        const routersLength = this._innerRouters.length;
        for(let i = 0; i < routersLength; i++) {
            this._innerRouters[i]._register(tmpRoute);
        }
    }
}