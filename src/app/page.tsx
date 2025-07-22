"use client";
import React, { useState } from "react";
import { fetchConcordanceLines, ConcordanceLine } from "./concordanceApi";
import { fetchWords, WordListItem } from "./wordsApi";
import { dict } from "./dictionaries";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ConcordanceLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"concordance" | "words">("concordance");
  const [words, setWords] = useState<WordListItem[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      let lines: ConcordanceLine[] = [];
      if (tab === "concordance") {
        lines = await fetchConcordanceLines(query);
      } else if (tab === "words") {
        const wordItems = await fetchWords(query);
        setWords(wordItems);
      }
      setResults(lines);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab: "concordance" | "words") => {
    setTab(newTab);
    if (newTab === "words") {
      fetchWords(query).then(setWords);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center">{(dict as { site: { h1: string } }).site.h1}</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4 w-full max-w-xl">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={(dict as { homepage: { search: { hint: string } } }).homepage.search.hint}
          className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading
            ? ((dict as { homepage: { search: { searching?: string } } }).homepage.search.searching)
            : (dict as { homepage: { search: { button: string } } }).homepage.search.button}
        </button>
      </form>
      {/* Tabs */}
      <div className="flex justify-center mb-8 w-full max-w-xl">
        <button
          className={`px-4 py-2 -mb-px border-b-2 font-semibold transition-colors ${tab === "concordance" ? "border-blue-600 text-blue-700 dark:text-blue-300" : "border-transparent text-gray-500"}`}
          onClick={() => handleTabChange("concordance")}
        >
          {(dict as { homepage: { search: { concordance: string } } }).homepage.search.concordance}
        </button>
        <button
          className={`px-4 py-2 -mb-px border-b-2 font-semibold transition-colors ${tab === "words" ? "border-blue-600 text-blue-700 dark:text-blue-300" : "border-transparent text-gray-500"}`}
          onClick={() => handleTabChange("words")}
        >
          {(dict as { homepage: { search: { wordlist: string } } }).homepage.search.wordlist}
        </button>
      </div>
      {/* Tab content */}
      <div className="w-full max-w-2xl">
        {tab === "concordance" && (
          <>
            {error && <div className="text-red-600 mb-4">{error}</div>}
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
              <div className="text-gray-400 text-center">{(dict as { homepage: { search: { noresultsyet: string } } }).homepage.search.noresultsyet}</div>
            )}
          </>
        )}
        {tab === "words" && (
          <>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            {words.length > 0 && (
              <ul className="space-y-2">
                {words.map((word, idx) => (
                  <li
                    key={idx}
                    className="bg-white dark:bg-gray-800 p-3 rounded shadow text-gray-700 dark:text-gray-200 flex justify-between items-center"
                  >
                    <span>{word.str}</span>
                    <span>{word.pos}</span>
                    <span className="ml-4 text-right text-gray-500 dark:text-gray-400 min-w-[3.5rem] font-mono">
                      {word.frq}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {words.length === 0 && !loading && (
              <div className="text-gray-400 text-center">{(dict as { homepage: { search: { noresults: string } } }).homepage.search.noresults}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
