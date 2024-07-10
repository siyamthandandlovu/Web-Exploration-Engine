import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProxyService {
  private proxies: string[] = [];

  constructor() {
    this.getProxies();
  }

  async getProxies() {
    const response = await axios.get('https://api.proxyscrape.com/?request=displayproxies&country=za');
    this.proxies = response.data.split('\r\n');
  }

  getRandomProxy() {
    const randomIndex = Math.floor(Math.random() * this.proxies.length);
    console.log('Using proxy:', this.proxies[randomIndex]);
    return this.proxies[randomIndex];
  }
}

@Injectable()
export class ScraperService {
  constructor(private proxyService: ProxyService) {}

  async scrape(url: string) {
    const proxy = this.proxyService.getRandomProxy();
    const response = await axios.get(url, {
      proxy: {
        host: proxy.split(':')[0],
        port: parseInt(proxy.split(':')[1]),
      },
    });
    return response.data;
  }
}
