export class CacheObject<T> {
    data: T[] = new Array<T>();
    expires: Date = new Date();
    constructor(init?: Partial<CacheObject<T>>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}