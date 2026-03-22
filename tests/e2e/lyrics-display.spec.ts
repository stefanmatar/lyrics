import { expect, test } from '@playwright/test';
import { LyricsDisplayPage } from './pages/LyricsDisplayPage';

test('only updates when the visible lyric output changes', async ({ page }) => {
  const lyricsPage = new LyricsDisplayPage(page);
  await lyricsPage.installEventRecorder();
  await lyricsPage.mockStableResponses(
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

  await lyricsPage.goto();

  await expect(lyricsPage.lyricsText()).toHaveText('Amazing grace\nhow sweet');
  await expect.poll(() => lyricsPage.getSlideRequestCount()).toBeGreaterThanOrEqual(5);
  await expect.poll(() => lyricsPage.getAudienceRequestCount()).toBeGreaterThanOrEqual(5);
  await expect(lyricsPage.lyricsText()).toHaveText('New song\nfirst line');
  await expect.poll(() => lyricsPage.getDistinctTexts()).toEqual(['', 'Amazing grace\nhow sweet', 'New song\nfirst line']);
});

test('clears the display only after a confirmed empty slide response', async ({ page }) => {
  const lyricsPage = new LyricsDisplayPage(page);
  await lyricsPage.installEventRecorder();
  await lyricsPage.mockStableResponses(
    [
      { current: { text: 'Still my soul\nremain' } },
      { current: { text: '' } },
      { current: { text: '' } },
      { current: { text: '' } }
    ],
    [true, true, true, true]
  );

  await lyricsPage.goto();

  await expect(lyricsPage.lyricsText()).toHaveText('Still my soul\nremain');
  await expect.poll(() => lyricsPage.getSlideRequestCount()).toBeGreaterThanOrEqual(2);
  await expect(lyricsPage.lyricsText()).toHaveText('Still my soul\nremain');
  await expect.poll(() => lyricsPage.getDistinctTexts()).toEqual(['', 'Still my soul\nremain']);

  await expect.poll(() => lyricsPage.getSlideRequestCount()).toBeGreaterThanOrEqual(3);
  await expect(lyricsPage.lyricsText()).toHaveText('');
  await expect.poll(() => lyricsPage.getDistinctTexts()).toEqual(['', 'Still my soul\nremain', '']);
});

test('renders the first slide immediately on first successful fetch', async ({ page }) => {
  const lyricsPage = new LyricsDisplayPage(page);
  await lyricsPage.installEventRecorder();
  await lyricsPage.mockStableResponses(
    [
      { current: { text: 'Line one\nLine two\nLine three' } },
      { current: { text: 'Line one\nLine two\nLine three' } }
    ],
    [true, true]
  );

  await lyricsPage.goto();

  await expect(lyricsPage.lyricsText()).toHaveText('Line one\nLine two');
  await expect.poll(() => lyricsPage.getDistinctTexts()).toEqual(['', 'Line one\nLine two']);
});

test('hides lyrics when audience screens are disabled', async ({ page }) => {
  const lyricsPage = new LyricsDisplayPage(page);
  await lyricsPage.installEventRecorder();
  await lyricsPage.mockStableResponses(
    [
      { current: { text: 'Visible line\nsecond line' } },
      { current: { text: 'Visible line\nsecond line' } },
      { current: { text: 'Visible line\nsecond line' } },
      { current: { text: 'Visible line\nsecond line' } }
    ],
    [true, false, false, false]
  );

  await lyricsPage.goto();

  await expect(lyricsPage.lyricsText()).toHaveText('Visible line\nsecond line');
  await expect.poll(() => lyricsPage.getAudienceRequestCount()).toBeGreaterThanOrEqual(3);
  await expect(lyricsPage.lyricsText()).toHaveText('');
  await expect.poll(() => lyricsPage.getDistinctTexts()).toEqual(['', 'Visible line\nsecond line', '']);
});

test('keeps current lyrics visible during temporary API failures', async ({ page }) => {
  const lyricsPage = new LyricsDisplayPage(page);
  await lyricsPage.installEventRecorder();
  await lyricsPage.mockApiSequence(
    [
      { current: { text: 'Hold to your hope\nsteady light' } },
      { fulfill: { status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'temporary slide failure' }) } },
      { current: { text: 'Hold to your hope\nsteady light' } },
      { current: { text: 'Future grace\nfinal line' } },
      { current: { text: 'Future grace\nfinal line' } }
    ],
    [
      true,
      { fulfill: { status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'temporary audience failure' }) } },
      true,
      true,
      true
    ]
  );

  await lyricsPage.goto();

  await expect(lyricsPage.lyricsText()).toHaveText('Hold to your hope\nsteady light');
  await expect.poll(() => lyricsPage.getSlideRequestCount()).toBeGreaterThanOrEqual(5);
  await expect.poll(() => lyricsPage.getAudienceRequestCount()).toBeGreaterThanOrEqual(5);
  await expect(lyricsPage.lyricsText()).toHaveText('Future grace\nfinal line');
  await expect.poll(() => lyricsPage.getDistinctTexts()).toEqual(['', 'Hold to your hope\nsteady light', 'Future grace\nfinal line']);
});
