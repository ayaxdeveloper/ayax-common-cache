import { Guid } from "ayax-common-types";

export class CacheItem {
    id: number | string | Guid;
    name: string;
    title: string;
    order = 0;
    isActive = true;
    notes: string;
    constructor(init?: Partial<CacheItem>) {
        if (!init.title && init.name) {
            init.name = init.title;
        } else if (!init.name && init.title) {
            init.title = init.name;
        }
        
        if (init) {
            Object.assign(this, init);
        }


    }
}