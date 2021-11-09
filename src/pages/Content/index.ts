import { computeScheduleStats } from './modules/schedule';

const WAIT_DELAY = 250;

function waitForContent(selector: string, cb: (element: Element) => void) {
  const el = document.querySelector(selector);

  if (el) {
    setTimeout(() => cb(el), 2000);
  } else {
    setTimeout(() => waitForContent(selector, cb), WAIT_DELAY);
  }
}


waitForContent('.page-container .tabs__nav', computeScheduleStats)