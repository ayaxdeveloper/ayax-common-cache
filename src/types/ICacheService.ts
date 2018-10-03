import { SelectItem, IListItem } from "ayax-common-types";
import { CacheDictionary } from "../service/CacheService";

export interface ICacheService {
    Get<T>(url: string): Promise<T[]>;
    Post<T>(url: string, data?: any, ): Promise<T[]>;
    List(dictionary: string, method?: string): Promise<IListItem[]>;
    ListAsDictionary(dictionary: string, method?: string): Promise<CacheDictionary>;
    ListAsSelectItems(dictionary: string, method?: string): Promise<SelectItem[]>;
    Search<T>(dictionary: string, data?: any, method?: string): Promise<T[]>;
}