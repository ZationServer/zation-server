/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import InjectionsManager    from '../main/injections/injectionsManager';
import {DataboxFamilyClass} from './databox/DataboxFamily';
import {DataboxClass}       from './databox/Databox';
import {ChannelFamilyClass} from './channel/ChannelFamily';
import {ChannelClass}       from './channel/Channel';
import {AnyClass}           from '../main/utils/typeUtils';
import {bag}                from './Bag';

/**
 * @description
 * Property decorator that can be used to inject an instance in a property.
 * The decorator is compatible with databoxes, channels or singletons.
 * The injections will be processed before the initialization of the components.
 * If you provide more Databox or channel classes there will be combined in the corresponding container.
 * In the case of singletons, all instances will be resolved in an array.
 * It is also possible to provide an async function then the return value will be injected.
 * If you want to inject services you should look at Inject.Service.
 * @param inject
 * @example
 * @Inject(ProfileDatabox)
 * private readonly profileDb: ProfileDatabox;
 *
 * @Inject(ProfileDatabox_1,ProfileDatabox_3)
 * private readonly profileDb: DataboxFamilyContainer;
 *
 * @Inject(CustomClass1,CustomClass2)
 * private readonly customClasses: [CustomClass1,CustomClass2];
 *
 * @Inject(async () => 'hello')
 * private readonly someString: string;
 */
export const Inject: {
    (...inject: DataboxFamilyClass[] | DataboxClass[] | ChannelFamilyClass[] | ChannelClass[]
        | AnyClass[] | [(() => any | Promise<any>)]): (target: any, propertyKey: string) => void
    /**
     * @description
     * Injects a service, when it exists; otherwise,
     * it will throw a ServiceNotFoundError error.
     * @param serviceName
     * @param instanceName
     */
    Service: (serviceName: string, instanceName?: string) => (target: any, propertyKey: string) => void;
} = (() => {
    const func = (...inject: DataboxFamilyClass[] | DataboxClass[] |
        ChannelFamilyClass[] | ChannelClass[] | AnyClass[] | [(() => any | Promise<any>)]) =>
    {
        return (target: any, propertyKey: string) => {
            InjectionsManager.get().addInjection(target,propertyKey,inject);
        };
    }
    func.Service = (serviceName: string, instanceName: string = 'default') =>
        func(() => bag.getService(serviceName, instanceName))
    return func;
})();