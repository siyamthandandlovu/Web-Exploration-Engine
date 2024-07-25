import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import puppeteer, { Browser } from 'puppeteer';

// Services
import { RobotsService } from './robots/robots.service';
import { ScrapeMetadataService } from './scrape-metadata/scrape-metadata.service';
import { ScrapeStatusService } from './scrape-status/scrape-status.service';
import { IndustryClassificationService } from './industry-classification/industry-classification.service';
import { ScrapeLogoService } from './scrape-logo/scrape-logo.service';
import { ScrapeImagesService } from './scrape-images/scrape-images.service';
import { ScreenshotService } from './screenshot-homepage/screenshot.service';
import { ScrapeContactInfoService } from './scrape-contact-info/scrape-contact-info.service';
import { ScrapeAddressService } from './scrape-address/scrape-address.service';
import { SeoAnalysisService } from './seo-analysis/seo-analysis.service';

// PipelineData
import { ErrorResponse, Metadata, RobotsResponse } from './models/ServiceModels';
import { PipelineDataClass } from './pipelineData';

@Injectable()
export class ScraperService {
  constructor(
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
    private readonly robotsService: RobotsService,
    private readonly metadataService: ScrapeMetadataService,
    private readonly scrapeStatusService: ScrapeStatusService,
    private readonly industryClassificationService: IndustryClassificationService,
    private readonly scrapeLogoService: ScrapeLogoService,
    private readonly scrapeImagesService: ScrapeImagesService,
    private readonly screenshotService: ScreenshotService,
    private readonly scrapeContactInfoService: ScrapeContactInfoService,
    private readonly scrapeAddressService: ScrapeAddressService,
    private readonly seoAnalysisService: SeoAnalysisService,
  ) {}

  async scrape(url: string) {
    const start = performance.now();

    // check if data is in cache
    const cachedData:string = await this.cacheManager.get(url);
    if (cachedData) {
      const end = performance.now();
      const times = (end - start) / 1000;
      console.log('CACHE HIT', times);
      const dataFromCache = JSON.parse(cachedData);

      // update the time field of the object being returned from cache
      dataFromCache.time = parseFloat(times.toFixed(4));      
      return dataFromCache;
    }
    
    console.log('CACHE MISS - SCRAPE');

    // create a new PipelineData object
    const browser: Browser = await puppeteer.launch();
    const page = await browser.newPage();
    const pipelineData = new PipelineDataClass(url);
    pipelineData.page = page;

    // validate url

    pipelineData.data.url = url;

    // scrape robots.txt file & url validation
    // scrape web status - live, parked, under construction
    const robotsPromise = this.robotsService.readRobotsFile(pipelineData.data.url);
    const statusPromise = this.scrapeStatusService.scrapeStatus(pipelineData.data.url);

    const [robotsResponse, status] = await Promise.all([
      robotsPromise,
      statusPromise,
    ]);
    pipelineData.data.domainStatus = status;

    // blocking - check for error response
    // some kind of retry mechanism here?
    if ('errorStatus' in robotsResponse) {
      pipelineData.data.robots = robotsResponse as ErrorResponse;
      return pipelineData.data;
    }

    pipelineData.data.robots = robotsResponse as RobotsResponse;

    // scrape metadata & html - can we do this in parallel?
    // metadata checks if url is allowed to be scraped
    const metadataResponse = await this.metadataService.scrapeMetadata(
      pipelineData.data.url,
      pipelineData.data.robots
    );
    if ('errorStatus' in metadataResponse) {
      pipelineData.data.metadata = {
        title: null,
        description: null,
        keywords: null,
        ogTitle: null,
        ogDescription: null,
        ogImage: null,
      } as Metadata;
    } else {
      pipelineData.data.metadata = metadataResponse as Metadata;
    }

    // classify industry based on metadata and domain name
    const industryClassificationPromise =
      this.industryClassificationService.classifyIndustry(
        pipelineData.data.url,
        pipelineData.data.metadata
      );

    // scrape logo
    const logoPromise = this.scrapeLogoService.scrapeLogo(
      pipelineData.data.url,
      pipelineData.data.metadata,
      pipelineData.data.robots
    );

    // scrape images - doesn't use metadata -- need to check if scraping images is allowed
    const imagesPromise = this.scrapeImagesService.scrapeImages(
      pipelineData.data.url,
      pipelineData.data.robots
    );
    const contactInfoPromise = this.scrapeContactInfoService.scrapeContactInfo(
      pipelineData.data.url,
      pipelineData.data.robots
    );
    const addressPromise = this.scrapeAddressService.scrapeAddress(
      pipelineData.data.url,
      pipelineData.data.robots
    );

    // get screenshot
    const screenshotPromise = this.getScreenshot(pipelineData.data.url);
    const seoAnalysisPromise = this.seoAnalysisService.seoAnalysis(pipelineData.data.url, pipelineData.data.robots);
    const [
      industryClassification,
      logo,
      images,
      contactInfo,
      addresses,
      screenshot,
      seoAnalysis,
    ] = await Promise.all([
      industryClassificationPromise,
      logoPromise,
      imagesPromise,
      contactInfoPromise,
      addressPromise,
      screenshotPromise,
      seoAnalysisPromise,
    ]);
    pipelineData.data.industryClassification = industryClassification;
    pipelineData.data.logo = logo;
    pipelineData.data.images = images;
    pipelineData.data.contactInfo = contactInfo;
    pipelineData.data.addresses = addresses.addresses;
    
    if ('errorStatus' in screenshot) {
      pipelineData.data.screenshot = ''; // Handle error case appropriately
    } else {
      pipelineData.data.screenshot = (screenshot as { screenshot: string }).screenshot; // Assign the screenshot URL
    }

    pipelineData.data.seoAnalysis = seoAnalysis;
    

    const end = performance.now();
    const time = (end - start) / 1000;
    pipelineData.data.time = parseFloat(time.toFixed(4));

    // set the data in the cache
    await this.cacheManager.set(url, JSON.stringify(pipelineData.data));
    return pipelineData.data;
  }

  async readRobotsFile(url: string) {
    return this.robotsService.readRobotsFile(url);
  }

  async scrapeMetadata(url: string) {
    const robotsResponse = await this.robotsService.readRobotsFile(url);
    if ('errorStatus' in robotsResponse) {
      return robotsResponse;
    }

    return this.metadataService.scrapeMetadata(
      robotsResponse.baseUrl,
      robotsResponse as RobotsResponse
    );
  }

  async scrapeStatus(url: string) {
    return this.scrapeStatusService.scrapeStatus(url);
  }

  async classifyIndustry(url: string) {
    const metadataResponse = await this.scrapeMetadata(url);
    if ('errorStatus' in metadataResponse) {
      return metadataResponse;
    }
    return this.industryClassificationService.classifyIndustry(
      url,
      metadataResponse
    );
  }

  async scrapeLogo(url: string) {
    const robotsResponse = await this.robotsService.readRobotsFile(url);
    if ('errorStatus' in robotsResponse) {
      return robotsResponse;
    }
    const metadataResponse = await this.metadataService.scrapeMetadata(
      robotsResponse.baseUrl,
      robotsResponse as RobotsResponse
    );
    if ('errorStatus' in metadataResponse) {
      return metadataResponse;
    }
    return this.scrapeLogoService.scrapeLogo(
      url,
      metadataResponse,
      robotsResponse
    );
  }

  async scrapeImages(url: string) {
    const robotsResponse = await this.robotsService.readRobotsFile(url);
    if ('errorStatus' in robotsResponse) {
      return robotsResponse;
    }
    const metadataResponse = await this.metadataService.scrapeMetadata(
      robotsResponse.baseUrl,
      robotsResponse as RobotsResponse
    );
    if ('errorStatus' in metadataResponse) {
      return metadataResponse;
    }
    return this.scrapeImagesService.scrapeImages(url, robotsResponse);
  }
  //get screenshot of the homepage
  async getScreenshot(url: string) {
    const robotsResponse = await this.robotsService.readRobotsFile(url);
    if ('errorStatus' in robotsResponse) {
      return robotsResponse;
    }
    return this.screenshotService.captureScreenshot(url, robotsResponse);
  }
  async scrapeContactInfo(url: string) {
    const robotsResponse = await this.robotsService.readRobotsFile(url);
    if ('errorStatus' in robotsResponse) {
      return robotsResponse;
    }

    return this.scrapeContactInfoService.scrapeContactInfo(
      url,
      robotsResponse as RobotsResponse
    );
  }
  async scrapeAddress(url: string) {
    const robotsResponse = await this.robotsService.readRobotsFile(url);
    if ('errorStatus' in robotsResponse) {
      return robotsResponse;
    }
    return this.scrapeAddressService.scrapeAddress(
      url,
      robotsResponse as RobotsResponse
    );
  }
  async seoAnalysis(url: string) {
    const htmlContent = await this.seoAnalysisService.fetchHtmlContent(url);
    const [metaDescriptionAnalysis,titleTagsAnalysis,headingAnalysis,imageAnalysis,uniqueContentAnalysis
      ,internalLinksAnalysis,siteSpeedAnalysis, mobileFriendlinessAnalysis,structuredDataAnalysis,
      indexabilityAnalysis,XMLSitemapAnalysis,canonicalTagAnalysis,lighthouseAnalysis,
    ] = await Promise.all([
      this.seoAnalysisService.analyzeMetaDescription(htmlContent,url),
      this.seoAnalysisService.analyzeTitleTag(htmlContent),
      this.seoAnalysisService.analyzeHeadings(htmlContent),
      this.seoAnalysisService.analyzeImageOptimization(url),
      this.seoAnalysisService.analyzeContentQuality(htmlContent),
      this.seoAnalysisService.analyzeInternalLinks(htmlContent),
      this.seoAnalysisService.analyzeSiteSpeed(url),
      this.seoAnalysisService.analyzeMobileFriendliness(url),
      this.seoAnalysisService.analyzeStructuredData(htmlContent),
      this.seoAnalysisService.analyzeIndexability(htmlContent),
      this.seoAnalysisService.analyzeXmlSitemap(url),
      this.seoAnalysisService.analyzeCanonicalTags(htmlContent),
      this.seoAnalysisService.runLighthouse(url),
    ]);
  
    return {
      titleTagsAnalysis,
      metaDescriptionAnalysis,
      headingAnalysis,
      imageAnalysis,
      uniqueContentAnalysis,
      internalLinksAnalysis,
      siteSpeedAnalysis,
      mobileFriendlinessAnalysis,
      structuredDataAnalysis,
      indexabilityAnalysis,
      XMLSitemapAnalysis,
      canonicalTagAnalysis,
      lighthouseAnalysis,      
   };
  }
}

