import { NOSKETCH_API } from "./config";

export interface WordListItem {
  str: string;
  frq: number;
  pos?: string;
}

interface StructWordListItemRaw {
  Word: WordAttributeRaw[];
  frq: number;
}
interface WordAttributeRaw {
  n: string;
}

export async function fetchWords(query: string): Promise<WordListItem[]> {
  const url = `${NOSKETCH_API}/struct_wordlist?corpname=bytest
&wlattr=lemma_lc
&wlstruct_attr1=lc
&wlstruct_attr2=pos
&wlfile=${encodeURIComponent(query)}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  if(!data.Blocks) {
    return [];
  }
  const items = (data.Blocks[0]?.Items as StructWordListItemRaw[]) || [];
  const result: WordListItem[] = items.map(item => ({
    str: item.Word[0]?.n ?? "",
    pos: item.Word[1]?.n,
    frq: item.frq,
  }));
  return result;
} 