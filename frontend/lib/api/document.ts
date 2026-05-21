import api from "./axios";
import {
  CreateDocumentRequest, UpdateDocumentRequest,
  DocumentResponse, DocumentDetailsResponse, ShareLinkResponse
} from "@/types";

export const documentApi = {
  create: (workspaceId: number, data: CreateDocumentRequest) =>
    api.post<DocumentResponse>(`/v1/documents/${workspaceId}`, data),

  get: (documentId: number) =>
    api.get<DocumentResponse>(`/v1/documents/${documentId}`),

  getWithBlocks: (documentId: number) =>
    api.get<DocumentDetailsResponse>(`/v1/documents/${documentId}/details`),

  getByWorkspace: (workspaceId: number) =>
    api.get<DocumentResponse[]>(`/v1/documents/workspace/${workspaceId}`),

  update: (documentId: number, data: UpdateDocumentRequest) =>
    api.put<DocumentResponse>(`/v1/documents/${documentId}`, data),

  archive: (documentId: number) =>
    api.delete(`/v1/documents/${documentId}`),

  unarchive: (documentId: number) =>
    api.post(`/v1/documents/${documentId}/restore`),

  softDelete: (documentId: number) =>
    api.post(`/v1/documents/${documentId}/delete`),

  restoreFromTrash: (documentId: number) =>
    api.post(`/v1/documents/${documentId}/restore-deleted`),

  permanentDelete: (documentId: number) =>
    api.delete(`/v1/documents/${documentId}/permanent`),

  getArchived: (workspaceId: number) =>
    api.get<DocumentResponse[]>(`/v1/documents/workspace/${workspaceId}/archived`),

  getTrash: (workspaceId: number) =>
    api.get<DocumentResponse[]>(`/v1/documents/workspace/${workspaceId}/trash`),

  share: (documentId: number, expiryMinutes: number) =>
    api.post<ShareLinkResponse>(`/v1/documents/${documentId}/share`, null, {
      params: { expiryMinutes }
    }),

  getShared: (token: string) =>
    api.get<DocumentDetailsResponse>(`/share/${token}`),
};