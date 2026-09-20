import type { Scenario } from '@/engine/engine';
import olx from './olx-qr.json';
import bijli from './bijli-remote.json';
import arrest from './digital-arrest.json';
export const SCENARIOS = [olx, bijli, arrest] as unknown as Scenario[];
export const byId = (id: string) => SCENARIOS.find(s => s.id === id);
export const PRACTICE_PIN = '4827';
export const WALLET_START = 60000;
