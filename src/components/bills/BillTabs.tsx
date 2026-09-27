'use client';

import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
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

const tabs = [
  { id: 'participants', label: 'Participantes', icon: <UserThreeIcon size={26} /> },
  { id: 'items',        label: 'Itens',         icon: <ShoppingCartIcon size={26} /> },
  { id: 'consumptions', label: 'Consumos',      icon: <UserCheckIcon size={26} /> },
  { id: 'details',      label: 'Detalhes',      icon: <ClockUserIcon size={26} /> },
  { id: 'statistics',   label: 'Estatísticas',  icon: <ChartPieSliceIcon size={26} /> },
];

export const BillTabs = () => {
  const [activeTab, setActiveTab] = useState('participants');

  return (
    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'participants' && <ParticipantsTab />}
      {activeTab === 'items' && <ItemsTab onGoToConsumptions={() => setActiveTab('consumptions')} />}
      {activeTab === 'consumptions' && <ConsumptionsTab />}
      {activeTab === 'details' && <DetailsTab />}
      {activeTab === 'statistics' && <StatisticsTab />}
    </Tabs>
  );
};
