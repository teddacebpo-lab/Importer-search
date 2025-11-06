import React from 'react';
import type { TradeFlow } from '../types';
import { MapPinIcon, BoxIcon } from './icons';

interface TradeFlowVisualizationProps {
    tradeFlows: TradeFlow[];
}

export const TradeFlowVisualization: React.FC<TradeFlowVisualizationProps> = ({ tradeFlows }) => {
    return (
        <div className="space-y-4">
            {tradeFlows.map((flow, index) => (
                <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                        <MapPinIcon className="w-6 h-6 text-orange-400 flex-shrink-0" />
                        <h4 className="text-lg font-bold text-slate-200">{flow.country}</h4>
                    </div>
                    <ul className="space-y-2 pl-4">
                        {flow.commodities.map((commodity, comIndex) => (
                            <li key={comIndex} className="flex items-start gap-3 text-slate-400">
                                <BoxIcon className="w-5 h-5 mt-0.5 text-slate-500 flex-shrink-0" />
                                <span>{commodity}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};