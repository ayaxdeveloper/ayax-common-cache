import { CacheItem } from "./cache-item";
import { CacheDictionary } from "..";
import { SelectItem } from "ayax-common-types";

export interface ICacheService {
    Get<T>(url: string): Promise<T[]>;
    Post<T>(url: string, data?: any, ): Promise<T[]>;
    List(dictionary: string, method?: string): Promise<CacheItem[]>;
    ListAsDictionary(dictionary: string, method?: string): Promise<CacheDictionary>;
    ListAsSelectItems(dictionary: string, method?: string): Promise<SelectItem[]>;
    Search<T>(dictionary: string, data?: any, method?: string): Promise<T[]>;
}