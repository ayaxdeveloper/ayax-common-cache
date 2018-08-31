import { OperationResult } from "ayax-common-operation";
import { SearchResponse } from "ayax-common-types";
import * as moment from "moment";
import { CacheObject } from "../types/CacheObject";

export class CacheHelper {
    static ToCache<T>(name: string, data: T[], cacheExpiresAfter: number) {
        localStorage.setItem(name.toLowerCase(), JSON.stringify(new CacheObject<T>({ data, expires: moment().add(cacheExpiresAfter, "m").toDate()})));
    }

    static TryFromCache<T>(fetchPromise: () => Promise<T[]>, cacheExpiresAfter: number, method: string, url: string, data?: any): Promise<T[]> {
        url = this.FormUrl(url, data);
        return new Promise((resolve) => {
            const storage = localStorage.getItem(url);
            if (storage) {
                const cache: CacheObject<T> = JSON.parse(storage);
                if (moment(cache.expires).isAfter() && cache.data.length > 0) {
                    resolve(cache.data);
                } else {
                    fetchPromise().then((response) => {
                        CacheHelper.ToCache(url, response, cacheExpiresAfter);
                        resolve(response);
                    });
                }
            } else {
                fetchPromise().then((response) => {
                    CacheHelper.ToCache(url, response, cacheExpiresAfter);
                    resolve(response);
                });
            }
        });
    }

    static TryOperationPromiseFromCache<T>(fetchPromise: () => Promise<OperationResult<T[]>>, cacheExpiresAfter: number, method: string, url: string, data?: any): Promise<T[]> {
        url = this.FormUrl(url, data);
        return new Promise((resolve) => {
            const storage = localStorage.getItem(url);
            if (storage) {
                const cache: CacheObject<T> = JSON.parse(storage);
                if (moment(cache.expires).isAfter() && cache.data.length > 0) {
                    resolve(cache.data);
                } else {
                    fetchPromise().then((response) => {
                        CacheHelper.ToCache(url, response.result, cacheExpiresAfter);
                        resolve(response.result);
                    });
                }
            } else {
                fetchPromise().then((response) => {
                    CacheHelper.ToCache(url, response.result, cacheExpiresAfter);
                    resolve(response.result);
                });
            }
        });
    }
    
    static TryOperationSearchResponseFromCache<T>(fetchPromise: () => Promise<OperationResult<SearchResponse<T[]>>>, cacheExpiresAfter: number, method: string, url: string, data?: any): Promise<T[]> {
        url = this.FormUrl(url, data);
        return new Promise((resolve) => {
            const storage = localStorage.getItem(url);
            if (storage) {
                const cache: CacheObject<T> = JSON.parse(storage);
                if (moment(cache.expires).isAfter() && cache.data.length > 0) {
                    resolve(cache.data);
                } else {
                    fetchPromise().then((response) => {
                        CacheHelper.ToCache(url, response.result.data, cacheExpiresAfter);
                        resolve(response.result.data);
                    });
                }
            } else {
                fetchPromise().then((response) => {
                    CacheHelper.ToCache(url, response.result.data, cacheExpiresAfter);
                    resolve(response.result.data);
                });
            }
        });
    }

    private static FormUrl(url: string, data: any): string {
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