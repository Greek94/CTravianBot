const { Builder, By, Key, until } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const credentials = require('./credentials');

async function login() {
  // Iterate over the credentials array and log in each user
  for (let i = 0; i < credentials.length; i++) {
    const { name, password, proxyHost, proxyPort, proxyUser, proxyPass, url, villageId } = credentials[i];

    // Set up Chrome options with proxy if credentials are provided
    let chromeOptions = new Options();
    if (proxyHost && proxyPort && proxyUser && proxyPass) {
      chromeOptions.addArguments(`--proxy-server=http://${proxyUser}:${proxyPass}@${proxyHost}:${proxyPort}`);
    }

    // Launch Chrome browser with options
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();

    try {
      // Maximize Chrome window
      await driver.manage().window().maximize();

      // Navigate to website
      await driver.get(url);

      // Wait for page to load
      await driver.wait(until.elementLocated(By.name('name')), 10000);

      // Find username and password fields and enter credentials
      await driver.findElement(By.name('name')).sendKeys(name);
      await driver.findElement(By.name('password')).sendKeys(password);

      // Click login button
      await driver.findElement(By.css('button[version="textButtonV1"]')).click();

      // Wait for 3 seconds
      await driver.sleep(3000);

      // Navigate to the Resource Field Page
      await driver.get(`${url}/dorf1.php?newdid=${villageId}`);

      // Wait for 1 second
      await new Promise(resolve => setTimeout(resolve, 3000));


      // Wait for the upgradeable building slot to become visible
      let element = await driver.wait(until.elementsLocated(By.css('div.level.colorLayer.good')));

      // Click on the upgradeable building slot
      await element.click();
      // Click upgrade button for each building
      await driver.findElement(By.xpath('//div/button[@class="textButtonV1 green build"]')).click();
      await driver.sleep(1000);
      let upgradeBtn = await driver.wait(until.elementLocated(By.xpath("//div[@class='buildDuration']/span/a")));
      await driver.wait(until.elementIsEnabled(upgradeBtn));
      await upgradeBtn.click();
      // Wait for 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));


      while (true) {
        try {
          // Find all upgradeable building slots
          let slots = await driver.wait(until.elementsLocated(By.css('div.level.colorLayer.good')));

          if (slots.length === 0) {
            // No more upgradable building slots, exit the loop
            break;
          }
          // Click upgrade button for each building
          for (let i = 0; i < slots.length; i++) {
            await slots[i].click();
            // Wait for 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Wait until the element is located in the DOM
            let element = await driver.wait(until.elementLocated(By.xpath('//div/button[@class="textButtonV1 green build"]')));
            // Click the element
            await element.click();

            // Wait for 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));
            let upgradeBtn = await driver.wait(until.elementLocated(By.xpath("//div[@class='buildDuration']/span/a")));
            await driver.wait(until.elementIsEnabled(upgradeBtn));
            await upgradeBtn.click();
            // Wait for 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));

          }
        } catch (err) {
          console.error(err);
        }
      }


    } catch (error) {
      console.error(`Error occurred while logging in with credentials ${JSON.stringify(credentials[i])}: ${error}`);
    } finally {
      // Close the browser window
      //await driver.quit();
    }
  }
}

login();
