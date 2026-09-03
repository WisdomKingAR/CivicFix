// frontend/src/types/index.ts

export type Role = 'CITIZEN' | 'AUTHORITY' | 'ADMIN';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export type ComplaintCategory =
  | 'POTHOLE'
  | 'STREETLIGHT'
  | 'GARBAGE'
  | 'WATER_LEAKAGE'
  | 'ROAD_DAMAGE'
  | 'OTHER';

export type VerificationMethod =
  | 'AI_COMPARISON'
  | 'CITIZEN_CONFIRMATION'
  | 'AUTHORITY_OVERRIDE';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;
  isFlagged: boolean;
  flagReason?: string | null;
  jurisdiction?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    complaints?: number;
    assignments?: number;
  };
}

export interface ComplaintCluster {
  id: string;
  complaintCount: number;
  priorityScore: number;
  centroidLat: number;
  centroidLng: number;
  status: ComplaintStatus;
  category: ComplaintCategory;
  isNearSensitive: boolean;
  createdAt: string;
  updatedAt: string;
  complaints?: Complaint[];
}

export interface StatusHistoryItem {
  id: string;
  complaintId: string;
  oldStatus: ComplaintStatus;
  newStatus: ComplaintStatus;
  changedById: string;
  notes?: string | null;
  createdAt: string;
}

export interface ResolutionVerification {
  id: string;
  complaintId: string;
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  aiSimilarityScore?: number | null;
  verificationMethod: VerificationMethod;
  citizenConfirmed?: boolean | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface ComplaintAssignment {
  id: string;
  complaintId: string;
  assignedToId: string;
  assignedById: string;
  notes?: string | null;
  createdAt: string;
  assignedTo?: User;
  assignedBy?: User;
}

export interface Complaint {
  id: string;
  userId: string;
  clusterId?: string | null;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  photoUrl: string;
  photoHash: string;
  lat: number;
  lng: number;
  address?: string | null;
  isSeed: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  cluster?: ComplaintCluster | null;
  assignments?: ComplaintAssignment[];
  resolution?: ResolutionVerification | null;
  statusHistory?: StatusHistoryItem[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
}

export interface GeoJsonFeatureProperties {
  id: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  photoUrl: string;
  description: string;
  priorityScore?: number;
  complaintCount?: number;
  isCluster?: boolean;
}

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: GeoJsonFeatureProperties;
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export interface SensitiveLocation {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'SCHOOL';
  lat: number;
  lng: number;
}
