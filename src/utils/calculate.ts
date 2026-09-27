import { BillResponseDto, ConsumptionDto, BillDetailDto, participantResolvedId } from '@/types/bill.types';
import { formatCurrency } from './format';

export const getParticipantConsumptions = (
  bill: BillResponseDto,
  participantId: string
): ConsumptionDto[] => {
  return (bill.consumptions || []).filter((c) => c.participantId === participantId);
};

export const getItemConsumptions = (
  bill: BillResponseDto,
  itemId: string
): ConsumptionDto[] => {
  return (bill.consumptions || []).filter((c) => c.itemId === itemId);
};

/** Quantidade efetiva do consumo. Registro sem qty (comandas antigas) conta como 1. */
export const getConsumptionWeight = (consumption: { quantity?: number }): number => {
  return typeof consumption.quantity === 'number' && consumption.quantity > 0
    ? consumption.quantity
    : 1;
};

export interface ItemAssignmentWeight {
  participantId: string;
  participantName: string;
  quantity: number;
}

export interface ItemAssignment {
  assigned: number;
  itemQuantity: number;
  weights: ItemAssignmentWeight[];
  quantitiesDiffer: boolean;
  matchesItemQuantity: boolean;
  consequence: string;
}

const joinNames = (names: string[]): string => {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
};

const unitLabel = (count: number): string =>
  count === 1 ? 'unidade' : 'unidades';

const buildAssignmentConsequence = (
  itemQuantity: number,
  weights: ItemAssignmentWeight[],
  assigned: number,
  quantitiesDiffer: boolean,
  matchesItemQuantity: boolean,
  splitEqually = false
): string => {
  if (weights.length === 0) {
    return itemQuantity === 1 || splitEqually
      ? 'Marque quem dividiu este item.'
      : 'Diga quantas unidades cada um consumiu.';
  }

  const names = joinNames(weights.map((w) => w.participantName));

  if (itemQuantity === 1 || splitEqually) {
    if (weights.length === 1) return `${weights[0].participantName} paga este item.`;
    return `Valor dividido entre ${names}.`;
  }

  if (quantitiesDiffer) {
    const pays = weights.map((w) => `${w.participantName} paga ${w.quantity}`).join(', ');
    if (matchesItemQuantity) return `${pays}.`;
    const proportion = weights.map((w) => `${w.participantName} ${w.quantity}`).join(' : ');
    return `${assigned} de ${itemQuantity} atribuídos. Rateio na proporção ${proportion} — ajuste se a quantidade não fecha.`;
  }

  if (weights.length === 1) {
    if (matchesItemQuantity) return `${weights[0].participantName} paga ${weights[0].quantity}.`;
    return `${assigned} de ${itemQuantity} atribuídos. ${weights[0].participantName} paga o item inteiro até outra pessoa ser marcada.`;
  }

  if (matchesItemQuantity) {
    return `${itemQuantity} ${unitLabel(itemQuantity)} divididas igualmente entre ${names}.`;
  }

  return `${assigned} de ${itemQuantity} atribuídos. ${itemQuantity} ${unitLabel(itemQuantity)} divididas igualmente entre ${names}.`;
};

export const getItemAssignment = (
  bill: BillResponseDto,
  itemId: string
): ItemAssignment | null => {
  const item = bill.items.find((i) => i.id === itemId);
  if (!item) return null;

  const weights: ItemAssignmentWeight[] = [];
  for (const consumption of getItemConsumptions(bill, itemId)) {
    const participant = bill.participants.find(
      (p) => participantResolvedId(p) === consumption.participantId
    );
    if (!participant) continue;
    weights.push({
      participantId: consumption.participantId,
      participantName: participant.name,
      quantity: getConsumptionWeight(consumption),
    });
  }

  const assigned = weights.reduce((sum, weight) => sum + weight.quantity, 0);
  const quantitiesDiffer = new Set(weights.map((w) => w.quantity)).size > 1;
  const matchesItemQuantity = assigned === item.quantity;

  return {
    assigned,
    itemQuantity: item.quantity,
    weights,
    quantitiesDiffer,
    matchesItemQuantity,
    consequence: buildAssignmentConsequence(
      item.quantity,
      weights,
      assigned,
      quantitiesDiffer,
      matchesItemQuantity,
      Boolean(item.splitEqually)
    ),
  };
};

export const itemUsesQuantityWeights = (bill: BillResponseDto, itemId: string): boolean => {
  const item = bill.items.find((i) => i.id === itemId);
  if (item?.splitEqually) return false;
  return getItemAssignment(bill, itemId)?.quantitiesDiffer ?? false;
};

export const getConsumptionGaps = (bill: BillResponseDto): { people: string[]; items: string[] } => {
  if (bill.participants.length === 0 || bill.items.length === 0) {
    return { people: [], items: [] };
  }

  const participantIds = new Set(bill.participants.map((participant) => participantResolvedId(participant)));
  const itemIds = new Set(bill.items.map((item) => item.id));
  const consumedItemIds = new Set<string>();
  const participantIdsWithItem = new Set<string>();

  for (const consumption of bill.consumptions || []) {
    if (!participantIds.has(consumption.participantId) || !itemIds.has(consumption.itemId)) continue;
    if (getConsumptionWeight(consumption) <= 0) continue;
    consumedItemIds.add(consumption.itemId);
    participantIdsWithItem.add(consumption.participantId);
  }

  return {
    people: bill.participants
      .filter((participant) => !participantIdsWithItem.has(participantResolvedId(participant)))
      .map((participant) => participant.name),
    items: bill.items.filter((item) => !consumedItemIds.has(item.id)).map((item) => item.name),
  };
};

/** Cada item tem ao menos uma pessoa e cada pessoa consumiu ao menos um item. */
export const isConsumptionStepComplete = (bill: BillResponseDto): boolean => {
  if (bill.participants.length === 0 || bill.items.length === 0) return false;
  const gaps = getConsumptionGaps(bill);
  return gaps.people.length === 0 && gaps.items.length === 0;
};

export const getParticipantItemQuantity = (
  bill: BillResponseDto,
  participantId: string,
  itemId: string
): number => {
  const consumption = (bill.consumptions || []).find(
    (c) => c.participantId === participantId && c.itemId === itemId
  );
  if (!consumption) return 0;
  return getConsumptionWeight(consumption);
};

export interface ItemDivisionStep {
  description: string;
  value?: number;
}

export interface ItemDivisionResult {
  item: { id: string; name: string; value: number; quantity: number };
  totalValue: number;
  totalConsumed: number;
  valuePerUnit: number;
  participantTotals: Array<{
    participantId: string;
    participantName: string;
    total: number;
    breakdown: Array<{
      description: string;
      value: number;
    }>;
  }>;
  steps: ItemDivisionStep[];
}

export const calculateItemDivision = (bill: BillResponseDto, itemId: string): ItemDivisionResult | null => {
  const item = bill.items.find((i) => i.id === itemId);
  if (!item) return null;

  // item.value é o valor unitário, item.quantity é a quantidade total consumida/disponível
  const valuePerUnit = item.value;
  const totalValue = valuePerUnit * item.quantity;
  const totalQuantityConsumed = item.quantity; // Total consumido é a quantity do item
  const details = (bill.details || []).filter((d) => d.itemId === itemId);
  
  // Obter participantes que realmente consumiram este item
  const itemConsumptions = getItemConsumptions(bill, itemId);
  const consumingParticipantIds = new Set(
    itemConsumptions.map((c) => c.participantId)
  );
  const consumingParticipants = bill.participants.filter((p) =>
    consumingParticipantIds.has(participantResolvedId(p))
  );
  
  // Se não há participantes consumindo o item, retornar resultado vazio
  if (consumingParticipants.length === 0) {
    return {
      item: {
        id: item.id,
        name: item.name,
        value: item.value,
        quantity: item.quantity,
      },
      totalValue: item.value * item.quantity,
      totalConsumed: totalQuantityConsumed,
      valuePerUnit: item.value,
      participantTotals: [],
      steps: [
        {
          description: `Total de ${item.name}: ${item.quantity} unidade${item.quantity > 1 ? 's' : ''} × ${formatCurrency(valuePerUnit)} = ${formatCurrency(totalValue)}`,
        },
        {
          description: `Nenhum participante marcou consumo deste item.`,
        },
      ],
    };
  }
  
  if (totalQuantityConsumed === 0) {
    return {
      item: {
        id: item.id,
        name: item.name,
        value: item.value,
        quantity: item.quantity,
      },
      totalValue: item.value * item.quantity,
      totalConsumed: 0,
      valuePerUnit: item.value,
      participantTotals: [],
      steps: [],
    };
  }
  
  const steps: ItemDivisionStep[] = [];
  steps.push({
    description: `Total de ${item.name}: ${item.quantity} unidade${item.quantity > 1 ? 's' : ''} × ${formatCurrency(valuePerUnit)} = ${formatCurrency(totalValue)}`,
  });
  steps.push({
    description: `Total consumido: ${totalQuantityConsumed} unidade${totalQuantityConsumed > 1 ? 's' : ''}`,
  });
  steps.push({
    description: `Valor por unidade: ${formatCurrency(valuePerUnit)}`,
  });
  
  // Inicializar totais por participante
  const participantTotalsMap = new Map<string, {
    participantId: string;
    participantName: string;
    total: number;
    breakdown: Array<{ description: string; value: number }>;
  }>();

  // Inicializar apenas participantes que consumiram o item
  consumingParticipants.forEach((p) => {
    const pid = participantResolvedId(p);
    participantTotalsMap.set(pid, {
      participantId: pid,
      participantName: p.name,
      total: 0,
      breakdown: [],
    });
  });

  const assignment = getItemAssignment(bill, itemId);
  if (assignment?.quantitiesDiffer && !item.splitEqually) {
    const totalWeight = assignment.assigned;
    steps.push({
      description: `\nRateio pela quantidade de cada pessoa:`,
    });

    if (!assignment.matchesItemQuantity) {
      steps.push({
        description: `  ${assignment.assigned} de ${item.quantity} ${unitLabel(item.quantity)} atribuídas. O valor total ainda é rateado na proporção das quantidades.`,
      });
    }

    assignment.weights.forEach((weight) => {
      const share = (weight.quantity / totalWeight) * totalValue;
      const participantTotal = participantTotalsMap.get(weight.participantId);
      if (participantTotal) {
        participantTotal.total += share;
        participantTotal.breakdown.push({
          description: `${weight.quantity}/${totalWeight} do total (${weight.quantity} ${unitLabel(weight.quantity)})`,
          value: share,
        });
      }
      steps.push({
        description: `  ${weight.participantName}: ${weight.quantity}/${totalWeight} × ${formatCurrency(totalValue)} = ${formatCurrency(share)}`,
      });
    });

    steps.push({
      description: `\nTotal por participante:`,
    });

    const participantTotals = Array.from(participantTotalsMap.values()).map((pt) => {
      steps.push({
        description: `  • ${pt.participantName}: ${formatCurrency(pt.total)}`,
      });
      return pt;
    });

    return {
      item: {
        id: item.id,
        name: item.name,
        value: item.value,
        quantity: item.quantity,
      },
      totalValue,
      totalConsumed: totalQuantityConsumed,
      valuePerUnit,
      participantTotals,
      steps,
    };
  }

  // Função auxiliar: construir linha do tempo ordenada por quantityConsumed
  const buildTimeline = (details: BillDetailDto[]): BillDetailDto[] => {
    return [...details].sort((a, b) => a.quantityConsumed - b.quantityConsumed);
  };

  // Função auxiliar: obter participantes presentes na mesa em um determinado quantityConsumed
  const getParticipantsAtQuantity = (
    timeline: BillDetailDto[],
    atQuantity: number,
    allConsumingParticipants: typeof consumingParticipants
  ): typeof consumingParticipants => {
    // Mapa para rastrear estado de cada participante
    const participantState = new Map<string, boolean>();
    
    // Mapa para rastrear o primeiro evento de cada participante
    const firstEventByParticipant = new Map<string, BillDetailDto>();
    for (const event of timeline) {
      if (!firstEventByParticipant.has(event.userId)) {
        firstEventByParticipant.set(event.userId, event);
      }
    }
    
    // Inicializar estado de cada participante:
    // - Se não tem eventos OU primeiro evento é "join" em quantityConsumed === 0: presente desde o início
    // - Se primeiro evento é "join" em quantityConsumed > 0: não estava presente antes (chegou atrasado)
    // - Se primeiro evento é "left": estava presente antes (saiu depois)
    allConsumingParticipants.forEach((p) => {
      const pid = participantResolvedId(p);
      const firstEvent = firstEventByParticipant.get(pid);
      if (!firstEvent) {
        // Sem eventos: presente desde o início
        participantState.set(pid, true);
      } else if (firstEvent.action === 'join' && firstEvent.quantityConsumed > 0) {
        // Primeiro evento é "join" após quantityConsumed > 0: chegou atrasado, não estava presente antes
        participantState.set(pid, false);
      } else {
        // Primeiro evento é "join" em 0 ou "left": estava presente desde o início
        participantState.set(pid, true);
      }
    });

    // Processar eventos até atQuantity para atualizar estados
    for (const event of timeline) {
      if (event.quantityConsumed > atQuantity) break;
      
      if (event.action === 'join') {
        participantState.set(event.userId, true);
      } else if (event.action === 'left') {
        participantState.set(event.userId, false);
      }
    }

    // Retornar apenas participantes presentes
    return allConsumingParticipants.filter((p) => participantState.get(participantResolvedId(p)) === true);
  };

  // Filtrar detalhes apenas para participantes que consumiram o item
  const relevantDetails = details.filter((d) => consumingParticipantIds.has(d.userId));
  
  // Construir linha do tempo ordenada
  const timeline = buildTimeline(relevantDetails);

  // Processar períodos baseados em eventos
  if (timeline.length > 0) {
    steps.push({
      description: `\n📝 Linha do Tempo - Consumos por período:`,
    });

    let previousQuantity = 0;
    let hasProcessedAnyPeriod = false;

    // Processar cada período entre eventos
    for (let i = 0; i <= timeline.length; i++) {
      const currentQuantity = i < timeline.length 
        ? timeline[i].quantityConsumed 
        : totalQuantityConsumed;
      
      const periodQuantity = currentQuantity - previousQuantity;
      
      if (periodQuantity > 0) {
        // Obter participantes presentes neste período
        // Usar previousQuantity para determinar estado no início do período
        // (antes do evento que acontece em currentQuantity, se houver)
        const presentParticipants = getParticipantsAtQuantity(
          timeline,
          previousQuantity,
          consumingParticipants
        );

        if (presentParticipants.length > 0) {
          hasProcessedAnyPeriod = true;
          const periodValue = periodQuantity * valuePerUnit;
          const valuePerParticipant = periodValue / presentParticipants.length;
          const presentParticipantsNames = presentParticipants.map((p) => p.name).join(', ');

          steps.push({
            description: `  • Período: ${previousQuantity} até ${currentQuantity} unidade${currentQuantity !== 1 ? 's' : ''} (${periodQuantity} unidade${periodQuantity > 1 ? 's' : ''})`,
          });
          steps.push({
            description: `    Participantes presentes: ${presentParticipantsNames}`,
          });
          steps.push({
            description: `    Cálculo: (${periodQuantity} × ${formatCurrency(valuePerUnit)}) ÷ ${presentParticipants.length} = ${formatCurrency(valuePerParticipant)} cada`,
          });
          
          if (i < timeline.length) {
            steps.push({
              description: '-',
            });
          }

          // Adicionar aos participantes presentes
          presentParticipants.forEach((p) => {
            const participantTotal = participantTotalsMap.get(participantResolvedId(p));
            if (participantTotal) {
              participantTotal.total += valuePerParticipant;
              participantTotal.breakdown.push({
                description: `Período ${previousQuantity}-${currentQuantity}: ${periodQuantity} unidade${periodQuantity > 1 ? 's' : ''} (${presentParticipantsNames})`,
                value: valuePerParticipant,
              });
            }
          });
        }
      }

      previousQuantity = currentQuantity;
    }

    if (!hasProcessedAnyPeriod) {
      // Se não processou nenhum período, todos os participantes estavam presentes o tempo todo
      const periodValue = totalQuantityConsumed * valuePerUnit;
      const valuePerParticipant = periodValue / consumingParticipants.length;
      const allParticipantsNames = consumingParticipants.map((p) => p.name).join(', ');

      steps.push({
        description: `  • Todos os participantes estiveram presentes durante todo o consumo`,
      });
      steps.push({
        description: `    Participantes: ${allParticipantsNames}`,
      });
      steps.push({
        description: `    Cálculo: (${totalQuantityConsumed} × ${formatCurrency(valuePerUnit)}) ÷ ${consumingParticipants.length} = ${formatCurrency(valuePerParticipant)} cada`,
      });

      consumingParticipants.forEach((p) => {
        const participantTotal = participantTotalsMap.get(participantResolvedId(p));
        if (participantTotal) {
          participantTotal.total += valuePerParticipant;
          participantTotal.breakdown.push({
            description: `Consumo total dividido igualmente (${totalQuantityConsumed} unidade${totalQuantityConsumed > 1 ? 's' : ''})`,
            value: valuePerParticipant,
          });
        }
      });
    }
  } else {
    // Sem eventos na linha do tempo - dividir igualmente entre todos
    const periodValue = totalQuantityConsumed * valuePerUnit;
    const valuePerParticipant = periodValue / consumingParticipants.length;
    const allParticipantsNames = consumingParticipants.map((p) => p.name).join(', ');

    steps.push({
      description: `\n👥 Todos os consumos divididos igualmente:`,
    });
    steps.push({
      description: `  • ${totalQuantityConsumed} unidade${totalQuantityConsumed > 1 ? 's' : ''} consumida${totalQuantityConsumed > 1 ? 's' : ''}`,
    });
    steps.push({
      description: `    Cálculo: (${totalQuantityConsumed} × ${formatCurrency(valuePerUnit)}) ÷ ${consumingParticipants.length} = ${formatCurrency(valuePerParticipant)} cada`,
    });
    steps.push({
      description: `    Participantes: ${allParticipantsNames}`,
    });

    consumingParticipants.forEach((p) => {
      const participantTotal = participantTotalsMap.get(participantResolvedId(p));
      if (participantTotal) {
        participantTotal.total += valuePerParticipant;
        participantTotal.breakdown.push({
          description: `Consumo total dividido igualmente (${totalQuantityConsumed} unidade${totalQuantityConsumed > 1 ? 's' : ''})`,
          value: valuePerParticipant,
        });
      }
    });
  }

  steps.push({
    description: `\n💰 Total por participante:`,
  });

  const participantTotals = Array.from(participantTotalsMap.values()).map((pt) => {
    steps.push({
      description: `  • ${pt.participantName}: ${formatCurrency(pt.total)}`,
    });
    return pt;
  });

  return {
    item: {
      id: item.id,
      name: item.name,
      value: item.value,
      quantity: item.quantity,
    },
    totalValue,
    totalConsumed: totalQuantityConsumed,
    valuePerUnit,
    participantTotals,
    steps,
  };
};

export const calculateParticipantTotal = (
  bill: BillResponseDto,
  participantId: string
): number => {
  let total = 0;

  for (const item of bill.items) {
    const itemDivision = calculateItemDivision(bill, item.id);
    if (itemDivision) {
      const participantTotal = itemDivision.participantTotals.find(
        (pt) => pt.participantId === participantId
      );
      if (participantTotal) {
        total += participantTotal.total;
      }
    }
  }

  return total;
};

export const SERVICE_FEE_MIN = 10;
export const SERVICE_FEE_MAX = 30;
export const SERVICE_FEE_DEFAULT = 10;

export const clampServiceFeePercent = (value: number): number => {
  if (!Number.isFinite(value)) return SERVICE_FEE_DEFAULT;
  return Math.min(SERVICE_FEE_MAX, Math.max(SERVICE_FEE_MIN, Math.round(value)));
};

export type AppliedServiceFee =
  | { enabled: false }
  | { enabled: true; type: 'percent'; percent: number }
  | { enabled: true; type: 'fixed'; fixedValue: number };

export const getAppliedServiceFee = (bill: BillResponseDto): AppliedServiceFee => {
  if (!bill.serviceFeeEnabled) return { enabled: false };
  if (bill.serviceFeeType === 'percent' && bill.serviceFeePercent) {
    return { enabled: true, type: 'percent', percent: bill.serviceFeePercent };
  }
  if (bill.serviceFeeType === 'fixed' && bill.serviceFeeFixedValue) {
    return { enabled: true, type: 'fixed', fixedValue: bill.serviceFeeFixedValue };
  }
  return { enabled: false };
};

export const isServiceFeeApplied = (bill: BillResponseDto): boolean => {
  return getAppliedServiceFee(bill).enabled;
};

export const calculateBillTotals = (bill: BillResponseDto) => {
  const feeConfig = getAppliedServiceFee(bill);
  const participantCount = Math.max(bill.participants.length, 1);
  const fixedShare =
    feeConfig.enabled && feeConfig.type === 'fixed' ? feeConfig.fixedValue / participantCount : 0;

  const participantTotals = bill.participants.map((p) => {
    const subtotal = calculateParticipantTotal(bill, participantResolvedId(p));
    let fee = 0;
    if (feeConfig.enabled && feeConfig.type === 'percent') {
      fee = subtotal * (feeConfig.percent / 100);
    } else if (feeConfig.enabled && feeConfig.type === 'fixed') {
      fee = fixedShare;
    }
    return {
      participant: p,
      subtotal,
      fee,
      total: subtotal + fee,
    };
  });

  const subtotal = participantTotals.reduce((sum, pt) => sum + pt.subtotal, 0);
  const serviceFee = participantTotals.reduce((sum, pt) => sum + pt.fee, 0);
  const grandTotal = subtotal + serviceFee;

  return {
    participantTotals,
    subtotal,
    serviceFee,
    grandTotal,
    feeConfig,
    fixedShare,
  };
};
