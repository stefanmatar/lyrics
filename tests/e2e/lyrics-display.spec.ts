import { expect, test } from '@playwright/test';
import { LyricsDisplayPage } from './pages/LyricsDisplayPage';
import {
  allAudienceEnabled,
  audienceHiddenSlides,
  audienceHiddenStates,
  emptySlideSequence,
  firstRenderSlides,
  stableLyricsSlides,
  temporaryFailureAudience,
  temporaryFailureSlides
} from './support/test-data';

test('only updates when the visible lyric output changes', async ({ page }) => {
  const lyricsPage = new LyricsDisplayPage(page);
  await lyricsPage.installEventRecorder();
  await lyricsPage.mockStableResponses(stableLyricsSlides, allAudienceEnabled);

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
  await lyricsPage.mockStableResponses(emptySlideSequence, [true, true, true, true]);

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
  await lyricsPage.mockStableResponses(firstRenderSlides, [true, true]);

  await lyricsPage.goto();

  await expect(lyricsPage.lyricsText()).toHaveText('Line one\nLine two');
  await expect.poll(() => lyricsPage.getDistinctTexts()).toEqual(['', 'Line one\nLine two']);
});

test('hides lyrics when audience screens are disabled', async ({ page }) => {
  const lyricsPage = new LyricsDisplayPage(page);
  await lyricsPage.installEventRecorder();
  await lyricsPage.mockStableResponses(audienceHiddenSlides, audienceHiddenStates);

  await lyricsPage.goto();

  await expect(lyricsPage.lyricsText()).toHaveText('Visible line\nsecond line');
  await expect.poll(() => lyricsPage.getAudienceRequestCount()).toBeGreaterThanOrEqual(3);
  await expect(lyricsPage.lyricsText()).toHaveText('');
  await expect.poll(() => lyricsPage.getDistinctTexts()).toEqual(['', 'Visible line\nsecond line', '']);
});

test('keeps current lyrics visible during temporary API failures', async ({ page }) => {
  const lyricsPage = new LyricsDisplayPage(page);
  await lyricsPage.installEventRecorder();
  await lyricsPage.mockApiSequence(temporaryFailureSlides, temporaryFailureAudience);

  await lyricsPage.goto();

  await expect(lyricsPage.lyricsText()).toHaveText('Hold to your hope\nsteady light');
  await expect.poll(() => lyricsPage.getSlideRequestCount()).toBeGreaterThanOrEqual(5);
  await expect.poll(() => lyricsPage.getAudienceRequestCount()).toBeGreaterThanOrEqual(5);
  await expect(lyricsPage.lyricsText()).toHaveText('Future grace\nfinal line');
  await expect.poll(() => lyricsPage.getDistinctTexts()).toEqual(['', 'Hold to your hope\nsteady light', 'Future grace\nfinal line']);
});
