/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export default interface BackErrorConstruct
{
    /**
     * @description
     * The name of the BackError.
     * @default BackError
     */
    name?: string;
    /**
     * @description
     * The group of the BackError.
     * Multiple errors can belong to a group.
     * @default undefined
     */
    group?: string;
    /**
     * @description
     * The description of the BackError.
     * Contains a more detailed message about the error.
     * It will only be sent when it is activated.
     * @default undefined
     */
    description?: string;
    /**
     * @description
     * The type of the BackError.
     * The error type is a very abstract topic name.
     * Like validation error, database error, input error.
     * Some default types can be found in the Enum: ErrorType.
     * @default ErrorType.NormalError
     */
    type?: string;
    /**
     * @description
     * Indicates if the info of the BackError should also be transmitted to the client.
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an valueNotMatchesWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     * @default true
     */
    sendInfo?: boolean;
    /**
     * @description
     * Indicates if the BackError is private.
     * A private BackError only sends its type and
     * whether it is a custom-defined error.
     * @default false
     */
    private ?: boolean;
    /**
     * @description
     * Indicates if the BackError is a custom-defined error.
     * @default true
     */
    custom ?: boolean;
}