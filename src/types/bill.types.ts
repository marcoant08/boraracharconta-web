export interface ParticipantDto {
  userId: string;
  name: string;
  joinedAt: Date;
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

export interface BillResponseDto {
  id: string;
  code: string;
  adminId: string;
  name: string;
  participants: ParticipantDto[];
  items: BillItemDto[];
  consumptions: ConsumptionDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBillRequest {
  name: string;
}

export interface JoinBillRequest {
  code: string;
}

export interface JoinBillResponse {
  billId: string;
  message: string;
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

export interface BillSummaryDto {
  id: string;
  code: string;
  name: string;
}
