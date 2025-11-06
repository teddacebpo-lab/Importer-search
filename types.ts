

export interface Source {
  uri: string;
  title: string;
}

export interface LastShipment {
  date: string;
  commodity: string;
  quantity: string;
  origin: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  vesselName?: string;
}

export interface Importer {
  importerName: string;
  website: string;
  information: string;
  notableActivity: string;
  address: string;
  phone: string;
  topTradePartners: string[];
  lastShipment: LastShipment;
}

export interface SearchResult {
  importers: Importer[];
  sources: Source[];
}

export interface DetailedImporterResult {
    reportText: string;
    shipmentHistory: Shipment[];
    similarImporters: string[];
    sources: Source[];
}

export interface Subscription {
  companyName: string;
  email: string;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: number;
}
export interface Shipment {
  date: string;
  commodity: string;
  quantity: string;
  destination: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  vesselName?: string;
}

export type CommodityTrendData = {
  [key: string]: string | number;
};

export interface RiskAssessment {
    financial: string;
    regulatory: string;
    geopolitical: string;
}

export interface TradeFlow {
    country: string;
    commodities: string[];
}

export interface ParsedImporterData {
  information: string;
  shipmentActivity: string;
  commodities: string;
  commodityTrends: CommodityTrendData[];
  supplierAnalysis: string;
  logisticsProfile: string;
  marketPosition: string;
  riskAssessment: RiskAssessment;
  contact: string;
  tradeFlows: TradeFlow[];
}