
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
  SENT_TO_ACCOUNTING = 'SENT_TO_ACCOUNTING',
  COST_ESTIMATED = 'COST_ESTIMATED',
  COST_APPROVED = 'COST_APPROVED',
  READY_FOR_PLANNING = 'READY_FOR_PLANNING',
  IN_PRODUCTION = 'IN_PRODUCTION',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  stock: number;
  costPerUnit: number;
}

export interface BOMItem {
  id: string;
  materialId: string;
  quantity: number;
  wasteRate: number;
}

export interface RoutingStep {
  id: string;
  operation: string;
  minutes: number;
  laborRate: number;
}

export interface CostEstimation {
  estimatedMaterialCost?: number;
  estimatedLaborCost?: number;
  profitMargin?: number;
  finalPrice?: number;
  adjustedBOM?: BOMItem[];
  adjustedRouting?: RoutingStep[];
  notes?: string;
}

export interface Style {
  id: string;
  code: string;
  name: string;
  image?: string;
  description: string;
  status: StyleStatus;
  bom: BOMItem[];
  routing: RoutingStep[];
  proposedPrice?: number;
  estimatedCost?: number;
  quantity?: number;
  initialPrice?: number;
  estimatedMaterialCost?: number;
  estimatedLaborCost?: number;
  accountingProfitMargin?: number;
  accountingFinalPrice?: number;
  adjustedBOM?: BOMItem[];
  adjustedRouting?: RoutingStep[];
  accountingNotes?: string;
}

export interface WorkOrder {
  id: string;
  styleId: string;
  quantity: number;
  lineNo: string;
  startDate: string;
  endDate: string;
  status: StyleStatus;
  assignedTeam: string;
  actualOutput: number;
  defectCount: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
