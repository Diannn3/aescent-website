import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ 
    viewport: { width: 1841, height: 923 },
    deviceScaleFactor: 2,
    colorScheme: 'dark'
  });
  
  console.log('Navigating to laguna-smiles-demo.vercel.app...');
  await page.goto('https://laguna-smiles-demo.vercel.app', { waitUntil: 'networkidle' });
  
  console.log('Forcing Dark Mode via classes and localStorage...');
  await page.evaluate(async () => {
    // Try forcing Tailwind dark mode explicitly
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('color-theme', 'dark');
    localStorage.setItem('mode', 'dark');
    await document.fonts.ready;
  });
  
  await page.waitForTimeout(6000); // Wait for GSAP animations and any transition
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'src/assets/aescent-smiles-preview.png' });
  
  await browser.close();
  console.log('Done!');
})();
