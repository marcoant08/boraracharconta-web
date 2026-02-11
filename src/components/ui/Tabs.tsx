import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
  connected?: boolean;
}

export const Tabs = ({ tabs, activeTab, onTabChange, children, connected = true }: TabsProps) => {
  const borderColor = connected ? 'border-green-500' : 'border-red-500';
  const textColor = connected ? 'text-green-600' : 'text-red-600';
  const bgColor = connected ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto pb-24 px-4">{children}</div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <nav className="flex" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-1 px-4 py-4 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? `${textColor} ${bgColor} border-t-2 ${borderColor}`
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
