/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

function sortByKeys(value: any) {
    return (typeof value === 'object') ?
        (Array.isArray(value) ?
                value.map(sortByKeys) :
                Object.keys(value).sort().reduce(
                    (o, key) => {
                        o[key] = sortByKeys(value[key]);
                        return o;
                    }, {})
        ) : value;
}

export function stringifyMember(member: any): string {
    if(typeof member === 'string') return `"${member}"`;
    else return JSON.stringify(member,sortByKeys)
}

export function parseMember(member: string): any {
    return JSON.parse(member);
}