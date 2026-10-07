'use client';

import { ReactNode, useLayoutEffect, useRef } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  complete?: boolean;
  /** Quando definido, o check só aparece se este valor for verdadeiro. */
  checked?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="currentColor"
    viewBox="0 0 256 256"
    aria-hidden="true"
  >
    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="currentColor"
    viewBox="0 0 256 256"
    aria-hidden="true"
  >
    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
  </svg>
);

export const Tabs = ({ tabs, activeTab, onTabChange, children }: TabsProps) => {
  const barRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeTab)
  );
  const span = Math.max(tabs.length - 1, 1);
  const progress = tabs.length > 1 ? activeIndex / span : 0;
  const firstMissedIndex = tabs.findIndex((tab, index) => index < activeIndex && !tab.complete);
  const greenEnd = firstMissedIndex === -1 ? progress : firstMissedIndex / span;
  const redStart = firstMissedIndex === -1 ? progress : firstMissedIndex / span;
  const edge = tabs.length > 0 ? 50 / tabs.length : 0;
  const barMotion =
    'transition-[width,left] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none';

  useLayoutEffect(() => {
    const bar = barRef.current;
    const scroller = scrollerRef.current;
    if (!bar || !scroller) return;

    const apply = () => {
      scroller.style.setProperty('--tab-bar-height', `${bar.offsetHeight}px`);
      scroller.style.setProperty('--scrollport-height', `${scroller.clientHeight}px`);
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(bar);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col">
      <div ref={scrollerRef} className="h-0 min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </div>
      <div
        ref={barRef}
        className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white shadow-card"
      >
        <div className="max-w-3xl mx-auto">
          <nav className="relative flex" aria-label="Etapas da conta">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-7 z-0 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-gray-200"
              style={{ left: `${edge}%`, right: `${edge}%` }}
            >
              <div
                className={`absolute inset-y-0 left-0 bg-primary-600 ${barMotion}`}
                style={{ width: `${greenEnd * 100}%` }}
              />
              <div
                className={`absolute inset-y-0 bg-red-700 ${barMotion}`}
                style={{ left: `${redStart * 100}%`, width: `${Math.max(progress - redStart, 0) * 100}%` }}
              />
            </div>
            {tabs.map((tab, index) => {
              const isActive = tab.id === activeTab;
              const showCheck =
                (tab.checked !== undefined ? tab.checked : Boolean(tab.complete)) && !isActive;
              const showMissed = !tab.complete && index < activeIndex;
              const circleClass = isActive
                ? tab.complete
                  ? 'bg-white text-primary-800 ring-4 ring-primary-100 border border-primary-700'
                  : 'bg-white text-primary-800 ring-4 ring-red-100 border border-red-700'
                : showMissed
                  ? 'bg-red-700 text-white'
                  : showCheck
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300';

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={
                    showMissed
                      ? `${tab.label}, etapa ${index + 1}, incompleta`
                      : showCheck
                        ? `${tab.label}, etapa ${index + 1}, concluída`
                        : `${tab.label}, etapa ${index + 1}`
                  }
                  className={`relative z-10 flex-1 flex flex-col items-center gap-1.5 px-1 pt-3 pb-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 ${
                    isActive
                      ? 'text-primary-800 font-semibold'
                      : showMissed
                        ? 'text-red-700'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors duration-300 ${circleClass}`}
                  >
                    {showMissed ? <XIcon /> : showCheck ? <CheckIcon /> : index + 1}
                  </span>
                  <span className="sm:hidden">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
