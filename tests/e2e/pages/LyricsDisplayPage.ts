import type { Page, Route } from '@playwright/test';

type JsonResponse = Record<string, unknown> | boolean;
type FulfillResponse = {
  fulfill: {
    status: number;
    contentType: string;
    body: string;
  };
};

type ApiResponse = JsonResponse | FulfillResponse;

export class LyricsDisplayPage {
  private slideRequestCount = 0;
  private audienceRequestCount = 0;

  constructor(private readonly page: Page) {}

  async installEventRecorder() {
    await this.page.addInitScript(() => {
      (window as Window & { __textEvents?: Array<{ type: string; text: string }> }).__textEvents = [];

      window.addEventListener('load', () => {
        const text = document.getElementById('lyrics-text');
        if (!text) return;

        const store = (window as Window & { __textEvents: Array<{ type: string; text: string }> }).__textEvents;
        const record = (type: string) => {
          store.push({ type, text: text.textContent ?? '' });
        };

        record('initial');
        const observer = new MutationObserver(() => record('mutation'));
        observer.observe(text, { childList: true, characterData: true, subtree: true });
      });
    });
  }

  async mockStableResponses(slides: JsonResponse[], audienceStates: JsonResponse[]) {
    this.slideRequestCount = 0;
    this.audienceRequestCount = 0;
    await this.page.unroute('**/api/status/slide');
    await this.page.unroute('**/api/status/audience_screens');

    await this.page.route('**/api/status/slide', async (route) => {
      const response = slides[Math.min(this.slideRequestCount, slides.length - 1)];
      this.slideRequestCount += 1;
      await this.fulfillJson(route, response);
    });

    await this.page.route('**/api/status/audience_screens', async (route) => {
      const response = audienceStates[Math.min(this.audienceRequestCount, audienceStates.length - 1)];
      this.audienceRequestCount += 1;
      await this.fulfillJson(route, response);
    });
  }

  async mockApiSequence(slideResponses: ApiResponse[], audienceResponses: ApiResponse[]) {
    this.slideRequestCount = 0;
    this.audienceRequestCount = 0;
    await this.page.unroute('**/api/status/slide');
    await this.page.unroute('**/api/status/audience_screens');

    await this.page.route('**/api/status/slide', async (route) => {
      const response = slideResponses[Math.min(this.slideRequestCount, slideResponses.length - 1)];
      this.slideRequestCount += 1;
      await this.fulfill(route, response);
    });

    await this.page.route('**/api/status/audience_screens', async (route) => {
      const response = audienceResponses[Math.min(this.audienceRequestCount, audienceResponses.length - 1)];
      this.audienceRequestCount += 1;
      await this.fulfill(route, response);
    });
  }

  async goto() {
    await this.page.goto('/');
  }

  lyricsText() {
    return this.page.locator('#lyrics-text');
  }

  getSlideRequestCount() {
    return this.slideRequestCount;
  }

  getAudienceRequestCount() {
    return this.audienceRequestCount;
  }

  async getDistinctTexts() {
    return this.page.evaluate(() => {
      const events = (window as Window & { __textEvents?: Array<{ type: string; text: string }> }).__textEvents ?? [];
      return events.map((event) => event.text).filter((text, index, all) => index === 0 || text !== all[index - 1]);
    });
  }

  private async fulfill(route: Route, response: ApiResponse) {
    if (this.isFulfillResponse(response)) {
      await route.fulfill(response.fulfill);
      return;
    }

    await this.fulfillJson(route, response);
  }

  private async fulfillJson(route: Route, response: JsonResponse) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  }

  private isFulfillResponse(response: ApiResponse): response is FulfillResponse {
    return typeof response === 'object' && response !== null && 'fulfill' in response;
  }
}
