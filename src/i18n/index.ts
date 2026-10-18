import type { Lang } from "./config";
import { es, type Dict, type DictKey } from "./es";
import { en } from "./en";

const DICTS: Record<Lang, Dict> = { es, en };

export const getDict = (lang: Lang): Dict => DICTS[lang];
export const translator = (lang: Lang) => (key: DictKey) => DICTS[lang][key] ?? DICTS.es[key] ?? key;
export type { Dict, DictKey };
