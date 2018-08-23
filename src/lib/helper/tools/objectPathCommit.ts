/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ObjectPath = require("./objectPath");

type CommitFunction = (object : object) => void;

class ObjectPathCommit
{
    private readonly objectPath : ObjectPath;
    private readonly commitFunction : CommitFunction;

    constructor(objectPath : ObjectPath, commitFunc : CommitFunction)
    {
        this.objectPath = objectPath;
    }




}

export = ObjectPathCommit;