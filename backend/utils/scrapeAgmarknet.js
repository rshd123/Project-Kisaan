// utils/scrapeAgmarknetPrices.js
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import chromedriver from 'chromedriver';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Waits for a dropdown to load at least a minimum number of options.
 */
async function waitForMinOptions(driver, by, minCount = 2, timeout = 10000) {
  await driver.wait(async () => {
    try {
      const element = await driver.findElement(by);
      const options = await element.findElements(By.tagName('option'));
      return options.length >= minCount;
    } catch (err) {
      return false;
    }
  }, timeout);
}

/**
 * Selects an option by visible text with better error handling.
 */
async function selectByVisibleText(driver, selectLocator, visibleText) {
  try {
    const selectElem = await driver.wait(
      until.elementIsEnabled(await driver.findElement(selectLocator)),
      10000
    );

    const options = await selectElem.findElements(By.tagName('option'));

    for (let option of options) {
      const text = await option.getText();
      if (text.trim() === visibleText.trim()) {
        await option.click();
        await driver.sleep(1000);
        return;
      }
    }

    throw new Error(`Option "${visibleText}" not found in dropdown`);
  } catch (error) {
    throw new Error(`Failed to select "${visibleText}": ${error.message}`);
  }
}

async function scrapeAgmarknetPrices(state, market, commodity) {
  let driver;
  
  try {
    // Set up Chrome options for Windows
    const options = new chrome.Options();
    options.addArguments(
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--window-size=1920,1080'
    );

    // Try to set up service with explicit chromedriver path for Windows
    let service;
    try {
      service = new chrome.ServiceBuilder(chromedriver.path);
    } catch (chromedriverError) {
      console.log('Using system chromedriver instead of package chromedriver');
      // Fallback to system chromedriver
      service = new chrome.ServiceBuilder();
    }
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();

    try {
      await driver.get('https://agmarknet.gov.in/PriceAndArrivals/CommodityPricesWeeklyReport.aspx');

      await driver.wait(until.elementLocated(By.id('cphBody_cboState')), 15000);

      await selectByVisibleText(driver, By.id('cphBody_cboState'), state);
      await waitForMinOptions(driver, By.id('cphBody_cboMarket'), 2, 15000);

      await selectByVisibleText(driver, By.id('cphBody_cboMarket'), market);
      await waitForMinOptions(driver, By.id('cphBody_cboCommodity'), 2, 15000);

      await selectByVisibleText(driver, By.id('cphBody_cboCommodity'), commodity);

      await driver.sleep(1000);

      const submitBtn = await driver.wait(
        until.elementIsEnabled(await driver.findElement(By.id('cphBody_btnSubmit'))),
        10000
      );
      await submitBtn.click();

      const table = await driver.wait(until.elementLocated(By.id('cphBody_gridRecords')), 20000);
      await driver.sleep(2000);

      const rows = await table.findElements(By.tagName('tr'));

      if (rows.length <= 1) {
        return { error: 'No data found for the selected options.' };
      }

      const headers = await rows[0].findElements(By.tagName('td'));
      const headerTexts = await Promise.all(headers.map((header) => header.getText()));

      const data = [];
      for (let i = 1; i < rows.length; i++) {
        const cols = await rows[i].findElements(By.tagName('td'));
        const rowData = await Promise.all(cols.map((col) => col.getText()));
        data.push(rowData);
      }

      return {
        headers: headerTexts,
        rows: data
      };
    } catch (error) {
      console.error('[Scraping Error]', error);
      return { error: `Scraping failed: ${error.message}` };
    } finally {
      if (driver) {
        await driver.quit();
      }
    }
  } catch (setupError) {
    console.error('[Driver Setup Error]', setupError);
    return { error: `Driver setup failed: ${setupError.message}` };
  }
}

export default scrapeAgmarknetPrices;
