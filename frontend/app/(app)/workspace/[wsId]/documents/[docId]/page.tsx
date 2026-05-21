"use client";

import { use, useEffect, useState } from "react";
import BlockEditor from "@/components/editor/BlockEditor";
import { documentApi } from "@/lib/api/document";
import { FileX } from "lucide-react";
import Link from "next/link";

export default function DocumentPage({
  params,
}: {
  params: Promise<{ wsId: string; docId: string }>;
}) {
  const { wsId, docId } = use(params);
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    documentApi.get(parseInt(docId))
      .then(() => setExists(true))
      .catch(() => setExists(false));
  }, [docId]);

  if (exists === null) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-sm text-neutral-400">Loading...</div>
    </div>
  );

  if (exists === false) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
          <FileX className="w-6 h-6 text-neutral-400" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">Document not found</h2>
        <p className="text-sm text-neutral-400 mb-4">This document may have been deleted or you don&apos;t have access.</p>
        <Link href="/home" className="text-sm text-neutral-900 dark:text-white underline">Back to home</Link>
      </div>
    </div>
  );

  return (
    <BlockEditor
      documentId={parseInt(docId)}
      workspaceId={parseInt(wsId)}
    />
  );
}