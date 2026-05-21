"use client";

import { use, useState } from "react";
import { Users, Plus, Shield, Crown, UserMinus, RefreshCw } from "lucide-react";
import { workspaceApi } from "@/lib/api/workspace";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import { WorkSpaceRole } from "@/types";
import { useToastStore } from "@/lib/store/toastStore";
import clsx from "clsx";
import { AxiosError } from "axios";

const roleConfig: Record<WorkSpaceRole, { label: string; icon: React.ReactNode; color: string }> = {
  OWNER: {
    label: "Owner",
    icon: <Crown className="w-3 h-3" />,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  },
  ADMIN: {
    label: "Admin",
    icon: <Shield className="w-3 h-3" />,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  },
  MEMBER: {
    label: "Member",
    icon: <Users className="w-3 h-3" />,
    color: "text-neutral-600 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
  },
};

export default function MembersPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = use(params);
  const { show: showToast } = useToastStore();
  const { activeWorkspace } = useWorkspaceStore();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkSpaceRole>("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");

  
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isOwner = activeWorkspace?.userRoleInWorkSpace === "OWNER";
  const isAdminOrOwner = isOwner || activeWorkspace?.userRoleInWorkSpace === "ADMIN";

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      await workspaceApi.addMember(parseInt(wsId), {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteSuccess(`${inviteEmail} has been invited as ${inviteRole}`);
      setInviteEmail("");
      setTimeout(() => {
        setShowInvite(false);
        setInviteSuccess("");
      }, 2000);
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>;
      setInviteError(e?.response?.data?.message || "Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  const initiateTransfer = () => {
    if (!transferEmail.trim()) return;
    setShowTransferConfirm(true);
  };

  const handleTransfer = async () => {
    setTransferring(true);
    try {
      await workspaceApi.transferOwnership(parseInt(wsId), transferEmail);
      setShowTransfer(false);
      setShowTransferConfirm(false);
      setTransferEmail("");
      showToast("Ownership transferred successfully. Please refresh.", "success");
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>;
      showToast(e?.response?.data?.message || "Transfer failed", "error");
    } finally {
      setTransferring(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await workspaceApi.leaveWorkspace(parseInt(wsId));
      window.location.href = "/home";
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>;
      showToast(e?.response?.data?.message || "Failed to leave workspace", "error");
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Members</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {activeWorkspace?.memberCount} member{activeWorkspace?.memberCount !== 1 ? "s" : ""} in this workspace
          </p>
        </div>
        {isAdminOrOwner && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Invite member
          </button>
        )}
      </div>

      {}
      <div className="mb-6 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <p className="text-xs text-neutral-400 mb-2">Your role</p>
        <div className="flex items-center gap-2">
          {activeWorkspace?.userRoleInWorkSpace && (
            <span className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
              roleConfig[activeWorkspace.userRoleInWorkSpace].color
            )}>
              {roleConfig[activeWorkspace.userRoleInWorkSpace].icon}
              {roleConfig[activeWorkspace.userRoleInWorkSpace].label}
            </span>
          )}
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            in {activeWorkspace?.name}
          </span>
        </div>
      </div>

      {}
      <div className="space-y-3 mb-8">
        <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Actions</h2>

        {}
        {isAdminOrOwner && (
          <button
            onClick={() => setShowInvite(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Invite member</p>
              <p className="text-xs text-neutral-400">Add someone to this workspace by email</p>
            </div>
          </button>
        )}

        {}
        {isOwner && (
          <button
            onClick={() => setShowTransfer(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Transfer ownership</p>
              <p className="text-xs text-neutral-400">Hand over workspace ownership to another member</p>
            </div>
          </button>
        )}

        {}
        {!isOwner && (
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/30 bg-white dark:bg-neutral-900 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <UserMinus className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-500">Leave workspace</p>
              <p className="text-xs text-neutral-400">You will lose access to all documents</p>
            </div>
          </button>
        )}
      </div>

      {}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Invite Member
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Email address</label>
                <input
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Role</label>
                <div className="flex gap-2">
                  {(["MEMBER", "ADMIN"] as WorkSpaceRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => setInviteRole(role)}
                      className={clsx(
                        "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm border transition-colors",
                        inviteRole === role
                          ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                      )}
                    >
                      {roleConfig[role].icon}
                      {roleConfig[role].label}
                    </button>
                  ))}
                </div>
              </div>

              {inviteSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400">{inviteSuccess}</p>
              )}
              {inviteError && (
                <p className="text-sm text-red-500">{inviteError}</p>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setShowInvite(false); setInviteError(""); setInviteEmail(""); }}
                className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="flex-1 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium disabled:opacity-50"
              >
                {inviting ? "Inviting..." : "Send invite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Transfer Ownership
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Enter the email of the member you want to transfer ownership to.
            </p>
            <input
              type="email"
              placeholder="member@example.com"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowTransfer(false)}
                className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={initiateTransfer}
                disabled={transferring || !transferEmail.trim()}
                className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {transferring ? "Transferring..." : "Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {showTransferConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Are you sure?</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              Transfer ownership to <span className="font-semibold text-neutral-900 dark:text-white">{transferEmail}</span>? You will become an ADMIN.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTransferConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={transferring}
                className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {transferring ? "Transferring..." : "Yes, transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Leave Workspace</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              Are you sure you want to leave this workspace? You will lose access to all documents.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {leaving ? "Leaving..." : "Leave Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}