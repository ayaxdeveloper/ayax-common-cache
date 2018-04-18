import { ICacheService } from "../types/cache-service";
import { OperationResult, SearchResponse, OperationStatus, SelectItem } from 'ayax-common-types';
import * as moment from 'moment';
import { CacheItem } from "../types/cache-item";
import { CacheObject } from "../types/cache-object";
import { CacheHelper } from "../helpers/cache-helper";
import { IOperationService } from 'ayax-common-services';

export class CacheService implements ICacheService {
    private _operationService: IOperationService;
    private _cacheExpiresAfter: number;
    private _staticCache: {[name: string] : any[]};

    constructor(operationService: IOperationService, cacheExpiresAfter?: number, staticCache?: {[name: string] : any[]}) {
        this._operationService = operationService;
        this._cacheExpiresAfter = cacheExpiresAfter ? cacheExpiresAfter : 15;
        this._staticCache = staticCache ? staticCache : {};
    }

    public Get<T>(url: string): Promise<T[]> {
        return CacheHelper.TryFromCache<T>(this.Fetch<T>('get', url), this._cacheExpiresAfter, 'get', url, null);
    }

    public Post<T>(url: string, data?: any): Promise<T[]> {
        return CacheHelper.TryFromCache<T>(this.Fetch<T>('post', url, data), this._cacheExpiresAfter, 'post', url, data);
    }

    public List(dictionary: string, method?: string): Promise<CacheItem[]> {
        let url = method ? `/${dictionary}/${method}` : `/${dictionary}/list`;
        return CacheHelper.TryFromCache<CacheItem>(this.Fetch<CacheItem>('get', url), this._cacheExpiresAfter, 'get', url, null);
    }

    public async ListAsDictionary(dictionary: string, method?: string): Promise<CacheDictionary> {
        let cacheDictionary: CacheDictionary = {};
        (await this.List(dictionary, method)).forEach(x => {
            cacheDictionary[<string>x.id] = x;
        });
        return cacheDictionary;
    }

    public async ListAsSelectItems(dictionary: string, method?: string): Promise<SelectItem[]> {
        return (await this.List(dictionary, method)).map(x => new SelectItem({text: x.name, value: x.id}));
    }

    public Search<T>(dictionary: string, data?: any, method?: string): Promise<T[]> {
        let url = method ? `/${dictionary}/${method}` : `/${dictionary}/search`;
        return CacheHelper.TryFromCache<T>(this.Fetch<T>('search', url, data), this._cacheExpiresAfter, 'search', url, data);
    }

    private async Fetch<T>(method: string, url: string, data?: any): Promise<T[]> {
        try {
            if(this._staticCache[url]) {
                return this._staticCache[url];
            }
            switch(method.toLocaleLowerCase()) {
                case 'get':
                let get = (await this._operationService.get<T[]>(url));
                if(get.status == 0) {
                    return get.result;
                } else {
                    throw new Error(get.message);
                }
                case 'post': 
                let post = (await this._operationService.post<T[]>(url, data));
                if(post.status == 0) {
                    return post.result;
                } else {
                    throw new Error(post.message);
                }
                case 'search': 
                let search = (await this._operationService.post<SearchResponse<T[]>>(url, data));
                if(search.status == 0) {
                    return search.result.data;
                } else {
                    throw new Error(search.message);
                }
            }
            
        } catch (e) {
            console.error(`Ошибка получения справочника url=${url} method=${method} data=${JSON.stringify(data)} ${JSON.stringify(e)}`);
        }
        return [];
    }
}

export type CacheDictionary = {[index: string]: CacheItem};
