import { guid } from "ayax-common-types";

export class CacheItem {
    id: number | string | guid;
    name: string;
    order: number = 0;
    isActive: boolean = true;
    notes: string;
    constructor(init?: Partial<CacheItem>) {
        if(init) {
            Object.assign(this, init);
        }
    }
}