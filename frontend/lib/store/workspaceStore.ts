import { create } from "zustand";
import { WorkSpaceDetailsResponse } from "@/types";

interface WorkspaceState {
  workspaces: WorkSpaceDetailsResponse[];
  activeWorkspace: WorkSpaceDetailsResponse | null;
  setWorkspaces: (workspaces: WorkSpaceDetailsResponse[]) => void;
  setActiveWorkspace: (workspace: WorkSpaceDetailsResponse) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
}));