import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export const Tabs = ({ tabs, activeTab, onTabChange, children }: TabsProps) => {
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
                flex-1 px-4 py-4 text-sm font-medium transition-colors flex items-center justify-center
                ${
                  activeTab === tab.id
                    ? 'text-primary-600 bg-primary-50 border-t-2 border-primary-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className="sm:hidden">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
