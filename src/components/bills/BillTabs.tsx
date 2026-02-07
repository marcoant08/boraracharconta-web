'use client';

import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { ParticipantsTab } from './ParticipantsTab';
import { ItemsTab } from './ItemsTab';
import { ConsumptionsTab } from './ConsumptionsTab';
import { StatisticsTab } from './StatisticsTab';

const tabs = [
  { id: 'participants', label: 'Participantes' },
  { id: 'items', label: 'Itens' },
  { id: 'consumptions', label: 'Consumos' },
  { id: 'statistics', label: 'Estatísticas' },
];

export const BillTabs = () => {
  const [activeTab, setActiveTab] = useState('participants');

  return (
    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'participants' && <ParticipantsTab />}
      {activeTab === 'items' && <ItemsTab />}
      {activeTab === 'consumptions' && <ConsumptionsTab />}
      {activeTab === 'statistics' && <StatisticsTab />}
    </Tabs>
  );
};
