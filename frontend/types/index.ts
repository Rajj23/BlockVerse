

export type BlockType = "PARAGRAPH" | "HEADING1" | "HEADING2" | "TODO" | "BULLET" | "NUMBERED" | "CODE" | "IMAGE";
export type WorkSpaceRole = "OWNER" | "ADMIN" | "MEMBER";
export type WorkSpaceType = "TEAM" | "PRIVATE";
export type NotificationType = "INVITE" | "CREATE" | "UPDATE" | "ARCHIVE" | "UNARCHIVE" | "DELETE" | "RESTORE" | "PERMANENT_DELETE" | "SHARE" | "LEAVE" | "COMMENT" | "ADD_MEMBER" | "REMOVE_MEMBER" | "ROLE_CHANGE" | "TRANSFER_OWNERSHIP";
export type AuditActionType = "WORKSPACE_CREATED" | "WORKSPACE_DELETED" | "WORKSPACE_UPDATED" | "DOCUMENT_CREATED" | "DOCUMENT_DELETED" | "DOCUMENT_UPDATED" | "DOCUMENT_ARCHIVED" | "BLOCK_CREATED" | "BLOCK_UPDATED" | "BLOCK_DELETED" | "BLOCK_MOVED" | "USER_ADDED" | "USER_REMOVED" | "ROLE_CHANGED" | "DOCUMENT_SHARED";
export type AuditEntityType = "WORKSPACE" | "DOCUMENT" | "BLOCK" | "USER";
export type BlockOperationType = "CREATE" | "UPDATE" | "DELETE" | "MOVE";


export interface LoginRequest { email: string; password: string; }
export interface SignupRequest { name: string; email: string; password: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; }
export interface RefreshTokenRequest { refreshToken: string; }


export interface OwnerInfo { id: number; name: string; }


export interface WorkSpaceCreateRequest { name: string; workSpaceType: WorkSpaceType; }
export interface UpdateWorkSpaceRequest { name: string; workSpaceType: WorkSpaceType; }
export interface WorkSpaceDetailsResponse {
  id: number;
  name: string;
  workSpaceType: WorkSpaceType;
  ownerInfo: OwnerInfo;
  memberCount: number;
  userRoleInWorkSpace: WorkSpaceRole;
}


export interface AddMemberRequest { email: string; role: WorkSpaceRole; }
export interface ChangeMemberRoleRequest { email: string; role: WorkSpaceRole; }


export interface DocumentResponse {
  id: number;
  title: string;
  workspaceId: number;
  archived: boolean;
  deleted?: boolean;
  version: number;
  createdAt: string;
}
export interface DocumentDetailsResponse {
  document: DocumentResponse;
  blocks: BlockResponse[];
}
export interface CreateDocumentRequest { title: string; }
export interface UpdateDocumentRequest { title: string; }
export interface ShareLinkResponse { url: string; expiryTime: string; }


export interface BlockResponse {
  id: number;
  documentId: number;
  parentId: number | null;
  type: BlockType;
  content: string;
  fileUrl?: string;
  position: string;
  children: BlockResponse[];
}
export interface CreateBlockRequest {
  parentId?: number;
  type: BlockType;
  content: string;
  documentVersion: number;
}
export interface UpdateBlockRequest {
  type: BlockType;
  content: string;
  documentVersion: number;
}
export interface MoveBlockRequest {
  newParentId?: number;
  newPosition: number;
  documentVersion: number;
}
export interface DeleteBlockRequest { documentVersion: number; }


export interface BlockChangeLogResponse {
  id: number;
  documentId: number;
  blockId: number | null;
  operationType: BlockOperationType;
  oldContent: string;
  newContent: string;
  versionNumber: number;
  createdAt: string;
}


export interface SearchResponse {
  documents: DocumentResponse[];
  blocks: BlockResponse[];
}


export interface NotificationResponse {
  id: number;
  message: string;
  read: boolean;
  type: NotificationType;
  referencedId: number | null;
  createdAt: string;
}


export interface ActivityFeedResponse {
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  metaData: string;
  createdAt: string;
}


export interface CursorEvent { documentId: number; blockId: number; userId: number; cursorPosition: number; }
export interface PresenceEvent { documentId: number; userId: number; userName: string; action: string; }
export interface TypingEvent { documentId: number; blockId: number; userId: number; action: string; }


export interface ErrorResponse { status: number; message: string; error: string; timestamp: string; }