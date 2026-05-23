import api from "./axios";
import {
  WorkSpaceCreateRequest, UpdateWorkSpaceRequest,
  WorkSpaceDetailsResponse, AddMemberRequest, ChangeMemberRoleRequest
} from "@/types";

export const workspaceApi = {
  create: (data: WorkSpaceCreateRequest) =>
    api.post<string>("/v1/workspaces", data),

  delete: (id: number) =>
    api.delete(`/v1/workspaces/${id}`),

  list: () =>
    api.get<WorkSpaceDetailsResponse[]>("/v1/workspaces/all"),

  get: (id: number) =>
    api.get<WorkSpaceDetailsResponse>(`/v1/workspaces/${id}`),

  update: (id: number, data: UpdateWorkSpaceRequest) =>
    api.put(`/v1/workspaces/${id}`, data),

  addMember: (wsId: number, data: AddMemberRequest) =>
    api.post(`/v1/workspaces/${wsId}/member/add`, data),

  removeMember: (wsId: number, email: string) =>
    api.delete(`/v1/workspaces/${wsId}/member/remove`, { params: { email } }),

  changeMemberRole: (wsId: number, data: ChangeMemberRoleRequest) =>
    api.post(`/v1/workspaces/${wsId}/member/change-role`, data),

  leaveWorkspace: (wsId: number) =>
    api.post(`/v1/workspaces/${wsId}/member/leave`),

  transferOwnership: (wsId: number, newOwnerEmail: string) =>
    api.post(`/v1/workspaces/${wsId}/member/transfer-ownership`, null, {
      params: { newOwnerEmail }
    }),

  countMembers: (wsId: number) =>
    api.get<number>(`/v1/workspaces/${wsId}/member/count`),
};