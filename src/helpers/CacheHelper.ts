import { CacheObject } from "../types/CacheObject";
import * as moment from 'moment';
import { SearchResponse } from "ayax-common-types";
import { OperationResult } from "ayax-common-operation";

export const CacheHelper = {
    ToCache<T>(name: string, data: T[], cacheExpiresAfter: number) {
        localStorage.setItem(name.toLowerCase(), JSON.stringify(new CacheObject<T>({ data: data, expires: moment().add(cacheExpiresAfter, "m").toDate()})));
    },
    TryFromCache<T>(fetchPromise: Promise<T[]>, cacheExpiresAfter: number, method: string, url: string, data?: any): Promise<T[]> {
        if(data) {
            url = `${url}_${JSON.stringify(data)}`;
        }
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
    },
    TryOperationPromiseFromCache<T>(fetchPromise: Promise<OperationResult<T[]>>, cacheExpiresAfter: number, method: string, url: string, data?: any): Promise<T[]> {
        if(data) {
            url = `${url}_${JSON.stringify(data)}`;
        }
        return new Promise((resolve) => {
            let storage = localStorage.getItem(url);
            if(storage) {
                let cache: CacheObject<T> = JSON.parse(storage);
                if(moment(cache.expires).isAfter() && cache.data.length > 0) {
                    resolve(cache.data);
                } else {
                    fetchPromise.then((response) => {
                        CacheHelper.ToCache(url, response.result, cacheExpiresAfter);
                        resolve(response.result);
                    });
                }
            } else {
                fetchPromise.then((response) => {
                    CacheHelper.ToCache(url, response.result, cacheExpiresAfter);
                    resolve(response.result);
                });
            }
        })
    },
    TryOperationSearchResponseFromCache<T>(fetchPromise: Promise<OperationResult<SearchResponse<T[]>>>, cacheExpiresAfter: number, method: string, url: string, data?: any): Promise<T[]> {
        if(data) {
            url = `${url}_${JSON.stringify(data)}`;
        }
        return new Promise((resolve) => {
            let storage = localStorage.getItem(url);
            if(storage) {
                let cache: CacheObject<T> = JSON.parse(storage);
                if(moment(cache.expires).isAfter() && cache.data.length > 0) {
                    resolve(cache.data);
                } else {
                    fetchPromise.then((response) => {
                        CacheHelper.ToCache(url, response.result.data, cacheExpiresAfter);
                        resolve(response.result.data);
                    });
                }
            } else {
                fetchPromise.then((response) => {
                    CacheHelper.ToCache(url, response.result.data, cacheExpiresAfter);
                    resolve(response.result.data);
                });
            }
        })
    }
}