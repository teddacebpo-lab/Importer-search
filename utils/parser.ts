import type { ParsedImporterData, CommodityTrendData, RiskAssessment, TradeFlow } from '../types';

export const parseRawText = (text: string): ParsedImporterData => {
  const information = text.split('[IMPORTER_INFORMATION]')[1]?.split('[SHIPMENT_ACTIVITY]')[0]?.trim() || 'N/A';
  const shipmentActivity = text.split('[SHIPMENT_ACTIVITY]')[1]?.split('[COMMODITIES]')[0]?.trim() || 'N/A';
  const commodities = text.split('[COMMODITIES]')[1]?.split('[COMMODITY_TRENDS]')[0]?.trim() || 'N/A';
  const trendsRaw = text.split('[COMMODITY_TRENDS]')[1]?.split('[SUPPLIER_ANALYSIS]')[0]?.trim() || '';
  const supplierAnalysis = text.split('[SUPPLIER_ANALYSIS]')[1]?.split('[LOGISTICS_PROFILE]')[0]?.trim() || 'N/A';
  const logisticsProfile = text.split('[LOGISTICS_PROFILE]')[1]?.split('[MARKET_POSITION]')[0]?.trim() || 'N/A';
  const marketPosition = text.split('[MARKET_POSITION]')[1]?.split('[RISK_ASSESSMENT_FINANCIAL]')[0]?.trim() || 'N/A';
  
  const riskFinancial = text.split('[RISK_ASSESSMENT_FINANCIAL]')[1]?.split('[RISK_ASSESSMENT_REGULATORY]')[0]?.trim() || 'N/A';
  const riskRegulatory = text.split('[RISK_ASSESSMENT_REGULATORY]')[1]?.split('[RISK_ASSESSMENT_GEOPOLITICAL]')[0]?.trim() || 'N/A';
  const riskGeopolitical = text.split('[RISK_ASSESSMENT_GEOPOLITICAL]')[1]?.split('[TRADE_FLOWS]')[0]?.trim() || 'N/A';
  
  const riskAssessment: RiskAssessment = {
    financial: riskFinancial,
    regulatory: riskRegulatory,
    geopolitical: riskGeopolitical,
  };

  const tradeFlowsRaw = text.split('[TRADE_FLOWS]')[1]?.split('[CONTACT]')[0]?.trim() || '';
  const contact = text.split('[CONTACT]')[1]?.trim() || 'N/A';

  const commodityTrends: CommodityTrendData[] = [];
  if (trendsRaw) {
      const lines = trendsRaw.split('\n').filter(line => line.trim() !== '' && !line.startsWith('Example:'));
      if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim());
          const monthKey = headers[0];
          
          for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(',').map(v => v.trim());
              if (values.length === headers.length) {
                  const trendPoint: CommodityTrendData = { [monthKey]: values[0] };
                  for (let j = 1; j < headers.length; j++) {
                      const key = headers[j].trim();
                      const value = parseFloat(values[j]);
                      if (!isNaN(value)) {
                          trendPoint[key] = value;
                      }
                  }
                  commodityTrends.push(trendPoint);
              }
          }
      }
  }

  const tradeFlows: TradeFlow[] = [];
  if (tradeFlowsRaw) {
      const lines = tradeFlowsRaw.split('\n').filter(line => line.trim() !== '');
      lines.forEach(line => {
          const parts = line.split(':');
          if (parts.length === 2) {
              const country = parts[0].trim();
              const commodities = parts[1].split(',').map(c => c.trim()).filter(Boolean);
              if (country && commodities.length > 0) {
                  tradeFlows.push({ country, commodities });
              }
          }
      });
  }
  
  return { information, shipmentActivity, commodities, commodityTrends, supplierAnalysis, logisticsProfile, marketPosition, riskAssessment, contact, tradeFlows };
};