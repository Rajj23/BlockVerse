"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Hash } from "lucide-react";
import { searchApi } from "@/lib/api/search";
import { SearchResponse } from "@/types";

export default function SearchPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = use(params);
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (val: string) => {
    setKeyword(val);
    if (val.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const { data } = await searchApi.search(val, parseInt(wsId));
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const total = (results?.documents?.length || 0) + (results?.blocks?.length || 0);

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Search</h1>

      {}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search documents and blocks..."
          autoFocus
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white text-sm"
        />
      </div>

      {}
      {loading && (
        <div className="text-sm text-neutral-400 text-center py-8">Searching...</div>
      )}

      {}
      {!loading && results && (
        <div className="space-y-6">
          <p className="text-xs text-neutral-400">{total} result{total !== 1 ? "s" : ""} for &quot;{keyword}&quot;</p>

          {}
          {results.documents?.length > 0 && (
            <div>
              <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Documents</h2>
              <div className="space-y-1">
                {results.documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => router.push(`/workspace/${wsId}/documents/${doc.id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="text-sm text-neutral-900 dark:text-white">{doc.title || "Untitled"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {}
          {results.blocks?.length > 0 && (
            <div>
              <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Blocks</h2>
              <div className="space-y-1">
                {results.blocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => router.push(`/workspace/${wsId}/documents/${block.documentId}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <Hash className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-900 dark:text-white truncate">{block.content || "Empty block"}</p>
                      <p className="text-xs text-neutral-400">{block.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {}
          {total === 0 && (
            <div className="text-sm text-neutral-400 text-center py-8">No results found</div>
          )}
        </div>
      )}

      {}
      {!loading && !results && (
        <div className="text-sm text-neutral-400 text-center py-8">
          Type at least 2 characters to search
        </div>
      )}
    </div>
  );
}