import api from './api';
import {
  BillResponseDto,
  BillSummaryDto,
  CreateBillRequest,
  JoinBillRequest,
  JoinBillResponse,
  AddItemRequest,
  BillItemDto,
  AddParticipantRequest,
  AddConsumptionRequest,
  UpdateConsumptionRequest,
  RemoveConsumptionRequest,
  AddDetailRequest,
  UpdateDetailRequest,
  RemoveDetailRequest,
} from '@/types/bill.types';

export const billService = {
  async getBills(): Promise<BillSummaryDto[]> {
    const response = await api.get<BillSummaryDto[]>('/bills');
    return response.data;
  },

  async createBill(data: CreateBillRequest): Promise<BillResponseDto> {
    const response = await api.post<BillResponseDto>('/bills', data);
    return response.data;
  },

  async getBill(billId: string): Promise<BillResponseDto> {
    const response = await api.get<BillResponseDto>(`/bills/${billId}`);
    return response.data;
  },

  async joinBill(data: JoinBillRequest): Promise<JoinBillResponse> {
    const response = await api.post<JoinBillResponse>('/bills/join', data);
    return response.data;
  },

  async addItem(billId: string, data: AddItemRequest): Promise<BillItemDto> {
    const response = await api.post<BillItemDto>(`/bills/${billId}/items`, data);
    return response.data;
  },

  async deleteItem(billId: string, itemId: string): Promise<void> {
    await api.delete(`/bills/${billId}/items/${itemId}`);
  },

  async addConsumption(billId: string, data: AddConsumptionRequest): Promise<void> {
    await api.post(`/bills/${billId}/consumptions`, data);
  },

  async updateConsumption(billId: string, data: UpdateConsumptionRequest): Promise<void> {
    await api.put(`/bills/${billId}/consumptions`, data);
  },

  async removeConsumption(billId: string, data: RemoveConsumptionRequest): Promise<void> {
    await api.delete(`/bills/${billId}/consumptions`, { data });
  },

  async addParticipant(billId: string, data: AddParticipantRequest): Promise<void> {
    await api.post(`/bills/${billId}/participants`, data);
  },

  async removeParticipant(billId: string, participantId: string): Promise<void> {
    await api.delete(`/bills/${billId}/participants/${participantId}`);
  },

  async addDetail(billId: string, data: AddDetailRequest): Promise<void> {
    await api.post(`/bills/${billId}/details`, data);
  },

  async updateDetail(billId: string, data: UpdateDetailRequest): Promise<void> {
    await api.put(`/bills/${billId}/details`, data);
  },

  async removeDetail(billId: string, data: RemoveDetailRequest): Promise<void> {
    await api.delete(`/bills/${billId}/details`, { data });
  },
};
