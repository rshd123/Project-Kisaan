// test-driver.js - Test Chrome driver setup
import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import chromedriver from 'chromedriver';

async function testChromeDriver() {
  let driver;
  
  try {
    console.log('Testing Chrome driver setup...');
    console.log('ChromeDriver path:', chromedriver.path);
    
    const options = new chrome.Options();
    options.addArguments(
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage'
    );

    let service;
    try {
      service = new chrome.ServiceBuilder(chromedriver.path);
      console.log('Using chromedriver from package');
    } catch (chromedriverError) {
      console.log('Using system chromedriver');
      service = new chrome.ServiceBuilder();
    }
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();

    console.log('✅ Chrome driver initialized successfully!');
    
    // Test basic navigation
    await driver.get('https://www.google.com');
    const title = await driver.getTitle();
    console.log('✅ Successfully navigated to Google. Title:', title);
    
    return true;
  } catch (error) {
    console.error('❌ Chrome driver test failed:', error.message);
    return false;
  } finally {
    if (driver) {
      await driver.quit();
      console.log('Driver closed');
    }
  }
}

testChromeDriver().then(success => {
  if (success) {
    console.log('🎉 Chrome driver is working correctly!');
  } else {
    console.log('💥 Chrome driver needs to be fixed');
  }
  process.exit(0);
});
