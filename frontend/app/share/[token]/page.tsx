"use client";

import { use, useEffect, useState } from "react";
import { documentApi } from "@/lib/api/document";
import { DocumentDetailsResponse } from "@/types";
import { FileText, AlertCircle } from "lucide-react";

const blockStyles: Record<string, string> = {
  PARAGRAPH: "text-base text-neutral-700 dark:text-neutral-300",
  HEADING1:  "text-3xl font-bold text-neutral-900 dark:text-white mt-6 mb-2",
  HEADING2:  "text-xl font-semibold text-neutral-900 dark:text-white mt-4 mb-1",
  TODO:      "text-base text-neutral-700 dark:text-neutral-300 flex items-center gap-2",
  BULLET:    "text-base text-neutral-700 dark:text-neutral-300",
  NUMBERED:  "text-base text-neutral-700 dark:text-neutral-300",
  CODE:      "font-mono text-sm bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-3 my-2 block",
  IMAGE:     "max-w-full max-h-96 object-contain rounded-lg my-2",
};

export default function SharedDocPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<DocumentDetailsResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentApi.getShared(token)
      .then(({ data }) => setData(data))
      .catch(() => setError("This link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-sm text-neutral-400">Loading document...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{error}</p>
        </div>
      </div>
    );
  }

  const topLevelBlocks = data?.blocks.filter((b) => !b.parentId) || [];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {}
      <div className="border-b border-neutral-200 dark:border-neutral-800 px-8 py-4 flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-neutral-900 dark:bg-white flex items-center justify-center">
          <span className="text-white dark:text-neutral-900 text-xs font-bold">B</span>
        </div>
        <span className="text-sm font-medium text-neutral-900 dark:text-white">BlockVerse</span>
        <span className="ml-auto text-xs text-neutral-400 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          Shared document · read only
        </span>
      </div>

      {}
      <div className="max-w-3xl mx-auto px-8 py-10">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-8">
          {data?.document.title || "Untitled"}
        </h1>

        <div className="space-y-1">
          {topLevelBlocks.map((block) => (
            <div key={block.id}>
              {block.type === "IMAGE" ? (
                <img
                  src={block.fileUrl || block.content}
                  alt=""
                  className={blockStyles.IMAGE}
                />
              ) : block.type === "TODO" ? (
                <div className={blockStyles.TODO}>
                  <input type="checkbox" disabled className="w-4 h-4" />
                  <span>{block.content}</span>
                </div>
              ) : block.type === "BULLET" ? (
                <div className={blockStyles.BULLET}>• {block.content}</div>
              ) : block.type === "CODE" ? (
                <code className={blockStyles.CODE}>{block.content}</code>
              ) : (
                <div className={blockStyles[block.type] || blockStyles.PARAGRAPH}>
                  {block.content}
                </div>
              )}

              {}
              {block.children?.length > 0 && (
                <div className="pl-6 border-l-2 border-neutral-100 dark:border-neutral-800 ml-2 mt-1 space-y-1">
                  {block.children.map((child) => (
                    <div key={child.id} className={blockStyles[child.type] || blockStyles.PARAGRAPH}>
                      {child.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}