'use client';

import { useEffect, useState, type AnimationEvent } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { useBillStore } from '@/store/bill.store';
import { isConsumptionStepComplete, isServiceFeeApplied } from '@/utils/calculate';
import { ParticipantsTab } from './ParticipantsTab';
import { ItemsTab } from './ItemsTab';
import { ConsumptionsTab } from './ConsumptionsTab';
import { StatisticsTab } from './StatisticsTab';
import { DetailsTab } from './DetailsTab';
import { AppFooter } from '@/components/ui/AppFooter';
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

const SLIDE_MS = 320;

export const BillTabs = () => {
  const [activeTab, setActiveTab] = useState<string>('participants');
  const [revealConsumptionGaps, setRevealConsumptionGaps] = useState(false);
  const [motion, setMotion] = useState<{ leaving: string; direction: 'forward' | 'back' } | null>(null);
  const bill = useBillStore((state) => state.currentBill);

  const participantsComplete = (bill?.participants.length ?? 0) > 0;
  const itemsComplete = (bill?.items.length ?? 0) > 0;
  const consumptionsComplete = bill ? isConsumptionStepComplete(bill) : false;
  const detailsComplete = true;
  const serviceFeeApplied = bill ? isServiceFeeApplied(bill) : false;

  const completeByTab: Record<(typeof tabDefs)[number]['id'], boolean> = {
    participants: participantsComplete,
    items: itemsComplete,
    consumptions: consumptionsComplete,
    details: detailsComplete,
    statistics: participantsComplete && itemsComplete && consumptionsComplete && detailsComplete,
  };

  const activeIndex = tabDefs.findIndex((tab) => tab.id === activeTab);

  const tabs = tabDefs.map((tab, index) => ({
    ...tab,
    complete: completeByTab[tab.id],
    checked: tab.id === 'details' ? serviceFeeApplied || index < activeIndex : undefined,
  }));

  const changeTab = (tabId: string) => {
    if (tabId === activeTab) return;
    if (
      activeTab === 'consumptions' &&
      participantsComplete &&
      itemsComplete &&
      !consumptionsComplete
    ) {
      setRevealConsumptionGaps(true);
    }
    const nextIndex = tabDefs.findIndex((tab) => tab.id === tabId);
    setMotion({
      leaving: activeTab,
      direction: nextIndex > activeIndex ? 'forward' : 'back',
    });
    setActiveTab(tabId);
  };

  useEffect(() => {
    if (!motion) return;
    const timer = window.setTimeout(() => setMotion(null), SLIDE_MS + 80);
    return () => window.clearTimeout(timer);
  }, [motion]);

  const finishSlide = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      if (event.animationName !== 'tab-fade-out') return;
    } else if (!event.animationName.startsWith('tab-slide-out')) {
      return;
    }
    setMotion(null);
  };

  const renderTab = (tabId: string) => {
    if (tabId === 'participants') return <ParticipantsTab />;
    if (tabId === 'items') return <ItemsTab onGoToConsumptions={() => changeTab('consumptions')} />;
    if (tabId === 'consumptions') {
      return (
        <ConsumptionsTab
          showGaps={revealConsumptionGaps}
          onGoToParticipants={() => changeTab('participants')}
          onGoToItems={() => changeTab('items')}
        />
      );
    }
    if (tabId === 'details') return <DetailsTab onGoToConsumptions={() => changeTab('consumptions')} />;
    return (
      <StatisticsTab
        onGoToParticipants={() => changeTab('participants')}
        onGoToItems={() => changeTab('items')}
        onGoToConsumptions={() => changeTab('consumptions')}
      />
    );
  };

  const incomingClass =
    motion?.direction === 'forward'
      ? 'tab-slide-in-forward'
      : motion?.direction === 'back'
        ? 'tab-slide-in-back'
        : '';

  return (
    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={changeTab}>
      <div
        className="mx-auto w-full max-w-3xl px-4 pt-8 sm:px-10 lg:px-12"
        style={{ minHeight: 'calc(var(--scrollport-height) - var(--tab-bar-height) + 2px)' }}
      >
        <div className="grid">
        {motion && (
          <div
            key={motion.leaving}
            inert
            aria-hidden
            onAnimationEnd={finishSlide}
            className={`col-start-1 row-start-1 pointer-events-none ${
              motion.direction === 'forward' ? 'tab-slide-out-forward' : 'tab-slide-out-back'
            }`}
          >
            {renderTab(motion.leaving)}
          </div>
        )}
        <div key={activeTab} className={`col-start-1 row-start-1 ${incomingClass}`}>
          {renderTab(activeTab)}
        </div>
        </div>
      </div>
      <div className="mt-10">
        <AppFooter />
      </div>
      <div aria-hidden="true" style={{ height: 'var(--tab-bar-height)' }} />
    </Tabs>
  );
};
