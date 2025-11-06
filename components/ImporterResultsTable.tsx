import React, { useState, useMemo } from 'react';
import type { Importer } from '../types';
import { BellIcon, ShipIcon, PhoneIcon, InfoIcon, ExternalLinkIcon, ArrowUpIcon, ArrowDownIcon } from './icons';

type SortableKey = 'importerName' | 'date';

interface SortConfig {
  key: SortableKey;
  direction: 'ascending' | 'descending';
}

const SortableHeader: React.FC<{
  sortKey: SortableKey;
  title: string;
  sortConfig: SortConfig | null;
  requestSort: (key: SortableKey) => void;
  className?: string;
  children: React.ReactNode;
}> = ({ sortKey, title, sortConfig, requestSort, className = '', children }) => {
  const isSorted = sortConfig?.key === sortKey;
  const direction = sortConfig?.direction;

  return (
    <th className={`p-4 text-sm font-semibold text-slate-300 tracking-wider ${className}`}>
      <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2 group">
        {children}
        <span>{title}</span>
        <span className="opacity-30 group-hover:opacity-100 transition-opacity">
          {isSorted && direction === 'ascending' && <ArrowUpIcon className="w-4 h-4" />}
          {isSorted && direction === 'descending' && <ArrowDownIcon className="w-4 h-4" />}
        </span>
      </button>
    </th>
  );
};


interface ImporterResultsTableProps {
  importers: Importer[];
  onSubscribe: (name: string) => void;
  onSelectImporter: (importer: Importer) => void;
}

export const ImporterResultsTable: React.FC<ImporterResultsTableProps> = ({ importers, onSubscribe, onSelectImporter }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'importerName', direction: 'ascending' });

  const sortedImporters = useMemo(() => {
    let sortableItems = [...importers];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortConfig.key) {
            case 'date':
                aValue = new Date(a.lastShipment.date).getTime() || 0;
                bValue = new Date(b.lastShipment.date).getTime() || 0;
                break;
            default: // importerName
                aValue = a.importerName;
                bValue = b.importerName;
                break;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [importers, sortConfig]);

  const requestSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-200">Search Results</h2>
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/70">
              <tr>
                <SortableHeader sortKey="importerName" title="Importer / Activity" sortConfig={sortConfig} requestSort={requestSort} className="w-2/5">
                  <InfoIcon className="w-5 h-5" />
                </SortableHeader>
                <SortableHeader sortKey="date" title="Last Shipment" sortConfig={sortConfig} requestSort={requestSort} className="w-1/4">
                    <ShipIcon className="w-5 h-5"/>
                </SortableHeader>
                <th className="p-4 text-sm font-semibold text-slate-300 tracking-wider w-1/4">
                    <div className="flex items-center gap-2">
                        <PhoneIcon className="w-5 h-5" />
                        <span>Location & Contact</span>
                    </div>
                </th>
                <th className="p-4 text-sm font-semibold text-slate-300 tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedImporters.map((importer, index) => (
                <tr 
                  key={index} 
                  className="border-t border-slate-700 hover:bg-slate-700/50 transition-colors duration-200 group"
                >
                  <td className="p-4 align-top">
                    <div className="max-w-xl">
                        <div className="flex items-start gap-2">
                           <button 
                                onClick={() => onSelectImporter(importer)}
                                className="font-bold text-lg text-orange-400 hover:text-orange-300 hover:underline transition-colors text-left"
                            >
                                {importer.importerName}
                            </button>
                            <a 
                                href={importer.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-orange-400 pt-1.5 flex-shrink-0"
                                aria-label={`Visit website for ${importer.importerName}`}
                            >
                                <ExternalLinkIcon className="w-4 h-4" />
                            </a>
                        </div>
                        <p className="mt-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{importer.information}</p>
                        {importer.notableActivity && <p className="mt-2 text-sm text-orange-300/80 italic">"{importer.notableActivity}"</p>}
                        {importer.topTradePartners?.length > 0 && (
                            <div className="mt-3">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-1.5">Top Partners</h4>
                                <div className="flex flex-wrap gap-2">
                                    {importer.topTradePartners.map((partner, i) => (
                                        <span key={i} className="px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-full">{partner}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="p-4 align-top text-sm text-slate-400">
                    {importer.lastShipment?.date && <p><strong>Date:</strong> {importer.lastShipment.date}</p>}
                    {importer.lastShipment?.commodity && <p className="mt-1"><strong>Commodity:</strong> {importer.lastShipment.commodity}</p>}
                    {importer.lastShipment?.quantity && <p className="mt-1"><strong>Quantity:</strong> {importer.lastShipment.quantity}</p>}
                    {importer.lastShipment?.origin && <p className="mt-1"><strong>Origin:</strong> {importer.lastShipment.origin}</p>}
                  </td>
                  <td className="p-4 align-top text-sm text-slate-400">
                    {importer.address && <p>{importer.address}</p>}
                    {importer.phone && <a href={`tel:${importer.phone.replace(/[^0-9+]/g, '')}`} className="mt-1 block text-orange-400 hover:underline">{importer.phone}</a>}
                  </td>
                  <td className="p-4 align-top text-center">
                    <button
                        onClick={() => onSubscribe(importer.importerName)}
                        className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                        aria-label={`Subscribe to alerts for ${importer.importerName}`}
                    >
                        <BellIcon className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};