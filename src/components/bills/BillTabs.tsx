'use client';

import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { useBillStore } from '@/store/bill.store';
import { isConsumptionStepComplete } from '@/utils/calculate';
import { ParticipantsTab } from './ParticipantsTab';
import { ItemsTab } from './ItemsTab';
import { ConsumptionsTab } from './ConsumptionsTab';
import { StatisticsTab } from './StatisticsTab';
import { DetailsTab } from './DetailsTab';
import { UserThreeIcon } from '@/components/icons/UserThreeIcon';
import { ShoppingCartIcon } from '@/components/icons/ShoppingCartIcon';
import { UserCheckIcon } from '@/components/icons/UserCheckIcon';
import { ClockUserIcon } from '@/components/icons/ClockUserIcon';
import { ChartPieSliceIcon } from '@/components/icons/ChartPieSliceIcon';

const tabDefs = [
  { id: 'participants', label: 'Participantes', icon: <UserThreeIcon size={26} /> },
  { id: 'items', label: 'Itens', icon: <ShoppingCartIcon size={26} /> },
  { id: 'consumptions', label: 'Consumos', icon: <UserCheckIcon size={26} /> },
  { id: 'details', label: 'Detalhes', icon: <ClockUserIcon size={26} /> },
  { id: 'statistics', label: 'Cálculos', icon: <ChartPieSliceIcon size={26} /> },
] as const;

export const BillTabs = () => {
  const [activeTab, setActiveTab] = useState<string>('participants');
  const [revealConsumptionGaps, setRevealConsumptionGaps] = useState(false);
  const bill = useBillStore((state) => state.currentBill);

  const participantsComplete = (bill?.participants.length ?? 0) > 0;
  const itemsComplete = (bill?.items.length ?? 0) > 0;
  const consumptionsComplete = bill ? isConsumptionStepComplete(bill) : false;
  const detailsComplete = true;

  const completeByTab: Record<(typeof tabDefs)[number]['id'], boolean> = {
    participants: participantsComplete,
    items: itemsComplete,
    consumptions: consumptionsComplete,
    details: detailsComplete,
    statistics: participantsComplete && itemsComplete && consumptionsComplete && detailsComplete,
  };

  const tabs = tabDefs.map((tab) => ({
    ...tab,
    complete: completeByTab[tab.id],
  }));

  const changeTab = (tabId: string) => {
    if (
      activeTab === 'consumptions' &&
      tabId !== 'consumptions' &&
      participantsComplete &&
      itemsComplete &&
      !consumptionsComplete
    ) {
      setRevealConsumptionGaps(true);
    }
    setActiveTab(tabId);
  };

  return (
    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={changeTab}>
      {activeTab === 'participants' && <ParticipantsTab />}
      {activeTab === 'items' && <ItemsTab onGoToConsumptions={() => changeTab('consumptions')} />}
      {activeTab === 'consumptions' && (
        <ConsumptionsTab
          showGaps={revealConsumptionGaps}
          onGoToParticipants={() => changeTab('participants')}
          onGoToItems={() => changeTab('items')}
        />
      )}
      {activeTab === 'details' && <DetailsTab />}
      {activeTab === 'statistics' && (
        <StatisticsTab
          onGoToParticipants={() => setActiveTab('participants')}
          onGoToItems={() => setActiveTab('items')}
          onGoToConsumptions={() => setActiveTab('consumptions')}
        />
      )}
    </Tabs>
  );
};
