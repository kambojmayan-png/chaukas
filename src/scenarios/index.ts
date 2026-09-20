import { isScenario, validate, type Scenario } from '@/engine/engine';
import olx from './olx-qr.json';
import bijli from './bijli-remote.json';
import arrest from './digital-arrest.json';

const RAW: unknown[] = [olx, bijli, arrest];
export const SCENARIOS: Scenario[] = RAW.filter((s): s is Scenario => {
  const ok = isScenario(s);
  if (!ok) console.error('[scenarios] rejected', (s as { id?: string })?.id, validate(s as Scenario).slice(0, 3));
  return ok;
});
if (process.env.NODE_ENV !== 'production' && SCENARIOS.length !== RAW.length) {
  throw new Error('A scenario failed validation. Run npm test for details.');
}
export const byId = (id: string) => SCENARIOS.find(s => s.id === id);
export const PRACTICE_PIN = '4827';
export const WALLET_START = 60000;

