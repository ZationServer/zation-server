/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model} from '../../../models/model';

export interface InputConfig {
    /**
     * This property defines the input.
     * It will be used to validate and format the data that flows into the component.
     * The input can be defined with a model, or you can allow any input with 'any' literal.
     * If you don't want to have any input you can use the 'nothing' literal.
     * @default 'nothing'
     * @example
     * @ObjectModel()
     * class Person {
     *
     *  @Model({type: 'string'})
     *  name: string;
     *
     *  @Model({type: 'int', minValue: 14})
     *  age: number;
     *
     * }
     * input: Person
     * //Client can send  ->
     * {name: 'Luca', age: 20}
     */
    input?: Input;
}

export type Input = Model | 'any' | 'nothing';