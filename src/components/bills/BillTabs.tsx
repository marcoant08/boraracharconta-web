'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { useWebSocket } from '@/hooks/useWebSocket';
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
  const params = useParams();
  const billId = params.billId as string;
  const { socket, connected } = useWebSocket();
  const [isInRoom, setIsInRoom] = useState(false);

  useEffect(() => {
    if (!socket || !billId) {
      setIsInRoom(false);
      return;
    }

    const checkConnection = () => {
      setIsInRoom(socket.connected && connected);
    };

    checkConnection();

    const handleConnect = () => {
      setIsInRoom(true);
    };

    const handleDisconnect = () => {
      setIsInRoom(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket, connected, billId]);

  const isConnected = connected && socket?.connected && isInRoom;

  return (
    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} connected={isConnected}>
      {activeTab === 'participants' && <ParticipantsTab />}
      {activeTab === 'items' && <ItemsTab />}
      {activeTab === 'consumptions' && <ConsumptionsTab />}
      {activeTab === 'statistics' && <StatisticsTab />}
    </Tabs>
  );
};
