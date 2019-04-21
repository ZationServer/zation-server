/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class IdCounter
{
    private counter1 : number;
    private counter2 : number;
    private lastTimeStamp : number;

    constructor()
    {
        this.counter1 = 0;
        this.counter2 = 0;
        this.lastTimeStamp = Date.now();
    }

    increase() : void
    {
        const newTimeStamp = Date.now();

        if(this.lastTimeStamp < newTimeStamp) {
            this.resetCounter();
            this.lastTimeStamp = newTimeStamp;
        }
        else {
            this.increaseCounter();
        }
    }

    getId() : string {
        return `${this.lastTimeStamp}.${this.counter1}.${this.counter2}`;
    }

    private increaseCounter()
    {
        if(this.counter2 < Number.MAX_SAFE_INTEGER) {
            this.counter2++;
        }
        else {
            this.counter2 = 0;
            if(this.counter1 < Number.MAX_SAFE_INTEGER) {
                this.counter1++;
            }
            else {
                this.resetCounter();
            }
        }
    }

    private resetCounter() {
       this.counter1 = 0;
       this.counter2 = 0;
    }
}