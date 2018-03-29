import { CacheObject } from "../types/cache-object";
import * as moment from 'moment';
import { SearchResponse } from "ayax-common-types";
import { AxiosPromise } from "axios";

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
    },
    TryAxiosPromiseFromCache<T>(fetchPromise: AxiosPromise<T[]>, cacheExpiresAfter: number, method: string, url: string, data?: any): Promise<T[]> {
        return new Promise((resolve) => {
            let storage = localStorage.getItem(url);
            if(storage) {
                let cache: CacheObject<T> = JSON.parse(storage);
                if(moment(cache.expires).isAfter() && cache.data.length > 0) {
                    resolve(cache.data);
                } else {
                    fetchPromise.then((response) => {
                        CacheHelper.ToCache(url, response.data, cacheExpiresAfter);
                        resolve(response.data);
                    });
                }
            } else {
                fetchPromise.then((response) => {
                    CacheHelper.ToCache(url, response.data, cacheExpiresAfter);
                    resolve(response.data);
                });
            }
        })
    },
    TryAxiosSearchResponseFromCache<T>(fetchPromise: AxiosPromise<SearchResponse<T[]>>, cacheExpiresAfter: number, method: string, url: string, data?: any): Promise<T[]> {
        return new Promise((resolve) => {
            let storage = localStorage.getItem(url);
            if(storage) {
                let cache: CacheObject<T> = JSON.parse(storage);
                if(moment(cache.expires).isAfter() && cache.data.length > 0) {
                    resolve(cache.data);
                } else {
                    fetchPromise.then((response) => {
                        CacheHelper.ToCache(url, response.data.data, cacheExpiresAfter);
                        resolve(response.data.data);
                    });
                }
            } else {
                fetchPromise.then((response) => {
                    CacheHelper.ToCache(url, response.data.data, cacheExpiresAfter);
                    resolve(response.data.data);
                });
            }
        })
    },
    TrySearchResponseFromCache<T>(fetchPromise: Promise<SearchResponse<T[]>>, cacheExpiresAfter: number, method: string, url: string, data?: any): Promise<T[]> {
        return new Promise((resolve) => {
            let storage = localStorage.getItem(url);
            if(storage) {
                let cache: CacheObject<T> = JSON.parse(storage);
                if(moment(cache.expires).isAfter() && cache.data.length > 0) {
                    resolve(cache.data);
                } else {
                    fetchPromise.then((response) => {
                        CacheHelper.ToCache(url, response.data, cacheExpiresAfter);
                        resolve(response.data);
                    });
                }
            } else {
                fetchPromise.then((response) => {
                    CacheHelper.ToCache(url, response.data, cacheExpiresAfter);
                    resolve(response.data);
                });
            }
        })
    }
}