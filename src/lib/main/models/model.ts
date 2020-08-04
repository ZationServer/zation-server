/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {DefinitionModel}   from './definitionModel';
import {MetaModel}         from './metaModel';
import {ModelTranslatable} from '../../api/configTranslatable/modelTranslatable';
import {AnyClass}          from '../utils/typeUtils';

export type AnyModelTranslatable = ModelTranslatable | AnyClass;

export type Model = DefinitionModel | MetaModel | AnyModelTranslatable;
export type DirectModel = DefinitionModel | MetaModel;