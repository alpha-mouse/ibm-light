"use client";
import React, { useState } from "react";

const NOSKETCH_API = "https://bytest-app-one-lgm84.ondigitalocean.app/bonito/run.cgi";

interface ConcordanceLine {
  left: string;
  kwic: string;
  right: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ConcordanceLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      // Example: call /view?corpname=preloaded%2Fbnc&query=dog
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
      // The structure depends on NoSketch output; adjust as needed
      // Remove <s> and </s> tags and any extra whitespace between sentences
      const joinTokens = (arr: any[] = []) =>
        arr
          .map(token => (token.str ?? token.strc ?? ""))
          .join(" ")
          .replace(/ ?<\/?s> ?/g, "") // remove <s> and </s> and any spaces around them
          .replace(/\s{2,}/g, " ")    // collapse multiple spaces
          .trim();
      const lines: ConcordanceLine[] = (data.Lines || []).map((line: any) => ({
        left: joinTokens(line.Left),
        kwic: joinTokens(line.Kwic),
        right: joinTokens(line.Right),
      }));
      setResults(lines);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center">Corpus Search (NoSketch Engine)</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 w-full max-w-xl">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter word or phrase..."
          className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <button
          type="submit"
          className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="w-full max-w-2xl">
        {results.length > 0 && (
          <ul className="space-y-4">
            {results.map((line, idx) => (
              <li key={idx} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <span className="text-gray-500">{line.left} </span>
                <span className="font-bold text-blue-700 dark:text-blue-300">{line.kwic}</span>
                <span className="text-gray-500"> {line.right}</span>
              </li>
            ))}
          </ul>
        )}
        {results.length === 0 && !loading && (
          <div className="text-gray-400 text-center">No results yet. Try searching for a word.</div>
        )}
      </div>
    </div>
  );
}
