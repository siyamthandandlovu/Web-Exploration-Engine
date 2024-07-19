import { createContext, useContext } from 'react';
import Scraping from '../models/ScrapingModel';
import { Summary } from '../models/ScraperModels';
import { logger } from '../../../logger';

interface ScrapingContextType {
  results: Scraping[];
  setResults: (update: (prevResults: Scraping[]) => Scraping[]) => void;
  urls: string[];
  setUrls: (data: string[]) => void;
  processingUrls: string[];
  setProcessingUrls: (data: string[]) => void;
  processedUrls: string[];
  setProcessedUrls: (data: string[]) => void;
  summaryReport: Summary;
  setSummaryReport: (data: Summary) => void;
}

const ScrapingContext = createContext<ScrapingContextType | undefined>(
  undefined
);

export const useScrapingContext = () => {
  const context = useContext(ScrapingContext);
  if (!context) {
    logger.error('useScrapingContext must be used within a ScrapingProvider');
    throw new Error(
      'useScrapingContext must be used within a ScrapingProvider'
    );
  }
  logger.info('Scraping context created',context);

  return context;
};

export default ScrapingContext;
