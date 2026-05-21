import api from "./axios";
import {
  CreateBlockRequest, UpdateBlockRequest, MoveBlockRequest,
  DeleteBlockRequest, BlockResponse, BlockChangeLogResponse
} from "@/types";

export const blockApi = {
  create: (documentId: number, data: CreateBlockRequest) =>
    api.post<BlockResponse>(`/v1/blocks/${documentId}`, data),

  update: (blockId: number, data: UpdateBlockRequest) =>
    api.put<BlockResponse>(`/v1/blocks/${blockId}`, data),

  delete: (blockId: number, data: DeleteBlockRequest) =>
    api.delete(`/v1/blocks/${blockId}`, { data }),

  move: (blockId: number, data: MoveBlockRequest) =>
    api.put<BlockResponse>(`/v1/blocks/${blockId}/move`, data),

  getChildren: (blockId: number) =>
    api.get<BlockResponse[]>(`/v1/blocks/${blockId}/children`),

  restoreVersion: (documentId: number, targetVersion: number) =>
    api.post(`/v1/blocks/restore/${documentId}`, { targetVersion }),

  getHistory: (documentId: number) =>
    api.get<BlockChangeLogResponse[]>(`/v1/blocks/history/${documentId}`),
};