import { errorJson, okJson } from './lyrics-api';

export const stableLyricsSlides = [
  okJson({ current: { text: 'Amazing grace\nhow sweet' } }),
  okJson({ current: { text: '  Amazing grace \r\n how sweet  ' } }),
  okJson({ current: { text: 'Amazing grace\nhow sweet' } }),
  okJson({ current: { text: 'New song\nfirst line' } }),
  okJson({ current: { text: 'New song\nfirst line' } }),
  okJson({ current: { text: 'New song\nfirst line' } })
];

export const allAudienceEnabled = [true, true, true, true, true, true];

export const emptySlideSequence = [
  okJson({ current: { text: 'Still my soul\nremain' } }),
  okJson({ current: { text: '' } }),
  okJson({ current: { text: '' } }),
  okJson({ current: { text: '' } })
];

export const firstRenderSlides = [
  okJson({ current: { text: 'Line one\nLine two\nLine three' } }),
  okJson({ current: { text: 'Line one\nLine two\nLine three' } })
];

export const audienceHiddenSlides = [
  okJson({ current: { text: 'Visible line\nsecond line' } }),
  okJson({ current: { text: 'Visible line\nsecond line' } }),
  okJson({ current: { text: 'Visible line\nsecond line' } }),
  okJson({ current: { text: 'Visible line\nsecond line' } })
];

export const audienceHiddenStates = [true, false, false, false];

export const temporaryFailureSlides = [
  okJson({ current: { text: 'Hold to your hope\nsteady light' } }),
  errorJson(500, { error: 'temporary slide failure' }),
  okJson({ current: { text: 'Hold to your hope\nsteady light' } }),
  okJson({ current: { text: 'Future grace\nfinal line' } }),
  okJson({ current: { text: 'Future grace\nfinal line' } })
];

export const temporaryFailureAudience = [
  true,
  errorJson(503, { error: 'temporary audience failure' }),
  true,
  true,
  true
];
