/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import CodeError        from "./codeError";
import {MainBackErrors} from "../systemBackErrors/mainBackErrors";

export default class UndefinedUserIdError extends CodeError
{
    constructor() {
        super(MainBackErrors.undefinedUserId);
    }
}