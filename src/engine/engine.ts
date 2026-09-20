// CHAUKAS drill engine — pure, framework-free, deterministic.
// The UI renders nodes; THIS file decides what happened. No AI in here.
// Privacy rule enforced by types: an input submit carries only its LENGTH, never the digits.

export type Lang = 'en' | 'hi';
export type L10n = { en: string; hi: string };
export type Surface = 'sms' | 'chat' | 'call' | 'videocall' | 'upi' | 'system';
export type RedFlag =
  | 'urgency' | 'fear' | 'authority' | 'secrecy' | 'too_good'
  | 'pin_to_receive' | 'otp_request' | 'remote_app' | 'unofficial_contact'
  | 'pay_to_verify' | 'screen_says_pay';
export type Risk = 'safe' | 'risky' | 'compromise';
export type ActionTag =
  | 'comply' | 'stall' | 'refuse' | 'hangup' | 'block_report' | 'verify_official'
  | 'tell_family' | 'call_1930' | 'scan_qr' | 'install_app' | 'call_unknown';

export interface Message { text: L10n; flags?: RedFlag[]; via?: Surface; speak?: boolean; delayMs?: number }
export interface Choice { id: string; label: L10n; next: string; risk: Risk; tag: ActionTag }
export interface InputTrap { kind: 'pin' | 'otp'; prompt: L10n; detail: L10n; flags?: RedFlag[]; onSubmit: string; onCancel: string }
export interface EndState { outcome: 'scammed' | 'escaped'; lossInr: number; headline: L10n; lateHeadline?: L10n }
export interface ScenarioNode {
  id: string; surface: Surface; from?: string;
  messages?: Message[]; choices?: Choice[]; input?: InputTrap;
  timerSec?: number; timeoutNext?: string; end?: EndState;
}
export interface Scenario {
  id: string; title: L10n; archetype: string; setup: L10n; rule: L10n;
  precheck: { q: L10n; correct: 'yes' | 'no' };
  sources: { label: string; url: string }[];
  start: string; nodes: Record<string, ScenarioNode>;
}

export type Action =
  | { type: 'choose'; choiceId: string }
  | { type: 'input_submit'; len: number; hesitationMs: number } // digits never leave the component
  | { type: 'input_cancel' }
  | { type: 'timeout' };

export interface RunEvent {
  t: number; nodeId: string; kind: Action['type'];
  choiceId?: string; tag?: ActionTag | 'enter_pin' | 'share_otp'; risk: Risk; hesitationMs?: number;
}
export interface RunState { scenarioId: string; nodeId: string; startedAt: number; path: string[]; events: RunEvent[]; done: boolean }

export type Outcome = 'scammed' | 'escaped' | 'escaped_late';
export interface RunResult {
  scenarioId: string; outcome: Outcome; lossInr: number; behaviourScore: 0 | 0.5 | 1;
  durationMs: number; riskyActions: number; firstRiskAtMs: number | null; hesitationMs: number | null;
  flagsWalkedPast: RedFlag[]; flagsTotal: number; headline: L10n;
}

export function start(s: Scenario, now: number): RunState {
  return { scenarioId: s.id, nodeId: s.start, startedAt: now, path: [s.start], events: [], done: !!s.nodes[s.start].end };
}

export function step(s: Scenario, st: RunState, a: Action, now: number): RunState {
  if (st.done) throw new Error('run already finished');
  const node = s.nodes[st.nodeId];
  const t = now - st.startedAt;
  let next: string | undefined;
  let ev: RunEvent;
  if (a.type === 'choose') {
    const c = node.choices?.find(x => x.id === a.choiceId);
    if (!c) throw new Error(`no choice ${a.choiceId} on node ${node.id}`);
    next = c.next; ev = { t, nodeId: node.id, kind: 'choose', choiceId: c.id, tag: c.tag, risk: c.risk };
  } else if (a.type === 'input_submit') {
    if (!node.input) throw new Error(`node ${node.id} has no input`);
    next = node.input.onSubmit;
    ev = { t, nodeId: node.id, kind: 'input_submit', tag: node.input.kind === 'pin' ? 'enter_pin' : 'share_otp', risk: 'compromise', hesitationMs: a.hesitationMs };
  } else if (a.type === 'input_cancel') {
    if (!node.input) throw new Error(`node ${node.id} has no input`);
    next = node.input.onCancel; ev = { t, nodeId: node.id, kind: 'input_cancel', tag: 'refuse', risk: 'safe' };
  } else {
    if (!node.timeoutNext) throw new Error(`node ${node.id} has no timeout`);
    next = node.timeoutNext; ev = { t, nodeId: node.id, kind: 'timeout', tag: 'stall', risk: 'safe' };
  }
  if (!s.nodes[next]) throw new Error(`missing node ${next}`);
  return { ...st, nodeId: next, path: [...st.path, next], events: [...st.events, ev], done: !!s.nodes[next].end };
}

const flagsOf = (n: ScenarioNode): RedFlag[] => [...(n.messages ?? []).flatMap(m => m.flags ?? []), ...(n.input?.flags ?? [])];
export const allFlags = (s: Scenario): RedFlag[] => [...new Set(Object.values(s.nodes).flatMap(flagsOf))];

export function result(s: Scenario, st: RunState, now: number): RunResult {
  const endNode = s.nodes[st.nodeId];
  if (!endNode.end) throw new Error('run not finished');
  const risky = st.events.filter(e => e.risk !== 'safe');
  const outcome: Outcome = endNode.end.outcome === 'scammed' ? 'scammed' : risky.length ? 'escaped_late' : 'escaped';
  const hes = st.events.filter(e => e.hesitationMs != null).map(e => e.hesitationMs as number);
  return {
    scenarioId: s.id, outcome,
    lossInr: outcome === 'scammed' ? endNode.end.lossInr : 0,
    behaviourScore: outcome === 'escaped' ? 1 : outcome === 'escaped_late' ? 0.5 : 0,
    durationMs: now - st.startedAt, riskyActions: risky.length,
    firstRiskAtMs: risky.length ? risky[0].t : null,
    hesitationMs: hes.length ? Math.max(...hes) : null,
    flagsWalkedPast: [...new Set(st.path.flatMap(id => flagsOf(s.nodes[id])))],
    flagsTotal: allFlags(s).length,
    headline: outcome === 'escaped_late' && endNode.end.lateHeadline ? endNode.end.lateHeadline : endNode.end.headline,
  };
}

// The headline metric. knowledge/behaviour are 0..1 averages across drills; gap > 0 means "knew it, did it anyway".
export function knowledgeBehaviourGap(knew: boolean[], results: RunResult[]) {
  const k = knew.filter(Boolean).length / Math.max(1, knew.length);
  const b = results.reduce((a, r) => a + r.behaviourScore, 0) / Math.max(1, results.length);
  const knewButFell = results.filter((r, i) => knew[i] && r.outcome === 'scammed').length;
  return { knowledge: k, behaviour: b, gap: +(k - b).toFixed(2), knewButFell };
}

// ---- Scenario linter: run in CI so a broken graph can never ship. Returns [] when valid. ----
export function validate(s: Scenario): string[] {
  const err: string[] = []; const N = s.nodes;
  const l10n = (v: L10n | undefined, where: string) => { if (!v || !v.en?.trim() || !v.hi?.trim()) err.push(`${where}: missing en/hi text`); };
  if (!N[s.start]) err.push('start node missing');
  l10n(s.title, 'title'); l10n(s.setup, 'setup'); l10n(s.rule, 'rule'); l10n(s.precheck?.q, 'precheck.q');
  const edges = (n: ScenarioNode): string[] => [
    ...(n.choices ?? []).map(c => c.next), ...(n.input ? [n.input.onSubmit, n.input.onCancel] : []), ...(n.timeoutNext ? [n.timeoutNext] : []),
  ];
  for (const [key, n] of Object.entries(N)) {
    if (key !== n.id) err.push(`${key}: id mismatch`);
    for (const m of n.messages ?? []) l10n(m.text, `${key}.message`);
    for (const c of n.choices ?? []) l10n(c.label, `${key}.${c.id}`);
    if (n.input) { l10n(n.input.prompt, `${key}.input.prompt`); l10n(n.input.detail, `${key}.input.detail`); }
    if (n.end) { l10n(n.end.headline, `${key}.end`); if (edges(n).length) err.push(`${key}: end node has exits`);
      if (n.end.outcome === 'scammed' && !(n.end.lossInr > 0)) err.push(`${key}: scammed end needs lossInr>0`);
      if (n.end.outcome === 'escaped' && n.end.lossInr !== 0) err.push(`${key}: escaped end must have lossInr 0`);
    } else {
      if (!n.choices?.length && !n.input) err.push(`${key}: dead end (no choices/input)`);
      if (n.choices && (n.choices.length < 2 || n.choices.length > 4) && !n.input) err.push(`${key}: needs 2-4 choices`);
      if (new Set((n.choices ?? []).map(c => c.id)).size !== (n.choices ?? []).length) err.push(`${key}: duplicate choice ids`);
    }
    if (n.timerSec && !n.timeoutNext) err.push(`${key}: timer without timeoutNext`);
    for (const e of edges(n)) if (!N[e]) err.push(`${key}: points to missing node ${e}`);
  }
  if (err.length) return err;
  const reach = (from: string): Set<string> => { const seen = new Set<string>([from]); const q = [from];
    while (q.length) for (const e of edges(N[q.pop() as string])) if (!seen.has(e)) { seen.add(e); q.push(e); } return seen; };
  const all = reach(s.start);
  for (const k of Object.keys(N)) if (!all.has(k)) err.push(`${k}: unreachable`);
  const ends = (set: Set<string>, o: string) => [...set].some(id => N[id].end?.outcome === o);
  if (!ends(all, 'scammed')) err.push('no reachable scammed ending');
  if (!ends(all, 'escaped')) err.push('no reachable escaped ending');
  for (const id of all) if (!N[id].end && !ends(reach(id), 'escaped')) err.push(`${id}: player can get trapped (no safe exit)`);
  if (allFlags(s).length < 3) err.push('needs >=3 distinct red flags');
  return err;
}
