import { ICacheService } from "../types/ICacheService";
import { SearchResponse, SelectItem } from 'ayax-common-types';
import { CacheItem } from "../types/CacheItem";
import { CacheHelper } from "../helpers/CacheHelper";
import { ArraySortHelper } from "ayax-common-helpers";
import { IOperationService } from 'ayax-common-operation';

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

    public async List(dictionary: string, method?: string, data?: any): Promise<CacheItem[]> {
        let url = method ? `/${dictionary}/${method}` : `/${dictionary}/list`;
        return (await CacheHelper.TryFromCache<CacheItem>(this.Fetch<CacheItem>('get', url), this._cacheExpiresAfter, 'get', url, data)).sort(ArraySortHelper.byOrder);
    }

    public async ListAsDictionary(dictionary: string, method?: string, data?: any): Promise<CacheDictionary> {
        let cacheDictionary: CacheDictionary = {};
        (await this.List(dictionary, method, data)).forEach(x => {
            cacheDictionary[<string>x.id] = x;
        });
        return cacheDictionary;
    }

    public async ListAsSelectItems(dictionary: string, method?: string, data?: any): Promise<SelectItem[]> {
        return (await this.List(dictionary, method, data)).map(x => new SelectItem({text: x.name ? x.name : x.title, value: x.id}));
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
                return (await this._operationService.get<T[]>(url)).ensureSuccess();
                case 'post': 
                return (await this._operationService.post<T[]>(url, data)).ensureSuccess();
                case 'search': 
                return (await this._operationService.post<SearchResponse<T[]>>(url, data)).ensureSuccess().data;
            }
            
        } catch (e) {
            console.error(`Ошибка получения справочника url=${url} method=${method} data=${JSON.stringify(data)} ${JSON.stringify(e)}`);
        }
        return [];
    }
}

export type CacheDictionary = {[index: string]: CacheItem};
