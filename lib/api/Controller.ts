/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class Controller
{
    constructor()
    {
    }

    //invokes when the zation system is creating instance of the controller (in worker start)
    async initialize(simpleBag : SmallBag) : void
    {}

    //invokes when the controller gets an request and returns the result of the process
    async handle(bag : Bag,input : object) : any
    {}

    //invokes when the controller gets an request with wrong input
    async wrongInput(bag : Bag,input : object) : void
    {}
}

export = Controller;
