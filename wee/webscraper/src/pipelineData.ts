// PipelineData.ts
import { Page } from 'puppeteer';

// Models
import {
  ErrorResponse, RobotsResponse, Metadata, IndustryClassification,
} from './models/ServiceModels';

interface PipelineData {
  url: string;
  page: Page | null;
  data: {
    url: string;
    domainStatus: string;
    robots: RobotsResponse | ErrorResponse | null;
    metadata: Metadata | ErrorResponse | null;
    industryClassification: IndustryClassification | null;
    logo: string;
    images: string[];
    slogan: string;
    contactInfo: { emails: string[], phones: string[], socialLinks: string[] };
    time: 0;
    addresses: string[],
    screenshot: string | ErrorResponse;
    seoAnalysis: unknown;
  }
}

class PipelineDataClass implements PipelineData {
  url: string;
  page: Page | null;
  data: {
    url: string;
    domainStatus: string;
    robots: RobotsResponse | ErrorResponse | null;
    metadata: Metadata | ErrorResponse | null;
    industryClassification: IndustryClassification | null;
    logo: string;
    images: string[];
    slogan: string;
    contactInfo: { emails: string[], phones: string[], socialLinks: string[]};
    time: number;
    addresses: string[],
    screenshot: string | ErrorResponse;
    seoAnalysis: unknown;
  };

  constructor(url: string) {
    this.url = url;
    this.page = null;
    this.data = {
      url: '',
      domainStatus: '',
      robots: null,
      metadata: null,
      industryClassification: null,
      logo: '',
      images: [],
      slogan: '',
      contactInfo: { emails: [], phones: [], socialLinks: [] },
      time: 0,
      addresses: [],
      screenshot: '',
      seoAnalysis: {},
    };
  }
}

export { PipelineData, PipelineDataClass };
