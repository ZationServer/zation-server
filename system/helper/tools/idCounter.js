/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class IdCounter
{
    constructor()
    {
        this._counter1 = 0;
        this._counter2 = 0;
        this._lastTimeStamp = Date.now();
    }

    increase()
    {
        let newTimeStamp = Date.now();

        if(this._lastTimeStamp < newTimeStamp)
        {
            this._resetCounter();
            this._lastTimeStamp = newTimeStamp;
        }
        else
        {
            this._increaseCounter();
        }
    }

    getId()
    {
        return `${this._lastTimeStamp}.${this._counter1}.${this._counter2}`;
    }

    _increaseCounter()
    {
        if(this._counter2 < Number.MAX_SAFE_INTEGER)
        {
            this._counter2++;
        }
        else
        {
            this._counter2 = 0;

            if(this._counter1 < Number.MAX_SAFE_INTEGER)
            {
                this._counter1++;
            }
            else
            {
                this._resetCounter();
            }
        }
    }

    _resetCounter()
    {
       this._counter1 = 0;
       this._counter2 = 0;
    }
}

module.exports = IdCounter;