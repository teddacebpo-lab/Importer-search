

import { GoogleGenAI } from "@google/genai";
import type { SearchResult, Source, Importer, DetailedImporterResult, Shipment } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonFromResponse = (text: string): any => {
    // Find the first '{' and the last '}' to extract the JSON object.
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
        // Fallback for code blocks
        const codeBlockStart = text.indexOf('```json');
        if (codeBlockStart !== -1) {
            const codeBlockEnd = text.lastIndexOf('```');
            const jsonInBlock = text.substring(codeBlockStart + 7, codeBlockEnd);
            return JSON.parse(jsonInBlock);
        }
        console.error("Invalid JSON response:", text);
        throw new Error("Could not find a valid JSON object in the response.");
    }
    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);
}

const getUniqueSources = (response: any): Source[] => {
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: Source[] = groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title,
      }))
      .filter((source: Source) => source.uri && source.title) || [];
    
    return Array.from(new Map(sources.map(item => [item['uri'], item])).values());
}

export const fetchImporterData = async (importerName: string): Promise<SearchResult> => {
  const prompt = `You are a world-class global trade data analyst. Your goal is to provide precise and actionable intelligence on importers.
Your task is to find and structure information for 3 or 4 distinct importers that closely match the name '${importerName}'.
Prioritize companies based in the USA or those with significant import/export activity involving the USA.
Use the provided search tools to gather the most up-to-date and accurate data available.

For each importer found, provide the following details in a structured format:
- importerName: The official, full name of the company.
- website: The official, clickable website URL (must start with http or https).
- information: A concise one-sentence description of the company and its primary business.
- notableActivity: A brief, interesting insight into their recent trade activity (e.g., "Recent surge in electronics imports from Vietnam", "First-time importer of a new commodity type").
- address: The full corporate headquarters address, if available.
- phone: A publicly available contact phone number.
- topTradePartners: An array of the top 3 countries they import from.
- lastShipment: Details of their most recent shipment including date (YYYY-MM-DD), commodity, quantity, and origin country.

Respond with a single JSON object with a key "importers" containing an array of these importer objects. If no importers are found, return an empty array. Do not include any text, markdown, or explanation outside of the JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const jsonResponse = parseJsonFromResponse(response.text);
    const importers: Importer[] = jsonResponse.importers || [];
    const sources = getUniqueSources(response);

    return { importers, sources };
  } catch (error) {
    console.error("Error fetching data from Gemini API:", error);
    throw new Error("Failed to retrieve data. The API may be unavailable or the request may have been blocked.");
  }
};


export const fetchDetailedImporterData = async (importerName: string): Promise<DetailedImporterResult> => {
    const prompt = `You are a senior global trade intelligence analyst. For the single, specific importer named '${importerName}', compile a comprehensive, in-depth report.

Your response MUST be a single JSON object with the following structure:
{
  "reportText": "A string containing the following sections, each clearly marked with a tag: [IMPORTER_INFORMATION]...[SHIPMENT_ACTIVITY]...[COMMODITIES]...[COMMODITY_TRENDS]...[SUPPLIER_ANALYSIS]...[LOGISTICS_PROFILE]...[MARKET_POSITION]...[RISK_ASSESSMENT_FINANCIAL]...[RISK_ASSESSMENT_REGULATORY]...[RISK_ASSESSMENT_GEOPOLITICAL]...[TRADE_FLOWS]...[CONTACT]. The [COMMODITY_TRENDS] section must contain CSV data of monthly import volumes for top commodities. For risk assessment, provide a detailed breakdown: [RISK_ASSESSMENT_FINANCIAL] should include specific financial stability indicators like credit scores, payment history, or summaries of recent financial health reports. [RISK_ASSESSMENT_REGULATORY] must cover regulatory compliance history, detailing any known violations, fines, or significant audits. [RISK_ASSESSMENT_GEOPOLITICAL] must analyze geopolitical risk exposure for the importer's key operating regions and trade routes, mentioning specific country-related risks. The [TRADE_FLOWS] section must list their top 3-4 trade partner countries and the primary commodities imported from each, in the format 'Country: Commodity 1, Commodity 2'.",
  "shipmentHistory": [
    { "date": "YYYY-MM-DD", "commodity": "...", "quantity": "...", "destination": "Country Name", "portOfLoading": "Port Name, Country", "portOfDischarge": "Port Name, Country", "vesselName": "Vessel Name (if available)" },
    { "date": "YYYY-MM-DD", "commodity": "...", "quantity": "...", "destination": "Country Name", "portOfLoading": "Port Name, Country", "portOfDischarge": "Port Name, Country", "vesselName": "Vessel Name (if available)" },
    { "date": "YYYY-MM-DD", "commodity": "...", "quantity": "...", "destination": "Country Name", "portOfLoading": "Port Name, Country", "portOfDischarge": "Port Name, Country", "vesselName": "Vessel Name (if available)" },
    { "date": "YYYY-MM-DD", "commodity": "...", "quantity": "...", "destination": "Country Name", "portOfLoading": "Port Name, Country", "portOfDischarge": "Port Name, Country", "vesselName": "Vessel Name (if available)" },
    { "date": "YYYY-MM-DD", "commodity": "...", "quantity": "...", "destination": "Country Name", "portOfLoading": "Port Name, Country", "portOfDischarge": "Port Name, Country", "vesselName": "Vessel Name (if available)" },
    { "date": "YYYY-MM-DD", "commodity": "...", "quantity": "...", "destination": "Country Name", "portOfLoading": "Port Name, Country", "portOfDischarge": "Port Name, Country", "vesselName": "Vessel Name (if available)" },
    { "date": "YYYY-MM-DD", "commodity": "...", "quantity": "...", "destination": "Country Name", "portOfLoading": "Port Name, Country", "portOfDischarge": "Port Name, Country", "vesselName": "Vessel Name (if available)" },
    { "date": "YYYY-MM-DD", "commodity": "...", "quantity": "...", "destination": "Country Name", "portOfLoading": "Port Name, Country", "portOfDischarge": "Port Name, Country", "vesselName": "Vessel Name (if available)" },
    { "date": "YYYY-MM-DD", "commodity": "...", "quantity": "...", "destination": "Country Name", "portOfLoading": "Port Name, Country", "portOfDischarge": "Port Name, Country", "vesselName": "Vessel Name (if available)" },
    { "date": "YYYY-MM-DD", "commodity": "...", "quantity": "...", "destination": "Country Name", "portOfLoading": "Port Name, Country", "portOfDischarge": "Port Name, Country", "vesselName": "Vessel Name (if available)" }
  ],
  "similarImporters": [
    "Similar Company Name 1",
    "Similar Company Name 2",
    "Similar Company Name 3",
    "Similar Company Name 4"
  ]
}
If no data is found for a field, return an empty string or an empty array. Do not include any other text, markdown, or explanation outside of this JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const jsonResponse = parseJsonFromResponse(response.text);
        const reportText: string = jsonResponse.reportText || '';
        const shipmentHistory: Shipment[] = jsonResponse.shipmentHistory || [];
        const similarImporters: string[] = jsonResponse.similarImporters || [];
        const sources = getUniqueSources(response);
        
        return { reportText, shipmentHistory, similarImporters, sources };
    } catch (error) {
        console.error("Error fetching detailed data from Gemini API:", error);
        throw new Error("Failed to retrieve detailed data. The API may be unavailable or the request may have been blocked.");
    }
}