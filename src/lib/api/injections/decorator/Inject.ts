/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {InjectableClass}    from '../Injectable';
import InjectionsManager    from '../../../main/injections/injectionsManager';
import {DataboxFamilyClass} from '../../databox/DataboxFamily';
import {DataboxClass}       from '../../databox/Databox';
import {ChannelFamilyClass} from '../../channel/ChannelFamily';
import {ChannelClass}       from '../../channel/Channel';

/**
 * @description
 * Property decorator that can be used to inject an instance in a property.
 * The decorator is compatible with Databoxes, channels or custom injectable classes.
 * The injections will be processed before the initialization of the components.
 * If you provide more Databox or channel classes there will be combined
 * in the corresponding container.
 * In the case of custom injectable classes all instances will be resolved in an array.
 * @param inject
 * @example
 *
 * @Inject(ProfileDatabox)
 * private readonly profileDb: ProfileDatabox;
 *
 * @Inject(ProfileDatabox_1,ProfileDatabox_3)
 * private readonly profileDb: DataboxFamilyContainer;
 *
 * @Inject(CustomClass1,CustomClass2)
 * private readonly customClasses: [CustomClass1,CustomClass2];
 */
export default function Inject(...inject: DataboxFamilyClass[] | DataboxClass[] |
    ChannelFamilyClass[] | ChannelClass[] | InjectableClass[])
{
    return (target: any, propertyKey: string) => {
        InjectionsManager.get().addInjection(target,propertyKey,inject);
    };
}