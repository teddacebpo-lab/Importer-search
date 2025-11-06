import React, { useState, useEffect, useMemo } from 'react';
import type { ParsedImporterData, Shipment } from '../types';
import { InfoIcon, BoxIcon, PhoneIcon, BellIcon, ChartBarIcon, TableCellsIcon, InformationCircleIcon, UsersIcon, TruckIcon, TrendingUpIcon, ShieldExclamationIcon, MailIcon, MapPinIcon, ArrowRightLeftIcon, CheckCircleIcon } from './icons';
import { parseRawText } from '../utils/parser';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Spinner } from './Spinner';
import { TradeFlowVisualization } from './TradeFlowVisualization';
import { ContactForm } from './ContactForm';

interface ImporterCardProps {
  rawText: string;
  importerName: string;
  onSubscribe: (name: string) => void;
  shipmentHistory: Shipment[] | null;
  isHistoryLoading: boolean;
}

const CHART_COLORS = ['#fb923c', '#f97316', '#ea580c', '#c2410c'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700/80 backdrop-blur-sm border border-slate-600 p-3 rounded-lg shadow-lg">
        <p className="font-bold text-slate-200 mb-2">{`${label}`}</p>
        <ul className="list-none p-0 m-0">
          {payload.map((pld: any, index: number) => (
            <li key={index} style={{ color: pld.color }} className="flex items-center text-sm my-1">
              <span className="block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: pld.color }}></span>
              <span>{`${pld.name}: `}</span>
              <span className="font-semibold ml-1">{pld.value.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};

const CommodityTrendChart: React.FC<{ data: ParsedImporterData }> = ({ data }) => {
  const trendData = data.commodityTrends;

  const commodityKeys = useMemo(() => {
    if (!trendData || trendData.length === 0) return [];
    const firstDataPoint = trendData[0];
    const monthKey = Object.keys(firstDataPoint)[0];
    return Object.keys(firstDataPoint).filter(key => key !== monthKey);
  }, [trendData]);
  
  if (!trendData || trendData.length === 0) {
    return <p className="text-slate-500 text-center py-4">No commodity trend data available.</p>;
  }
  
  const monthKey = Object.keys(trendData[0])[0];

  return (
    <div className="h-80 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey={monthKey} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(234, 88, 12, 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                {commodityKeys.map((key, index) => (
                    <Bar key={key} dataKey={key} fill={CHART_COLORS[index % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <div className="flex items-center gap-3 mb-3">
            {icon}
            <h3 className="text-md font-semibold text-slate-300">{title}</h3>
        </div>
        <div className="text-slate-400 text-sm whitespace-pre-wrap">{children}</div>
    </div>
);


export const ImporterCard: React.FC<ImporterCardProps> = ({ rawText, importerName, onSubscribe, shipmentHistory, isHistoryLoading }) => {
  const [data, setData] = useState<ParsedImporterData | null>(null);
  const [isContactFormVisible, setIsContactFormVisible] = useState(false);

  useEffect(() => {
    if (rawText) {
      setData(parseRawText(rawText));
    }
  }, [rawText]);

  if (!data) {
    return null;
  }

  return (
    <div className="transition-all duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-200 to-slate-400 text-transparent bg-clip-text pr-4">
            {importerName}
          </h2>
          <button
            onClick={() => onSubscribe(importerName)}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            aria-label={`Subscribe to alerts for ${importerName}`}
          >
            <BellIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Section title="Importer Information" icon={<InfoIcon className="w-6 h-6 text-orange-400" />}>{data.information}</Section>
          <Section title="Main Commodities" icon={<BoxIcon className="w-6 h-6 text-orange-400" />}>{data.commodities}</Section>
          <Section title="Supplier Analysis" icon={<UsersIcon className="w-6 h-6 text-orange-400" />}>{data.supplierAnalysis}</Section>
          <Section title="Logistics Profile" icon={<TruckIcon className="w-6 h-6 text-orange-400" />}>{data.logisticsProfile}</Section>
          <Section title="Market Position" icon={<TrendingUpIcon className="w-6 h-6 text-orange-400" />}>{data.marketPosition}</Section>
          <Section title="Contact" icon={<PhoneIcon className="w-6 h-6 text-orange-400" />}>{data.contact}</Section>
        </div>
      </div>
      
      <div className="p-6 space-y-8">
        <div>
            <div className="flex items-center gap-3 mb-4">
                <ShieldExclamationIcon className="w-6 h-6 text-orange-400"/>
                <h3 className="text-xl font-bold text-slate-200">Risk Assessment</h3>
            </div>
            <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-semibold text-slate-300 mb-1">Financial Stability</h4>
                    <p className="text-sm text-slate-400 whitespace-pre-wrap">{data.riskAssessment.financial}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-semibold text-slate-300 mb-1">Regulatory Compliance</h4>
                    <p className="text-sm text-slate-400 whitespace-pre-wrap">{data.riskAssessment.regulatory}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-semibold text-slate-300 mb-1">Geopolitical Exposure</h4>
                    <p className="text-sm text-slate-400 whitespace-pre-wrap">{data.riskAssessment.geopolitical}</p>
                </div>
            </div>
        </div>

        <div>
             <div className="flex items-center gap-3 mb-4">
                <MailIcon className="w-6 h-6 text-orange-400"/>
                <h3 className="text-xl font-bold text-slate-200">Contact Importer</h3>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                {isContactFormVisible ? (
                    <ContactForm onClose={() => setIsContactFormVisible(false)} />
                ) : (
                    <div className="text-center">
                        <p className="text-slate-400 mb-4">Have a direct inquiry? Send a message to {importerName}.</p>
                        <button 
                            onClick={() => setIsContactFormVisible(true)}
                            className="bg-orange-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                        >
                            Show Contact Form
                        </button>
                    </div>
                )}
            </div>
        </div>

        {data.tradeFlows && data.tradeFlows.length > 0 && (
             <div>
                <div className="flex items-center gap-3 mb-4">
                    <ArrowRightLeftIcon className="w-6 h-6 text-orange-400"/>
                    <h3 className="text-xl font-bold text-slate-200">Top Trade Flows</h3>
                </div>
                <TradeFlowVisualization tradeFlows={data.tradeFlows} />
            </div>
        )}
      </div>


      <div className="border-t border-slate-700 mt-4 p-6">
          <h3 className="text-xl font-bold text-slate-200 mb-4">Trade Activity Analysis</h3>
          <p className="text-slate-400 mb-6">{data.shipmentActivity}</p>

          <div className="space-y-8">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-3">
                        <ChartBarIcon className="w-6 h-6 text-orange-400"/>
                        <h4 className="text-lg font-semibold text-slate-300">Commodity Trends</h4>
                    </div>
                    <div className="relative group flex items-center">
                        <InformationCircleIcon className="w-5 h-5 text-slate-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-slate-200 bg-slate-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            This chart shows the estimated volume of key commodities imported over recent months based on available data.
                        </div>
                    </div>
                </div>
                <CommodityTrendChart data={data} />
            </div>

            <div>
                <div className="flex items-center gap-3 mb-4">
                    <TableCellsIcon className="w-6 h-6 text-orange-400"/>
                    <h4 className="text-lg font-semibold text-slate-300">Historical Shipments</h4>
                </div>
                {isHistoryLoading ? <Spinner message="Loading shipment history..." /> : (
                    <div className="overflow-x-auto bg-slate-900/50 rounded-lg border border-slate-700">
                        {shipmentHistory && shipmentHistory.length > 0 ? (
                             <table className="w-full text-left text-sm">
                                <thead className="bg-slate-800">
                                    <tr>
                                        <th className="p-3 font-semibold text-slate-300">Date</th>
                                        <th className="p-3 font-semibold text-slate-300">Commodity</th>
                                        <th className="p-3 font-semibold text-slate-300">Quantity</th>
                                        <th className="p-3 font-semibold text-slate-300">Port of Loading</th>
                                        <th className="p-3 font-semibold text-slate-300">Port of Discharge</th>
                                        <th className="p-3 font-semibold text-slate-300">Vessel Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shipmentHistory.map((shipment, index) => (
                                        <tr key={index} className="border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-colors">
                                            <td className="p-3 text-slate-400 whitespace-nowrap">{shipment.date}</td>
                                            <td className="p-3 text-slate-400">{shipment.commodity}</td>
                                            <td className="p-3 text-slate-400">{shipment.quantity}</td>
                                            <td className="p-3 text-slate-400">{shipment.portOfLoading || 'N/A'}</td>
                                            <td className="p-3 text-slate-400">{shipment.portOfDischarge || 'N/A'}</td>
                                            <td className="p-3 text-slate-400">{shipment.vesselName || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        ) : (
                            <p className="text-center text-slate-500 p-8">No historical shipment data found.</p>
                        )}
                    </div>
                )}
            </div>
          </div>
      </div>

    </div>
  );
};