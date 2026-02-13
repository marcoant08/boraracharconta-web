import { BillResponseDto, ConsumptionDto, BillDetailDto } from '@/types/bill.types';
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
    consumingParticipantIds.has(p.userId)
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
    participantTotalsMap.set(p.userId, {
      participantId: p.userId,
      participantName: p.name,
      total: 0,
      breakdown: [],
    });
  });

  // Rastrear quantidade total processada na ETAPA 1
  let totalConsumedDuringAbsence = 0;

  // Processar details (consumos durante ausência) - ETAPA 1
  // Lógica incremental: calcular por níveis de ausência sobrepostos
  // Filtrar detalhes apenas para participantes que consumiram o item
  const relevantDetails = details.filter((d) => consumingParticipantIds.has(d.userId));
  
  if (relevantDetails.length > 0) {
    steps.push({
      description: `\n📝 ETAPA 1 - Consumos durante ausência:`,
    });
    
    // Criar mapa de ausências por participante (apenas os que consumiram)
    const absenceMap = new Map<string, number>();
    relevantDetails.forEach((detail) => {
      const current = absenceMap.get(detail.userId) || 0;
      absenceMap.set(detail.userId, Math.max(current, detail.consumedDuringAbsence));
    });

    // Criar array de ausências ordenadas por quantidade (menor primeiro)
    const absenceEntries = Array.from(absenceMap.entries())
      .map(([userId, quantity]) => ({
        userId,
        quantity,
        name: consumingParticipants.find((p) => p.userId === userId)?.name || userId,
      }))
      .sort((a, b) => a.quantity - b.quantity);

    let previousQuantity = 0;

    for (let i = 0; i < absenceEntries.length; i++) {
      const currentEntry = absenceEntries[i];
      const currentQuantity = currentEntry.quantity;
      const quantityToProcess = currentQuantity - previousQuantity;

      if (quantityToProcess <= 0) continue;

      // Participantes que ainda estão ausentes neste nível (quantidade >= currentQuantity)
      const absentAtThisLevel = absenceEntries
        .filter((e) => e.quantity >= currentQuantity)
        .map((e) => e.userId);

      // Participantes presentes (apenas os que consumiram o item, exceto os ausentes neste nível)
      const presentParticipants = consumingParticipants.filter(
        (p) => !absentAtThisLevel.includes(p.userId)
      );

      if (presentParticipants.length === 0) {
        // Se não há ninguém presente, pular este nível
        previousQuantity = currentQuantity;
        continue;
      }

      // Acumular quantidade processada na ETAPA 1
      totalConsumedDuringAbsence += quantityToProcess;

      const valueForThisLevel = quantityToProcess * valuePerUnit;
      const valuePerPresentParticipant = valueForThisLevel / presentParticipants.length;
      const presentParticipantsNames = presentParticipants.map((p) => p.name).join(', ');
      const absentParticipantsNames = absentAtThisLevel
        .map((uid) => consumingParticipants.find((p) => p.userId === uid)?.name || uid)
        .join(' e ');

      // Adicionar descrição do passo
      if (i === 0 || previousQuantity === 0) {
        steps.push({
          description: `  • ${quantityToProcess} unidade${quantityToProcess > 1 ? 's' : ''} consumida${quantityToProcess > 1 ? 's' : ''} durante ausência de ${absentParticipantsNames}`,
        });
      } else {
        steps.push({
          description: `  • mais ${quantityToProcess} unidade${quantityToProcess > 1 ? 's' : ''} consumida${quantityToProcess > 1 ? 's' : ''} durante ausência de ${absentParticipantsNames}`,
        });
      }

      steps.push({
        description: `    Cálculo: (${quantityToProcess} × ${formatCurrency(valuePerUnit)}) ÷ ${presentParticipants.length} = ${formatCurrency(valuePerPresentParticipant)} para cada`,
      });
      steps.push({
        description: `    Participantes presentes: ${presentParticipantsNames}`,
      });

      // Adicionar aos participantes presentes
      presentParticipants.forEach((p) => {
        const participantTotal = participantTotalsMap.get(p.userId);
        if (participantTotal) {
          participantTotal.total += valuePerPresentParticipant;
          participantTotal.breakdown.push({
            description: `Etapa 1: Consumo durante ausência de ${absentParticipantsNames} (${quantityToProcess} unidade${quantityToProcess > 1 ? 's' : ''})`,
            value: valuePerPresentParticipant,
          });
        }
      });

      previousQuantity = currentQuantity;
    }
  }

  // Calcular unidades restantes (consumidas com presença de todos) - ETAPA 2
  const remainingConsumed = totalQuantityConsumed - totalConsumedDuringAbsence;
  
  if (remainingConsumed > 0) {
    const remainingValue = remainingConsumed * valuePerUnit;
    const valuePerParticipant = remainingValue / consumingParticipants.length;
    const allParticipantsNames = consumingParticipants.map((p) => p.name).join(', ');
    
    if (totalConsumedDuringAbsence > 0) {
      steps.push({
        description: `\n👥 ETAPA 2 - Consumos com a presença de ${allParticipantsNames}:`,
      });
      steps.push({
        description: `  • ${remainingConsumed} unidade${remainingConsumed > 1 ? 's' : ''} consumida${remainingConsumed > 1 ? 's' : ''} com todos presentes`,
      });
      steps.push({
        description: `    Cálculo: (${remainingConsumed} × ${formatCurrency(valuePerUnit)}) ÷ ${consumingParticipants.length} = ${formatCurrency(valuePerParticipant)} cada`,
      });
    } else {
      steps.push({
        description: `\n👥 ETAPA 1 - Todos os consumos divididos igualmente:`,
      });
      steps.push({
        description: `  • ${remainingConsumed} unidade${remainingConsumed > 1 ? 's' : ''} consumida${remainingConsumed > 1 ? 's' : ''}`,
      });
      steps.push({
        description: `    Cálculo: (${remainingConsumed} × ${formatCurrency(valuePerUnit)}) ÷ ${consumingParticipants.length} = ${formatCurrency(valuePerParticipant)} cada`,
      });
      steps.push({
        description: `    Participantes: ${allParticipantsNames}`,
      });
    }

    // Adicionar apenas aos participantes que consumiram
    consumingParticipants.forEach((p) => {
      const participantTotal = participantTotalsMap.get(p.userId);
      if (participantTotal) {
        participantTotal.total += valuePerParticipant;
        participantTotal.breakdown.push({
          description: totalConsumedDuringAbsence > 0
            ? `Etapa 2: Consumo com presença de todos (${remainingConsumed} unidade${remainingConsumed > 1 ? 's' : ''})`
            : `Etapa 1: Consumo total dividido igualmente (${remainingConsumed} unidade${remainingConsumed > 1 ? 's' : ''})`,
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

export const calculateBillTotals = (bill: BillResponseDto) => {
  const participantTotals = bill.participants.map((p) => ({
    participant: p,
    total: calculateParticipantTotal(bill, p.userId),
  }));

  const grandTotal = participantTotals.reduce((sum, pt) => sum + pt.total, 0);

  return {
    participantTotals,
    grandTotal,
  };
};
