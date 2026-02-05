
// --- Enums ---
export enum UserRole {
  TECH = 'TECH',
  ACCOUNTANT = 'ACCOUNTANT',
  PLANNER = 'PLANNER',
  WAREHOUSE = 'WAREHOUSE',
  HR = 'HR',
  FACTORY_MANAGER = 'FACTORY_MANAGER',
  ADMIN = 'ADMIN'
}

export enum StyleStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// --- Entities ---

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  factoryId?: string; // If user is bound to a specific factory
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Material {
  id: string;
  name: string;
  code: string;
  type: string;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  imageUrl?: string;
  description?: string;
  inventory?: number;
  minInventory?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type BOMItemType = 'FABRIC_MAIN' | 'FABRIC_LINING' | 'ACCESSORY_TRIM' | 'ACCESSORY_PACKING' | 'OTHER';

export interface BOMItem {
  id: string;
  materialId: string;
  quantity: number;
  wasteRate: number; // Percentage
  type?: BOMItemType;
  variant?: {
    size?: string;
    color?: string;
  };
  material?: Material;
}

export interface RoutingStep {
  id: string;
  operation: string;
  minutes: number;
  laborRate: number;
  description?: string;
}

export interface CostEstimation {
  id?: string;
  estimatedMaterialCost?: number;
  estimatedLaborCost?: number;
  profitMargin?: number;
  finalPrice?: number;
  notes?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Style {
  id: string;
  code: string;
  name: string;
  description?: string;
  quantity?: number;
  initialPrice?: number;
  proposedPrice: number;
  season?: string;
  buyer?: string;
  status: StyleStatus;
  imageUrl?: string;

  // Relations
  bom: BOMItem[];
  routing: RoutingStep[];
  costEstimation?: CostEstimation;

  createdAt?: string;
  updatedAt?: string;
}
