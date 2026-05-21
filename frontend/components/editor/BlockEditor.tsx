"use client";

import { useEffect, useState } from "react";
import { blockApi } from "@/lib/api/block";
import { documentApi } from "@/lib/api/document";
import { useDocumentStore } from "@/lib/store/documentStore";
import { useDocumentSocket } from "@/lib/websocket/useDocumentSocket";
import { useAuthStore } from "@/lib/store/authStore";
import { useToastStore } from "@/lib/store/toastStore";
import BlockItem from "./BlockItem";
import ActivityPanel from "./ActivityPanel";
import EditorNavbar from "@/components/layout/EditorNavbar";
import { Users } from "lucide-react";

interface BlockEditorProps {
  documentId: number;
  workspaceId: number;
}

export default function BlockEditor({ documentId, workspaceId }: BlockEditorProps) {
  const { show: showToast } = useToastStore();
  const { user } = useAuthStore();
  const {
    document, blocks, version,
    setDocument, setBlocks, addBlock,
    activeUsers, setVersion
  } = useDocumentStore();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const { sendTyping } = useDocumentSocket(documentId);

  useEffect(() => {
    setLoading(true);
    documentApi.getWithBlocks(documentId).then(({ data }) => {
      setDocument(data.document);
      setBlocks(data.blocks);
      setTitle(data.document.title);
    }).finally(() => setLoading(false));
  }, [documentId, setDocument, setBlocks]);

  const handleTitleChange = (val: string) => setTitle(val);

  const handleTitleBlur = async () => {
    if (!document || title === document.title) return;
    setSavingTitle(true);
    try {
      await documentApi.update(documentId, { title });
      
      setDocument({ ...document, title });
      showToast("Title saved", "success");
    } catch {
      showToast("Failed to save title", "error");
    } finally {
      setSavingTitle(false);
    }
  };

  const handleAddBelow = async (afterBlockId: number, parentId?: number) => {
    try {
      const { data } = await blockApi.create(documentId, {
        type: "PARAGRAPH",
        content: "",
        parentId,
        documentVersion: version,
      });
      addBlock(data);
      const docRes = await documentApi.get(documentId);
      setVersion(docRes.data.version);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e?.response?.status === 429) showToast("Rate limit reached. Please slow down.", "warning");
      if (e?.response?.status === 409) {
        showToast("Document updated by someone else. Please refresh.", "error");
        const docRes = await documentApi.get(documentId);
        setVersion(docRes.data.version);
      }
    }
  };

  const topLevelBlocks = blocks.filter((b) => !b.parentId);

  return (
    <div className="flex flex-col h-screen">
      {}
      <EditorNavbar workspaceId={workspaceId} documentId={documentId} />

      {}
      <div className="px-8 py-2 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <ActivityPanel workspaceId={workspaceId} />
      </div>

      {}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-10">
          {}
          {activeUsers.filter((u) => u.userId !== user?.id).length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-4 h-4 text-neutral-400" />
              <div className="flex -space-x-2">
                {activeUsers
                  .filter((u) => u.userId !== user?.id)
                  .map((u) => (
                    <div
                      key={u.userId}
                      title={u.userName}
                      className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white dark:border-neutral-950 flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-medium">
                        {u.userName[0].toUpperCase()}
                      </span>
                    </div>
                  ))}
              </div>
              <span className="text-xs text-neutral-400">
                {activeUsers.filter((u) => u.userId !== user?.id).length} others editing
              </span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-sm text-neutral-400">Loading document...</div>
            </div>
          ) : (
            <>
              {}
              <div className="relative group/title mb-8">
                <textarea
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onBlur={handleTitleBlur}
                  placeholder="Untitled"
                  rows={1}
                  className="w-full text-4xl font-bold text-neutral-900 dark:text-white bg-transparent border-none outline-none resize-none placeholder-neutral-300 dark:placeholder-neutral-700 leading-tight"
                />
                {savingTitle && (
                  <span className="absolute right-0 top-2 text-xs text-neutral-400">Saving...</span>
                )}
              </div>

              {}
              <div className="space-y-0.5">
                {topLevelBlocks.length === 0 ? (
                  <button
                    onClick={() => handleAddBelow(0)}
                    className="w-full text-left text-base text-neutral-300 dark:text-neutral-700 hover:text-neutral-400 py-1"
                  >
                    Click to start writing, or type / for commands
                  </button>
                ) : (
                  topLevelBlocks.map((block) => (
                    <BlockItem
                      key={block.id}
                      block={block}
                      documentId={documentId}
                      onAddBelow={handleAddBelow}
                      sendTyping={sendTyping}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}