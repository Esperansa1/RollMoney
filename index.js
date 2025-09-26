import { MarketItemScraper } from './src/market-scraper.js';

(function() {
    'use strict';
    console.log(`
MM    MM  OOOOO  NN   NN EEEEEEE YY   YY 
MMM  MMM OO   OO NNN  NN EE      YY   YY 
MM MM MM OO   OO NN N NN EEEEE    YYYYY  
MM    MM OO   OO NN  NNN EE        YYY   
MM    MM  OOOO0  NN   NN EEEEEEE   YYY   
                                         
MM    MM   AAA   KK  KK EEEEEEE RRRRRR   
MMM  MMM  AAAAA  KK KK  EE      RR   RR  
MM MM MM AA   AA KKKK   EEEEE   RRRRRR   
MM    MM AAAAAAA KK KK  EE      RR  RR   
MM    MM AA   AA KK  KK EEEEEEE RR   RR  
                                         
`)

    window.MarketItemScraper = new MarketItemScraper();
})();