export interface ConcordanceLine {
  left: string;
  kwic: string;
  right: string;
}

type ConcordanceToken = { str?: string; strc?: string; coll?: number };
type ConcordanceLineRaw = {
  Left?: ConcordanceToken[];
  Kwic?: ConcordanceToken[];
  Right?: ConcordanceToken[];
};

const NOSKETCH_API = "https://bytest-app-one-lgm84.ondigitalocean.app/bonito/run.cgi";

function joinTokens(arr: ConcordanceToken[] = []) {
  return arr
    .map(token => token.str ?? token.strc ?? "")
    .join(" ")
    .replace(/ ?<\/?s> ?/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function fetchConcordanceLines(query: string): Promise<ConcordanceLine[]> {
  const url = `${NOSKETCH_API}/concordance?corpname=bytest
&attrs=word
&refs=doc
&attr_allpos=all
&viewmode=kwic
&cup_hl=q
&structs=s,g
&fromp=1
&pagesize=20
&kwicleftctx=100%23
&kwicrightctx=100%23
&json={"concordance_query":[{"queryselector":"iqueryrow","iquery":"${encodeURIComponent(query)}"}]}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  return (data.Lines || []).map((line: ConcordanceLineRaw) => ({
    left: joinTokens(line.Left),
    kwic: joinTokens(line.Kwic),
    right: joinTokens(line.Right),
  }));
} 