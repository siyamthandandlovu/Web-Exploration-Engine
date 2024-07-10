import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProxyService {
  private proxies: string[] = [];

  constructor() {
    this.getProxies();
  }

  async getProxies() {
    const response = await axios.get('https://api.proxyscrape.com/?request=displayproxies&https=true');
    this.proxies = response.data.split('\n');
  }

  getRandomProxy() {
    const randomIndex = Math.floor(Math.random() * this.proxies.length);
    console.log(this.proxies[randomIndex]);
    return this.proxies[randomIndex];
  }
}

