"use client";
import api from "@/lib/api/axios";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { BlockResponse, BlockType } from "@/types";
import { blockApi } from "@/lib/api/block";
import { useDocumentStore } from "@/lib/store/documentStore";
import { Trash2, GripVertical } from "lucide-react";
import clsx from "clsx";
import { documentApi } from "@/lib/api/document";
import { Upload } from "lucide-react";
import { useToastStore } from "@/lib/store/toastStore";

interface BlockItemProps {
  block: BlockResponse;
  documentId: number;
  onAddBelow: (blockId: number, parentId?: number) => void;
  sendTyping: (blockId: number, action: "typing" | "stopped") => void;
}

const blockStyles: Record<BlockType, string> = {
  PARAGRAPH: "text-base text-neutral-900 dark:text-neutral-100",
  HEADING1: "text-3xl font-bold text-neutral-900 dark:text-white",
  HEADING2: "text-xl font-semibold text-neutral-900 dark:text-white",
  TODO: "text-base text-neutral-900 dark:text-neutral-100",
  BULLET: "text-base text-neutral-900 dark:text-neutral-100",
  NUMBERED: "text-base text-neutral-900 dark:text-neutral-100",
  CODE: "font-mono text-sm bg-neutral-100 dark:bg-neutral-800 rounded px-3 py-2",
  IMAGE: "text-base",
};

const blockPlaceholders: Record<BlockType, string> = {
  PARAGRAPH: "Type something...",
  HEADING1: "Heading 1",
  HEADING2: "Heading 2",
  TODO: "To-do",
  BULLET: "List item",
  NUMBERED: "Numbered item",
    CODE: "Enter code...",
  IMAGE: "Paste image URL...",
};

export default function BlockItem({
  block, documentId, onAddBelow, sendTyping
}: BlockItemProps) {
  const { show: showToast } = useToastStore();
  const [content, setContent] = useState(block.content || "");
  const [hovered, setHovered] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { updateBlock, removeBlock, version, setVersion } = useDocumentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data: url } = await api.post<string>("/v1/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await saveBlock(url, "IMAGE");
      updateBlock(block.id, { content: url, fileUrl: url });
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e?.response?.status === 429) showToast("Upload rate limit reached. Please slow down.", "warning");
    }
  };

  const handleChange = (val: string) => {
    
    if (val === "/") {
      setShowTypeMenu(true);
    } else {
      setShowTypeMenu(false);
    }
    setContent(val);

    
    sendTyping(block.id, "typing");
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTyping(block.id, "stopped");
      
      saveBlock(val, block.type);
    }, 600);
  };

  const saveBlock = async (newContent: string, type: BlockType) => {
    try {
      const { data } = await blockApi.update(block.id, {
        type,
        content: newContent,
        documentVersion: version,
      });
      updateBlock(block.id, { content: data.content, type: data.type });
      
      const docRes = await documentApi.get(block.documentId);
      setVersion(docRes.data.version);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e?.response?.status === 409) {
        showToast("Document updated by someone else. Please refresh.", "error");
        
        const docRes = await documentApi.get(block.documentId);
        setVersion(docRes.data.version);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAddBelow(block.id, block.parentId ?? undefined);
    }
    if (e.key === "Backspace" && content === "") {
      handleDelete();
    }
  };

  const handleDelete = async () => {
    try {
      await blockApi.delete(block.id, { documentVersion: version });
      removeBlock(block.id);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e?.response?.status === 429) {
        showToast("Too many requests. Please slow down.", "warning");
      }
    }
  };

  const handleTypeChange = async (type: BlockType) => {
    setShowTypeMenu(false);
    setContent("");
    await saveBlock("", type);
    updateBlock(block.id, { type });
  };

  const blockTypes: { type: BlockType; label: string; icon: string }[] = [
    { type: "PARAGRAPH", label: "Text", icon: "¶" },
    { type: "HEADING1", label: "Heading 1", icon: "H1" },
    { type: "HEADING2", label: "Heading 2", icon: "H2" },
    { type: "TODO", label: "To-do", icon: "☐" },
    { type: "BULLET", label: "Bullet list", icon: "•" },
    { type: "NUMBERED", label: "Numbered list", icon: "1." },
    { type: "CODE", label: "Code", icon: "</>" },
    { type: "IMAGE", label: "Image", icon: "🖼" },
  ];

  return (
    <div
      className="group relative flex items-start gap-1 py-0.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {}
      <div className={clsx(
        "flex items-center gap-0.5 mt-1 transition-opacity shrink-0",
        hovered ? "opacity-100" : "opacity-0"
      )}>
        <button className="p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-grab">
          <GripVertical className="w-3.5 h-3.5 text-neutral-400" />
        </button>
        <button
          onClick={handleDelete}
          className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-500" />
        </button>
      </div>

      {}
      <div className="flex-1 relative">
        {}
        {block.type === "TODO" && (
          <input
            type="checkbox"
            className="absolute left-0 top-1.5 w-4 h-4 rounded border-neutral-300"
          />
        )}

        {}
        {block.type === "BULLET" && (
          <span className="absolute left-0 top-1 text-neutral-400 text-lg leading-none">•</span>
        )}

        {block.type === "IMAGE" ? (
          <div className="w-full">
            {block.content || block.fileUrl ? (
              <div className="relative group/img">
                <img
                  src={block.fileUrl || block.content}
                  alt="Block image"
                  className="max-w-full max-h-96 object-contain rounded-lg border border-neutral-200 dark:border-neutral-700"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 px-2 py-1 rounded bg-black/50 text-white text-xs transition-opacity"
                >
                  Replace
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 py-8 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
              >
                <Upload className="w-6 h-6 text-neutral-400" />
                <span className="text-sm text-neutral-400">Click to upload image</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
            </div>
          ) : (
            <div>{block.content}</div>
          )}

          {showTypeMenu && (
          <div className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 z-50 overflow-hidden">
            <div className="px-3 py-2 text-xs text-neutral-400 border-b border-neutral-100 dark:border-neutral-700">
              Block type
            </div>
            {blockTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <span className="w-6 text-center text-neutral-400 font-mono text-xs">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {block.children && block.children.length > 0 && (
        <div className="pl-6 mt-1 border-l-2 border-neutral-100 dark:border-neutral-800 w-full">
          {block.children.map((child) => (
            <BlockItem
              key={child.id}
              block={child}
              documentId={documentId}
              onAddBelow={onAddBelow}
              sendTyping={sendTyping}
            />
          ))}
        </div>
      )}
    </div>
  );
}