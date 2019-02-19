/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export class StringSet
{
    private strings : string[] = [];

    add(str : string) : void
    {
        if(!this.strings.includes(str)) {
           this.strings.push(str);
        }
    }

    contains(str : string) : boolean {
        return this.strings.includes(str);
    }

    remove(str : string) : void {
        let index = this.strings.indexOf(str);
        if (index !== -1) this.strings.splice(index, 1);
    }

    getLength() : number {
        return this.strings.length;
    }

    toArray() : string[] {
        return this.strings;
    }
}

