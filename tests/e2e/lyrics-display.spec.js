const { test, expect } = require('@playwright/test');

async function installEventRecorder(page) {
  await page.addInitScript(() => {
    window.__textEvents = [];

    window.addEventListener('load', () => {
      const text = document.getElementById('lyrics-text');
      if (!text) return;

      const record = (type) => {
        window.__textEvents.push({
          type,
          text: text.textContent
        });
      };

      record('initial');
      const observer = new MutationObserver(() => record('mutation'));
      observer.observe(text, { childList: true, characterData: true, subtree: true });
    });
  });
}

async function mockSlides(page, slides, audienceStates) {
  let slideRequestCount = 0;
  let audienceRequestCount = 0;

  await page.route('**/api/status/slide', async (route) => {
    const response = slides[Math.min(slideRequestCount, slides.length - 1)];
    slideRequestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });

  await page.route('**/api/status/audience_screens', async (route) => {
    const response = audienceStates[Math.min(audienceRequestCount, audienceStates.length - 1)];
    audienceRequestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });

  return {
    getSlideRequestCount: () => slideRequestCount,
    getAudienceRequestCount: () => audienceRequestCount
  };
}

function getDistinctTexts(page) {
  return page.evaluate(() => {
    return window.__textEvents
      .map((event) => event.text)
      .filter((text, index, all) => index === 0 || text !== all[index - 1]);
  });
}

test('only animates when the visible lyric output changes', async ({ page }) => {
  await installEventRecorder(page);

  const counts = await mockSlides(
    page,
    [
      { current: { text: 'Amazing grace\nhow sweet' } },
      { current: { text: '  Amazing grace \r\n how sweet  ' } },
      { current: { text: 'Amazing grace\nhow sweet' } },
      { current: { text: 'New song\nfirst line' } },
      { current: { text: 'New song\nfirst line' } },
      { current: { text: 'New song\nfirst line' } }
    ],
    [true, true, true, true, true, true]
  );

  await page.goto('/');

  await expect(page.locator('#lyrics-text')).toHaveText('Amazing grace\nhow sweet');
  await expect.poll(counts.getSlideRequestCount).toBeGreaterThanOrEqual(5);
  await expect.poll(counts.getAudienceRequestCount).toBeGreaterThanOrEqual(5);
  await expect(page.locator('#lyrics-text')).toHaveText('New song\nfirst line');
  await expect.poll(() => getDistinctTexts(page)).toEqual(['', 'Amazing grace\nhow sweet', 'New song\nfirst line']);
});

test('clears the display only after a confirmed empty slide response', async ({ page }) => {
  await installEventRecorder(page);

  const counts = await mockSlides(
    page,
    [
      { current: { text: 'Still my soul\nremain' } },
      { current: { text: '' } },
      { current: { text: '' } },
      { current: { text: '' } }
    ],
    [true, true, true, true]
  );

  await page.goto('/');

  await expect(page.locator('#lyrics-text')).toHaveText('Still my soul\nremain');
  await expect.poll(counts.getSlideRequestCount).toBeGreaterThanOrEqual(2);
  await expect(page.locator('#lyrics-text')).toHaveText('Still my soul\nremain');
  await expect.poll(() => getDistinctTexts(page)).toEqual(['', 'Still my soul\nremain']);

  await expect.poll(counts.getSlideRequestCount).toBeGreaterThanOrEqual(3);
  await expect(page.locator('#lyrics-text')).toHaveText('');
  await expect.poll(() => getDistinctTexts(page)).toEqual(['', 'Still my soul\nremain', '']);
});

test('renders the first slide immediately without an initial fade cycle', async ({ page }) => {
  await installEventRecorder(page);

  await mockSlides(
    page,
    [
      { current: { text: 'Line one\nLine two\nLine three' } },
      { current: { text: 'Line one\nLine two\nLine three' } }
    ],
    [true, true]
  );

  await page.goto('/');

  await expect(page.locator('#lyrics-text')).toHaveText('Line one\nLine two');

  await expect.poll(() => getDistinctTexts(page)).toEqual(['', 'Line one\nLine two']);
});

test('hides lyrics when audience screens are disabled', async ({ page }) => {
  await installEventRecorder(page);

  const counts = await mockSlides(
    page,
    [
      { current: { text: 'Visible line\nsecond line' } },
      { current: { text: 'Visible line\nsecond line' } },
      { current: { text: 'Visible line\nsecond line' } },
      { current: { text: 'Visible line\nsecond line' } }
    ],
    [true, false, false, false]
  );

  await page.goto('/');

  await expect(page.locator('#lyrics-text')).toHaveText('Visible line\nsecond line');
  await expect.poll(counts.getAudienceRequestCount).toBeGreaterThanOrEqual(3);
  await expect(page.locator('#lyrics-text')).toHaveText('');
  await expect.poll(() => getDistinctTexts(page)).toEqual(['', 'Visible line\nsecond line', '']);
});
