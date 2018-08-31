import { OperationResult } from "ayax-common-operation";
import { SearchResponse } from "ayax-common-types";
import * as moment from "moment";
import { CacheObject } from "../types/CacheObject";

export class CacheHelper {
    static ToCache<T>(name: string, data: T[], cacheExpiresAfter: number) {
        localStorage.setItem(name.toLowerCase(), JSON.stringify(new CacheObject<T>({ data, expires: moment().add(cacheExpiresAfter, "m").toDate()})));
    }

    static TryFromCache<T>(fetchPromise: () => Promise<T[]>, cacheExpiresAfter: number, method: string, url: string, data?: any): Promise<T[]> {
        const cacheName = this.FormCacheName(url, data);
        return new Promise((resolve) => {
            const storage = localStorage.getItem(cacheName);
            if (storage) {
                const cache: CacheObject<T> = JSON.parse(storage);
                if (moment(cache.expires).isAfter() && cache.data.length > 0) {
                    resolve(cache.data);
                } else {
                    fetchPromise().then((response) => {
                        CacheHelper.ToCache(cacheName, response, cacheExpiresAfter);
                        resolve(response);
                    });
                }
            } else {
                fetchPromise().then((response) => {
                    CacheHelper.ToCache(cacheName, response, cacheExpiresAfter);
                    resolve(response);
                });
            }
        });
    }

    static TryOperationPromiseFromCache<T>(fetchPromise: () => Promise<OperationResult<T[]>>, cacheExpiresAfter: number, method: string, url: string, data?: any): Promise<T[]> {
        const cacheName = this.FormCacheName(url, data);
        return new Promise((resolve) => {
            const storage = localStorage.getItem(cacheName);
            if (storage) {
                const cache: CacheObject<T> = JSON.parse(storage);
                if (moment(cache.expires).isAfter() && cache.data.length > 0) {
                    resolve(cache.data);
                } else {
                    fetchPromise().then((response) => {
                        CacheHelper.ToCache(cacheName, response.result, cacheExpiresAfter);
                        resolve(response.result);
                    });
                }
            } else {
                fetchPromise().then((response) => {
                    CacheHelper.ToCache(cacheName, response.result, cacheExpiresAfter);
                    resolve(response.result);
                });
            }
        });
    }
    
    static TryOperationSearchResponseFromCache<T>(fetchPromise: () => Promise<OperationResult<SearchResponse<T[]>>>, cacheExpiresAfter: number, method: string, url: string, data?: any): Promise<T[]> {
        const cacheName = this.FormCacheName(url, data);
        return new Promise((resolve) => {
            const storage = localStorage.getItem(cacheName);
            if (storage) {
                const cache: CacheObject<T> = JSON.parse(storage);
                if (moment(cache.expires).isAfter() && cache.data.length > 0) {
                    resolve(cache.data);
                } else {
                    fetchPromise().then((response) => {
                        CacheHelper.ToCache(cacheName, response.result.data, cacheExpiresAfter);
                        resolve(response.result.data);
                    });
                }
            } else {
                fetchPromise().then((response) => {
                    CacheHelper.ToCache(cacheName, response.result.data, cacheExpiresAfter);
                    resolve(response.result.data);
                });
            }
        });
    }

    private static FormCacheName(url: string, data: any): string {
        let res = "";
        if (data) {
            res = `${url}_${this.StringifyData(data)}`;
        } else {
            res = url;
        }
        res = res.toLowerCase();
        return res;
    }

    private static StringifyData(data: any) {
        const replaceArr = [/\{/, /\}/, /\"/, /\:/, /\,/ , /\[/, /\]/];
        let str = JSON.stringify(data);
        replaceArr.forEach(x => {
            str = str.replace(new RegExp(x, "g"), "");
        });
        return str;
    }
}