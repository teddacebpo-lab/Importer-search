import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { fetchImporterData, fetchDetailedImporterData } from './services/geminiService';
import type { SearchResult, Subscription, Notification, DetailedImporterResult, Importer } from './types';
import { Spinner } from './components/Spinner';
import { SourceLink } from './components/SourceLink';
import { GlobeIcon, SearchIcon, BellIcon, ArrowDownTrayIcon } from './components/icons';
import { AlertModal } from './components/AlertModal';
import { NotificationPanel } from './components/NotificationPanel';
import { ImporterCard } from './components/ImporterCard';
import { Suggestions } from './components/Suggestions';

interface ImporterDetailState {
    importer: Importer;
    details: DetailedImporterResult | null;
    isLoading: boolean;
    error: string | null;
}

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [importerDetails, setImporterDetails] = useState<ImporterDetailState[]>([]);
  
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [alertCompanyName, setAlertCompanyName] = useState<string>('');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState<boolean>(false);

  const notificationButtonRef = useRef<HTMLButtonElement>(null);


  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const storedSubscriptions = localStorage.getItem('importerIntel-subscriptions');
      if (storedSubscriptions) {
        setSubscriptions(JSON.parse(storedSubscriptions));
      }
      const storedNotifications = localStorage.getItem('importerIntel-notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (e) {
      console.error("Failed to parse from localStorage", e);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('importerIntel-subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('importerIntel-notifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleOpenAlertModal = useCallback((name: string) => {
    setAlertCompanyName(name);
    setIsAlertModalOpen(true);
  }, []);

  const handleCloseAlertModal = useCallback(() => {
    setIsAlertModalOpen(false);
  }, []);

  const handleSubscribe = useCallback((companyName: string, email: string) => {
    setSubscriptions(prev => {
        const newSubscriptions = [...prev, { companyName, email }];
        // Prevent duplicates just in case
        return Array.from(new Map(newSubscriptions.map(item => [item.companyName, item])).values());
    });
    setNotifications(prev => [
        {
            id: Date.now().toString(),
            message: `You are now subscribed to alerts for ${companyName}.`,
            timestamp: Date.now(),
        },
        ...prev
    ]);
  }, []);
  
  const handleClearNotifications = useCallback(() => {
    setNotifications([]);
    setIsNotificationPanelOpen(false);
  }, []);

  const triggerSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || isLoading) return;

    document.body.scrollIntoView({ behavior: 'smooth' });
    setQuery(searchQuery);
    setIsLoading(true);
    setError(null);
    setSearchResult(null);
    setImporterDetails([]);

    try {
      const data = await fetchImporterData(searchQuery);
      setSearchResult(data);

      if (data.importers.length === 0) {
        setIsLoading(false);
        return;
      }
      
      const initialDetails = data.importers.map(imp => ({
        importer: imp,
        details: null,
        isLoading: true,
        error: null,
      }));
      setImporterDetails(initialDetails);
      setIsLoading(false); // Main loading is done, now individual cards will load

      data.importers.forEach(importer => {
          fetchDetailedImporterData(importer.importerName)
              .then(details => {
                  setImporterDetails(prev => prev.map(item => 
                      item.importer.importerName === importer.importerName 
                          ? { ...item, details, isLoading: false }
                          : item
                  ));
              })
              .catch(error => {
                  setImporterDetails(prev => prev.map(item => 
                      item.importer.importerName === importer.importerName 
                          ? { ...item, error: error.message || 'Failed to fetch details.', isLoading: false }
                          : item
                  ));
              });
      });

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(query);
  }, [query, triggerSearch]);
  
  const handleExport = useCallback(() => {
    if (!searchResult || searchResult.importers.length === 0) return;

    const headers = [
        'Importer Name', 'Website', 'Information', 'Notable Activity', 'Address', 'Phone',
        'Top Trade Partners', 'Last Shipment Date', 'Last Shipment Commodity',
        'Last Shipment Quantity', 'Last Shipment Origin'
    ];

    const rows = searchResult.importers.map(importer => [
        `"${importer.importerName.replace(/"/g, '""')}"`,
        `"${importer.website}"`,
        `"${importer.information.replace(/"/g, '""')}"`,
        `"${importer.notableActivity.replace(/"/g, '""')}"`,
        `"${importer.address.replace(/"/g, '""')}"`,
        `"${importer.phone}"`,
        `"${importer.topTradePartners.join('; ')}"`,
        `"${importer.lastShipment.date}"`,
        `"${importer.lastShipment.commodity.replace(/"/g, '""')}"`,
        `"${importer.lastShipment.quantity.replace(/"/g, '""')}"`,
        `"${importer.lastShipment.origin.replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "importer_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [searchResult]);

  const allSimilarImporters = useMemo(() => {
    const displayedNames = new Set(importerDetails.map(item => item.importer.importerName));
    const allSuggestions = importerDetails
        .filter(item => item.details)
        .flatMap(item => item.details!.similarImporters);
    
    const uniqueSuggestions = [...new Set(allSuggestions)];

    return uniqueSuggestions.filter(name => !displayedNames.has(name));
  }, [importerDetails]);
  
  const isPristineState = !isLoading && !error && !searchResult;

  const renderContent = () => {
    if (isLoading) return <Spinner message="Fetching importer details..." />;
    if (error) return <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">{error}</div>;

    if (importerDetails.length > 0) {
      return (
        <div className="space-y-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-200">Search Results</h2>
             {searchResult && searchResult.importers.length > 0 && (
                <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-500 transition-colors text-sm"
                >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Export Data</span>
                </button>
            )}
          </div>
          {importerDetails.map(({ importer, details, isLoading: isDetailLoading, error: detailError }, index) => (
            <article key={index}>
              {isDetailLoading && <div className="bg-slate-800/50 p-6 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg shadow-black/20"><Spinner message={`Fetching details for ${importer.importerName}...`} /></div>}
              {detailError && <div className="p-6 bg-red-900/50 border border-red-700 text-red-300 rounded-xl text-center">{detailError}</div>}
              {details && (
                <ImporterCard
                  rawText={details.reportText}
                  importerName={importer.importerName}
                  onSubscribe={handleOpenAlertModal}
                  shipmentHistory={details.shipmentHistory}
                  isHistoryLoading={isDetailLoading}
                />
              )}
            </article>
          ))}
          
          {allSimilarImporters.length > 0 && (
            <Suggestions
              suggestions={allSimilarImporters}
              onSuggestionClick={(name) => {
                setQuery(name);
                triggerSearch(name);
              }}
              isLoading={false}
            />
          )}

          {searchResult && searchResult.sources.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3 text-slate-300">Sources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResult.sources.map((source, index) => (
                  <SourceLink key={index} source={source} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (searchResult && searchResult.importers.length === 0) {
      return (
        <div className="text-center text-slate-500 py-16">
          <p>No importers found for '{query}'. Try a different name.</p>
        </div>
      );
    }

    return (
        <div className="text-center text-slate-200 py-16">
            <p className="text-lg">Enter an importer's name to begin your search.</p>
        </div>
    );
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 relative">
       {isPristineState && (
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578574577315-3f160d00976b?q=80&w=2970&auto=format&fit=crop')`,
            opacity: 0.2,
          }}
        ></div>
      )}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <header className="relative text-center mb-12">
            <div className="absolute top-0 right-0">
              <div className="relative">
                  <button
                      ref={notificationButtonRef}
                      onClick={() => setIsNotificationPanelOpen(prev => !prev)}
                      className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-orange-400 transition-colors" aria-label="View notifications">
                    <BellIcon className="w-7 h-7" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-orange-500 ring-2 ring-slate-900" />
                    )}
                  </button>
                  {isNotificationPanelOpen && (
                      <NotificationPanel
                          notifications={notifications}
                          onClose={() => setIsNotificationPanelOpen(false)}
                          onClearAll={handleClearNotifications}
                          parentRef={notificationButtonRef}
                      />
                  )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-3 mb-1">
                <GlobeIcon className="w-10 h-10" />
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  <span className="text-orange-400">TEU Global</span>{' '}
                  <span className="text-blue-500">Importer Intel</span>
                </h1>
              </div>
              <p className="text-md text-slate-400">
                AI-powered insights, prioritizing USA-based trade from global sources.
              </p>
            </div>
          </header>

          <main>
            <form onSubmit={handleSearch} className="relative mb-8 max-w-4xl mx-auto">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter importer name (e.g., 'Tesla Inc')..."
                className="w-full pl-4 pr-12 py-4 text-lg bg-slate-800/80 backdrop-blur-sm border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 text-white placeholder-slate-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-orange-600 rounded-md hover:bg-orange-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                <SearchIcon className="w-6 h-6 text-white" />
              </button>
            </form>

            <div className="mt-6">
              {renderContent()}
            </div>
          </main>
          
          <footer className="text-center mt-12 text-slate-500 text-sm">
              <p>Powered by JUNAID ABBASI. Data is for informational purposes only.</p>
          </footer>
        </div>
        {isAlertModalOpen && (
          <AlertModal 
            companyName={alertCompanyName} 
            onClose={handleCloseAlertModal} 
            onSubscribe={handleSubscribe} 
            subscriptions={subscriptions}
          />
        )}
      </div>
    </div>
  );
};

export default App;