"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  FileText, Search, Settings, ChevronDown, Plus,
  Trash2, LogOut, Users, FolderOpen, MoreHorizontal,
  Archive, Trash2 as TrashIcon, RotateCcw, History, X
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import { workspaceApi } from "@/lib/api/workspace";
import { documentApi } from "@/lib/api/document";
import { blockApi } from "@/lib/api/block";
import { DocumentResponse, BlockChangeLogResponse } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useToastStore } from "@/lib/store/toastStore";
import { useDocumentStore } from "@/lib/store/documentStore";
import clsx from "clsx";
import { AxiosError } from "axios";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { workspaces, activeWorkspace, setWorkspaces, setActiveWorkspace } = useWorkspaceStore();

  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [archivedDocs, setArchivedDocs] = useState<DocumentResponse[]>([]);
  const [expandedWs, setExpandedWs] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [docMenuOpen, setDocMenuOpen] = useState<number | null>(null);
  const [historyDocId, setHistoryDocId] = useState<number | null>(null);
  const [history, setHistory] = useState<BlockChangeLogResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [restoreVersion, setRestoreVersion] = useState<number | null>(null);
  const [restoring, setRestoring] = useState(false);
  const { show: showToast } = useToastStore();
  const { document: activeDoc } = useDocumentStore();

  const menuRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDocMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  
  useEffect(() => {
    workspaceApi.list()
      .then(({ data }) => {
        setWorkspaces(data);
        if (data.length > 0 && !activeWorkspace) {
          setActiveWorkspace(data[0]);
        }
      })
      .catch((err) => console.error("Failed to load workspaces", err));
  }, [activeWorkspace, setActiveWorkspace, setWorkspaces]);

  
  useEffect(() => {
    if (!activeWorkspace) return;
    setLoadingDocs(true);
    Promise.all([
      documentApi.getByWorkspace(activeWorkspace.id),
      documentApi.getArchived(activeWorkspace.id).catch(() => ({ data: [] as DocumentResponse[] })),
    ])
      .then(([docsRes, archivedRes]) => {
        setDocuments(docsRes.data.filter((d) => !d.deleted));
        setArchivedDocs(archivedRes.data);
      })
      .catch(() => { setDocuments([]); setArchivedDocs([]); })
      .finally(() => setLoadingDocs(false));
  }, [activeWorkspace]);

  const refreshDocs = async () => {
    if (!activeWorkspace) return;
    const [docsRes, archivedRes] = await Promise.all([
      documentApi.getByWorkspace(activeWorkspace.id),
      documentApi.getArchived(activeWorkspace.id).catch(() => ({ data: [] as DocumentResponse[] })),
    ]);
    setDocuments(docsRes.data.filter((d) => !d.deleted));
    setArchivedDocs(archivedRes.data);
  };

  const handleRestoreVersion = async () => {
    if (!historyDocId || restoreVersion === null) return;
    setRestoring(true);
    try {
      await blockApi.restoreVersion(historyDocId, restoreVersion);
      showToast("Document restored successfully.", "success");
      setHistoryDocId(null);
      setRestoreVersion(null);
      window.location.reload();
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>;
      showToast(e?.response?.data?.message || "Restore failed", "error");
    } finally {
      setRestoring(false);
    }
  };

  const handleLogout = () => { logout(); router.push("/login"); };
  const isActive = (path: string) => pathname === path;

  const displayDocuments = documents.map((doc) =>
    activeDoc && doc.id === activeDoc.id
      ? { ...doc, title: activeDoc.title }
      : doc
  );

  return (
    <aside className="w-60 h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shrink-0 overflow-visible">

      {}
      <div className="px-3 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setExpandedWs(!expandedWs)}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-neutral-900 dark:bg-white flex items-center justify-center shrink-0">
              <span className="text-white dark:text-neutral-900 text-xs font-bold">
                {activeWorkspace?.name?.[0]?.toUpperCase() || "B"}
              </span>
            </div>
            <span className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {activeWorkspace?.name || "BlockVerse"}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
        </button>

        {expandedWs && workspaces.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => { setActiveWorkspace(ws); router.push("/home"); }}
                className={clsx(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                  activeWorkspace?.id === ws.id
                    ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                )}
              >
                <div className="w-4 h-4 rounded bg-neutral-400 dark:bg-neutral-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{ws.name[0].toUpperCase()}</span>
                </div>
                <span className="truncate">{ws.name}</span>
                <span className="ml-auto text-xs text-neutral-400">
                  {ws.workSpaceType === "PRIVATE" ? "🔒" : "👥"}
                </span>
              </button>
            ))}
            <button
              onClick={() => router.push("/home")}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New workspace
            </button>
          </div>
        )}
      </div>

      {}
      <nav className="px-3 py-2 space-y-0.5">
        {[
          { href: "/home", icon: FolderOpen, label: "Home" },
          { href: activeWorkspace ? `/workspace/${activeWorkspace.id}/search` : "#", icon: Search, label: "Search" },
          { href: activeWorkspace ? `/workspace/${activeWorkspace.id}/members` : "#", icon: Users, label: "Members" },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={label}
            href={href}
            className={clsx(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
              isActive(href)
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {}
      <div className="px-3 py-2 flex-1 overflow-y-auto overflow-x-visible">
        <div className="flex items-center justify-between px-2 py-1 mb-1">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Documents</span>
          <button
            onClick={async () => {
              if (!activeWorkspace) return;
              const { data } = await documentApi.create(activeWorkspace.id, { title: "Untitled" });
              await refreshDocs();
              router.push(`/workspace/${activeWorkspace.id}/documents/${data.id}`);
            }}
            className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-neutral-500" />
          </button>
        </div>

        {loadingDocs ? (
          <div className="px-2 py-1 text-xs text-neutral-400">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="px-2 py-1 text-xs text-neutral-400">No documents yet</div>
        ) : (
          <div className="space-y-0.5" ref={menuRef}>
            {displayDocuments.map((doc) => (
              <div
                key={doc.id}
                className={clsx(
                  "group flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors",
                  pathname.includes(`/documents/${doc.id}`)
                    ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                )}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <Link
                  href={`/workspace/${activeWorkspace?.id}/documents/${doc.id}`}
                  className="flex-1 truncate"
                >
                  {doc.title || "Untitled"}
                </Link>

                {}
                <div className="relative shrink-0">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDocMenuOpen(docMenuOpen === doc.id ? null : doc.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-all"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>

                  {docMenuOpen === doc.id && (
                    <div className="fixed z-[999] w-44 bg-white dark:bg-neutral-800 rounded-lg shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                      style={{ left: "240px", marginTop: "-28px" }}
                    >
                      <button
                        onClick={async () => {
                          setDocMenuOpen(null);
                          setHistoryDocId(doc.id);
                          setLoadingHistory(true);
                          try {
                            const { data } = await blockApi.getHistory(doc.id);
                            setHistory(data);
                          } finally {
                            setLoadingHistory(false);
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                      >
                        <History className="w-3.5 h-3.5" />
                        History
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            await documentApi.archive(doc.id);
                            await refreshDocs();
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setDocMenuOpen(null);
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        Archive
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            await documentApi.softDelete(doc.id);
                            await refreshDocs();
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setDocMenuOpen(null);
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        Move to trash
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}



        {}
        {archivedDocs.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-1.5 px-2 py-1 w-full text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              <ChevronDown className={clsx("w-3 h-3 transition-transform", showArchived && "rotate-180")} />
              Archived ({archivedDocs.length})
            </button>

            {showArchived && (
              <div className="space-y-0.5 mt-0.5">
                {archivedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="group flex items-center gap-1 px-2 py-1.5 rounded-md text-sm text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0 opacity-40" />
                    <span className="flex-1 truncate italic text-xs">{doc.title || "Untitled"}</span>

                    {}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={async () => {
                          try {
                            await documentApi.unarchive(doc.id);
                            await refreshDocs();
                          } catch (err) { console.error(err); }
                        }}
                        title="Unarchive"
                        className="p-1 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700 hover:text-green-500 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await documentApi.softDelete(doc.id);
                            await refreshDocs();
                          } catch (err) { console.error(err); }
                        }}
                        title="Move to trash"
                        className="p-1 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {}
        <div className="mt-2">
          <Link
            href={activeWorkspace ? `/workspace/${activeWorkspace.id}/trash` : "#"}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            Trash
          </Link>
        </div>
      </div>

      {}
      <div className="px-3 py-3 border-t border-neutral-200 dark:border-neutral-800 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>

        {user && (
          <div className="flex items-center gap-2 px-2 py-1.5 mt-1">
            <div className="w-6 h-6 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {user.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-neutral-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {}
      {historyDocId !== null && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setHistoryDocId(null)} />
          <div className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-neutral-900 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-neutral-500" />
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Document History</h2>
              </div>
              <button onClick={() => setHistoryDocId(null)} className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-neutral-400">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <History className="w-8 h-8 text-neutral-200 dark:text-neutral-700 mb-2" />
                  <p className="text-sm text-neutral-400">No history yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {history.map((item, i) => (
                    <div key={i} className="relative pl-6">
                      {i !== history.length - 1 && (
                        <div className="absolute left-2 top-4 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700" />
                      )}
                      <div className={clsx(
                        "absolute left-0.5 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900",
                        item.operationType === "CREATE" && "bg-green-500",
                        item.operationType === "UPDATE" && "bg-blue-500",
                        item.operationType === "DELETE" && "bg-red-500",
                        item.operationType === "MOVE" && "bg-purple-500",
                      )} />
                      <div className="pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={clsx(
                            "text-xs font-medium px-1.5 py-0.5 rounded",
                            item.operationType === "CREATE" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                            item.operationType === "UPDATE" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                            item.operationType === "DELETE" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                            item.operationType === "MOVE" && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                          )}>
                            {item.operationType}
                          </span>
                          <span className="text-xs text-neutral-400">v{item.versionNumber}</span>
                        </div>
                        {item.oldContent && (
                          <div className="mb-1 px-2 py-1 rounded bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                            <p className="text-xs text-red-600 dark:text-red-400 line-through truncate">{item.oldContent}</p>
                          </div>
                        )}
                        {item.newContent && (
                          <div className="px-2 py-1 rounded bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                            <p className="text-xs text-green-600 dark:text-green-400 truncate">{item.newContent}</p>
                          </div>
                        )}
                        <p className="text-xs text-neutral-400 mt-1.5">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </p>
                        <button
                          onClick={() => setRestoreVersion(item.versionNumber)}
                          className="mt-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline transition-colors"
                        >
                          Restore this version
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {}
      {restoreVersion !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Restore Version</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              Restore document to version {restoreVersion}? Current changes will be recorded in history.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setRestoreVersion(null)}
                className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreVersion}
                disabled={restoring}
                className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {restoring ? "Restoring..." : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}