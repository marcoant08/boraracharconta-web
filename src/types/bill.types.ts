export interface ParticipantDto {
  userId?: string;
  name: string;
  joinedAt: Date;
}

/** Identificador estável do participante na API (userId ou nome). */
export function participantResolvedId(p: { userId?: string; name: string }): string {
  return p.userId ?? p.name;
}

export interface BillItemDto {
  id: string;
  name: string;
  value: number;
  quantity: number;
  category: string;
}

export interface ConsumptionDto {
  participantId: string;
  itemId: string;
  quantity?: number;
}

export interface BillDetailDto {
  itemId: string;
  userId: string;
  quantityConsumed: number;  // Após quantas unidades este evento ocorreu
  action: 'join' | 'left';  // Entrar ou sair da mesa
}

export interface BillResponseDto {
  id: string;
  code: string;
  adminId: string;
  name: string;
  isPublic: boolean;
  participants: ParticipantDto[];
  items: BillItemDto[];
  consumptions: ConsumptionDto[];
  details: BillDetailDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBillRequest {
  name: string;
}

export interface AddItemRequest {
  name: string;
  value: number;
  quantity: number;
  category: string;
}

export interface AddParticipantRequest {
  name: string;
}

export interface AddConsumptionRequest {
  participantId: string;
  itemId: string;
  quantity?: number;
}

export interface UpdateConsumptionRequest {
  participantId: string;
  itemId: string;
  quantity: number;
}

export interface RemoveConsumptionRequest {
  participantId: string;
  itemId: string;
}

export interface AddDetailRequest {
  itemId: string;
  userId: string;
  quantityConsumed: number;
  action: 'join' | 'left';
}

export interface UpdateDetailRequest {
  itemId: string;
  userId: string;
  quantityConsumed: number;
  action: 'join' | 'left';
}

export interface RemoveDetailRequest {
  userId: string;
  itemId: string;
}

export interface BillSummaryDto {
  id: string;
  code: string;
  name: string;
}
