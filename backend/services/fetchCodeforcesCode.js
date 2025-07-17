const puppeteer = require('puppeteer');

/**
 * Fetches the code from a Codeforces submission page using Puppeteer.
 * @param {string} submissionUrl - The full URL to the Codeforces submission.
 * @param {string} [username] - Optional Codeforces username for login (for private submissions).
 * @param {string} [password] - Optional Codeforces password for login (for private submissions).
 * @returns {Promise<string>} - The code as a string.
 */
async function fetchCodeforcesCode(submissionUrl, username, password) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    // Optional login for private submissions
    if (username && password) {
      await page.goto('https://codeforces.com/enter');
      await page.type('#handleOrEmail', username);
      await page.type('#password', password);
      await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
      ]);
    }

    // Go to the submission page
    await page.goto(submissionUrl, { waitUntil: 'networkidle2' });

    // Extract code from the .program-source element
    const code = await page.$eval('.program-source', el => el.innerText);
    return code;
  } catch (err) {
    throw new Error('Failed to fetch code: ' + err.message);
  } finally {
    await browser.close();
  }
}

module.exports = fetchCodeforcesCode;
