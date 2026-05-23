import { create } from "zustand";
import { DocumentResponse, BlockResponse } from "@/types";

interface DocumentState {
  document: DocumentResponse | null;
  blocks: BlockResponse[];
  version: number;
  focusedBlockId: number | null;
  activeUsers: { userId: number; userName: string }[];
  typingUsers: { userId: number; blockId: number }[];
  setDocument: (doc: DocumentResponse) => void;
  setBlocks: (blocks: BlockResponse[]) => void;
  setVersion: (version: number) => void;
  setFocusedBlockId: (id: number | null) => void;
  addBlock: (block: BlockResponse) => void;
  updateBlock: (blockId: number, updated: Partial<BlockResponse>) => void;
  removeBlock: (blockId: number) => void;
  addActiveUser: (userId: number, userName: string) => void;
  removeActiveUser: (userId: number) => void;
  setTypingUser: (userId: number, blockId: number | null) => void;
  updateDocumentTitle: (docId: number, title: string) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  document: null,
  blocks: [],
  version: 0,
  focusedBlockId: null,
  activeUsers: [],
  typingUsers: [],

  setDocument: (document) => set({ document, version: document.version }),
  setBlocks: (blocks) => set({ blocks }),
  setVersion: (version) => set({ version }),
  setFocusedBlockId: (focusedBlockId) => set({ focusedBlockId }),

  addBlock: (block) =>
    set((state) => ({ blocks: [...state.blocks, block] })),

  updateBlock: (blockId, updated) =>
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === blockId ? { ...b, ...updated } : b
      ),
    })),

  removeBlock: (blockId) =>
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== blockId),
    })),

  addActiveUser: (userId, userName) =>
    set((state) => ({
      activeUsers: state.activeUsers.some((u) => u.userId === userId)
        ? state.activeUsers
        : [...state.activeUsers, { userId, userName }],
    })),

  removeActiveUser: (userId) =>
    set((state) => ({
      activeUsers: state.activeUsers.filter((u) => u.userId !== userId),
    })),

  setTypingUser: (userId, blockId) =>
    set((state) => ({
      typingUsers: blockId === null
        ? state.typingUsers.filter((t) => t.userId !== userId)
        : [
            ...state.typingUsers.filter((t) => t.userId !== userId),
            { userId, blockId },
          ],
    })),

  updateDocumentTitle: (docId, title) =>
    set((state) => ({
      document: state.document?.id === docId
        ? { ...state.document, title }
        : state.document,
    })),
}));