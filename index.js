// ==UserScript==
// @name         Market Item Scraper
// @namespace    https://github.com/Esperansa1/RollMoney
// @version      1.0.0
// @description  Automated market item scraper with filtering and withdrawal functionality
// @author       MakeMoney
// @match        *://*/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Esperansa1/RollMoney/dev/dist/index.bundle.js
// @downloadURL  https://raw.githubusercontent.com/Esperansa1/RollMoney/dev/dist/index.bundle.js
// ==/UserScript==

import { MarketItemScraper } from './src/market-scraper.js';

(function() {
    'use strict';
    console.log(`
__       __   ______   __    __  ________  __      __        __       __   ______   __    __  ________  _______
|  \     /  \ /      \ |  \  |  \|        \|  \    /  \      |  \     /  \ /      \ |  \  /  \|        \|       \
| $$\   /  $$|  $$$$$$\| $$\ | $$| $$$$$$$$ \$$\  /  $$      | $$\   /  $$|  $$$$$$\| $$ /  $$| $$$$$$$$| $$$$$$$\
| $$$\ /  $$$| $$  | $$| $$$\| $$| $$__      \$$\/  $$       | $$$\ /  $$$| $$__| $$| $$/  $$ | $$__    | $$__| $$
| $$$$\  $$$$| $$  | $$| $$$$\ $$| $$  \      \$$  $$        | $$$$\  $$$$| $$    $$| $$  $$  | $$  \   | $$    $$
| $$\$$ $$ $$| $$  | $$| $$\$$ $$| $$$$$       \$$$$         | $$\$$ $$ $$| $$$$$$$$| $$$$$\  | $$$$$   | $$$$$$$\
| $$ \$$$| $$| $$__/ $$| $$ \$$$$| $$_____     | $$          | $$ \$$$| $$| $$  | $$| $$ \$$\ | $$_____ | $$  | $$
| $$  \$ | $$ \$$    $$| $$  \$$$| $$     \    | $$          | $$  \$ | $$| $$  | $$| $$  \$$\| $$     \| $$  | $$
 \$$      \$$  \$$$$$$  \$$   \$$ \$$$$$$$$     \$$           \$$      \$$ \$$   \$$ \$$   \$$ \$$$$$$$$ \$$   \$$
`)

    window.MarketItemScraper = new MarketItemScraper();
})();