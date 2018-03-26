import { CacheObject } from "../types/cache-object";
import * as moment from 'moment';

export const CacheHelper = {
    ToCache<T>(name: string, data: T[], cacheExpiresAfter: number) {
        localStorage.setItem(name.toLowerCase(), JSON.stringify(new CacheObject<T>({ data: data, expires: moment().add(cacheExpiresAfter, "m").toDate()})));
    },
    TryFromCache<T>(fetchPromise: Promise<T[]>, cacheExpiresAfter: number, method: string, url: string, data?: any): Promise<T[]> {
        return new Promise((resolve) => {
            let storage = localStorage.getItem(url);
            if(storage) {
                let cache: CacheObject<T> = JSON.parse(storage);
                if(moment(cache.expires).isAfter() && cache.data.length > 0) {
                    resolve(cache.data);
                } else {
                    fetchPromise.then((response) => {
                        CacheHelper.ToCache(url, response, cacheExpiresAfter);
                        resolve(response);
                    });
                }
            } else {
                fetchPromise.then((response) => {
                    CacheHelper.ToCache(url, response, cacheExpiresAfter);
                    resolve(response);
                });
            }
        })
    }
}