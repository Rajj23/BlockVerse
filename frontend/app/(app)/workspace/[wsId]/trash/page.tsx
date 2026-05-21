"use client";

import { use, useEffect, useState } from "react";
import { Trash2, RotateCcw, X } from "lucide-react";
import { documentApi } from "@/lib/api/document";
import { DocumentResponse } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useToastStore } from "@/lib/store/toastStore";
import { AxiosError } from "axios";

export default function TrashPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = use(params);
  const { show: showToast } = useToastStore();
  const [docs, setDocs] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    documentApi.getTrash(parseInt(wsId))
      .then(({ data }) => setDocs(data))
      .finally(() => setLoading(false));
  }, [wsId]);

  const handleRestore = async (docId: number) => {
    await documentApi.restoreFromTrash(docId);
    setDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const handlePermanentDelete = async () => {
    if (docToDelete === null) return;
    setDeleting(true);
    try {
      await documentApi.permanentDelete(docToDelete);
      setDocs((prev) => prev.filter((d) => d.id !== docToDelete));
      showToast("Document permanently deleted.", "success");
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>;
      showToast(e?.response?.data?.message || "Failed to delete document", "error");
    } finally {
      setDeleting(false);
      setDocToDelete(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Trash</h1>

      {loading ? (
        <div className="text-sm text-neutral-400 text-center py-8">Loading...</div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Trash2 className="w-10 h-10 text-neutral-200 dark:text-neutral-700 mb-3" />
          <p className="text-sm text-neutral-400">Trash is empty</p>
        </div>
      ) : (
        <div className="space-y-1">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                  {doc.title || "Untitled"}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Deleted {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRestore(doc.id)}
                  title="Restore"
                  className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-neutral-500" />
                </button>
                <button
                  onClick={() => setDocToDelete(doc.id)}
                  title="Delete permanently"
                  className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      {docToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Permanent Delete</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              Permanently delete this document? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDocToDelete(null)}
                className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}