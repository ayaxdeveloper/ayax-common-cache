import { ICacheService } from "../types/cache-service";
import { IOperationService, OperationResult, SearchResponse, OperationStatus, SelectItem } from 'ayax-common-types';
import * as moment from 'moment';
import { CacheItem } from "../types/cache-item";

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
        return this.TryFromCache<T>('get', url, null);
    }

    public Post<T>(url: string, data?: any): Promise<T[]> {
        return this.TryFromCache<T>('post', url, data);
    }

    public List(dictionary: string, method?: string): Promise<CacheItem[]> {
        let url = method ? `/${dictionary}/${method}` : `/${dictionary}/list`;
        return this.TryFromCache<CacheItem>('get', url, null);
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
        return this.TryFromCache<T>('search', url, data);
    }

    private TryFromCache<T>(method: string, url: string, data?: any, ): Promise<T[]> {
        return new Promise((resolve) => {
            let storage = localStorage.getItem(url);
            if(storage) {
                let cache: CacheObject<T> = JSON.parse(storage);
                if(moment(cache.expires).isAfter() && cache.data.length > 0) {
                    resolve(cache.data);
                } else {
                    this.Fetch<T>(method, url, data).then((response) => {
                        this.ToCache(url, response);
                        resolve(response);
                    });
                }
            } else {
                this.Fetch<T>(method, url, data).then((response) => {
                    this.ToCache(url, response);
                    resolve(response);
                });
            }
        })
    }

    private async Fetch<T>(method: string, url: string, data?: any): Promise<T[]> {
        try {
            if(this._staticCache[url]) {
                return this._staticCache[url];
            }
            switch(method.toLocaleLowerCase()) {
                case 'get':
                let get = (await this._operationService.get<T[]>(url)).data;
                if(get.status == 0) {
                    return get.result;
                } else {
                    throw new Error(get.message);
                }
                case 'post': 
                let post = (await this._operationService.post<T[]>(url, data)).data;
                if(post.status == 0) {
                    return post.result;
                } else {
                    throw new Error(post.message);
                }
                case 'search': 
                let search = (await this._operationService.post<SearchResponse<T[]>>(url, data)).data;
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

    private ToCache<T>(name: string, data: T[]) {
        localStorage.setItem(name.toLowerCase(), JSON.stringify(new CacheObject<T>({ data: data, expires: moment().add(this._cacheExpiresAfter, "m").toDate()})));
    }
}

class CacheObject<T> {
    data: T[] = new Array<T>();
    expires: Date = new Date();
    constructor(init?: Partial<CacheObject<T>>) {
        if(init) {
            Object.assign(this, init);
        }
    }
}

export type CacheDictionary = {[index: string]: CacheItem};