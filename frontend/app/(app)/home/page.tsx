"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Users, Lock } from "lucide-react";
import { workspaceApi } from "@/lib/api/workspace";
import { documentApi } from "@/lib/api/document";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import { useToastStore } from "@/lib/store/toastStore";
import { DocumentResponse, WorkSpaceDetailsResponse } from "@/types";
import { WorkSpaceCreateRequest } from "@/types";
import clsx from "clsx";

export default function HomePage() {
  const router = useRouter();
  const { activeWorkspace, setActiveWorkspace, workspaces, setWorkspaces } = useWorkspaceStore();
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newWs, setNewWs] = useState<WorkSpaceCreateRequest>({ name: "", workSpaceType: "TEAM" });
  const [creating, setCreating] = useState(false);

  const { show: showToast } = useToastStore();
  const [editingWsName, setEditingWsName] = useState(false);
  const [wsName, setWsName] = useState(activeWorkspace?.name || "");
  const [savingWs, setSavingWs] = useState(false);

  
  useEffect(() => {
    setWsName(activeWorkspace?.name || "");
  }, [activeWorkspace]);

  const handleSaveWsName = async () => {
    if (!activeWorkspace || wsName.trim() === activeWorkspace.name) {
      setEditingWsName(false);
      return;
    }
    setSavingWs(true);
    try {
      await workspaceApi.update(activeWorkspace.id, {
        name: wsName,
        workSpaceType: activeWorkspace.workSpaceType,
      });
      setActiveWorkspace({ ...activeWorkspace, name: wsName });
      
      setWorkspaces(workspaces.map((ws) =>
        ws.id === activeWorkspace.id ? { ...ws, name: wsName } : ws
      ));
      showToast("Workspace name updated", "success");
    } catch {
      showToast("Failed to update workspace name", "error");
      setWsName(activeWorkspace.name);
    } finally {
      setSavingWs(false);
      setEditingWsName(false);
    }
  };

  
  useEffect(() => {
    if (!activeWorkspace) return;
    setLoading(true);
    
    
    setLoading(false);
  }, [activeWorkspace]);

  const handleCreateWorkspace = async () => {
    if (!newWs.name.trim()) return;
    setCreating(true);
    try {
      await workspaceApi.create(newWs);
      
      const { data } = await workspaceApi.list();
      setWorkspaces(data);
      setActiveWorkspace(data[data.length - 1]);
      setShowModal(false);
      setNewWs({ name: "", workSpaceType: "TEAM" });
    } finally {
      setCreating(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!activeWorkspace) return;
    const { data } = await documentApi.create(activeWorkspace.id, { title: "Untitled" });
    router.push(`/workspace/${activeWorkspace.id}/documents/${data.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {}
      <div className="flex items-center justify-between mb-8">
        <div>
          {editingWsName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                onBlur={handleSaveWsName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveWsName();
                  if (e.key === "Escape") { setEditingWsName(false); setWsName(activeWorkspace?.name || ""); }
                }}
                className="text-2xl font-bold bg-transparent border-b-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white outline-none"
              />
              {savingWs && <span className="text-xs text-neutral-400">Saving...</span>}
            </div>
          ) : (
            <h1
              className="text-2xl font-bold text-neutral-900 dark:text-white cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => setEditingWsName(true)}
              title="Click to rename"
            >
              {activeWorkspace?.name || "Home"}
            </h1>
          )}
          {activeWorkspace && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5">
              {activeWorkspace.workSpaceType === "PRIVATE"
                ? <><Lock className="w-3.5 h-3.5" /> Private workspace</>
                : <><Users className="w-3.5 h-3.5" /> Team workspace · {activeWorkspace.memberCount} members</>
              }
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New workspace
          </button>
          <button
            onClick={handleCreateDocument}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New document
          </button>
        </div>
      </div>

      {}
      {workspaces.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
            Your Workspaces
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspace(ws)}
                className={clsx(
                  "p-4 rounded-xl border text-left transition-all",
                  activeWorkspace?.id === ws.id
                    ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center mb-3">
                  <span className="text-white dark:text-neutral-900 font-bold text-sm">
                    {ws.name[0].toUpperCase()}
                  </span>
                </div>
                <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">{ws.name}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {ws.workSpaceType === "PRIVATE" ? "Private" : `${ws.memberCount} members`}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {}
      {!activeWorkspace && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">
            No workspace yet
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Create your first workspace to get started
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Create workspace
          </button>
        </div>
      )}

      {}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              New Workspace
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Workspace name"
                value={newWs.name}
                onChange={(e) => setNewWs({ ...newWs, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              />
              <div className="flex gap-2">
                {(["TEAM", "PRIVATE"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewWs({ ...newWs, workSpaceType: type })}
                    className={clsx(
                      "flex-1 py-2 rounded-lg text-sm border transition-colors",
                      newWs.workSpaceType === type
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                        : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                    )}
                  >
                    {type === "TEAM" ? "👥 Team" : "🔒 Private"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkspace}
                disabled={creating || !newWs.name.trim()}
                className="flex-1 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}