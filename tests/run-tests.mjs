// Run: npm test   (node --experimental-strip-types tests/run-tests.mjs)
import { readFileSync, readdirSync } from 'node:fs';
import { start, step, result, validate, knowledgeBehaviourGap } from '../src/engine/engine.ts';
import { checkMessage } from '../src/check/rules.ts';
import { SCAM, GENUINE } from './fixtures.mjs';

let failed = 0; const ok = (c, msg) => { console.log(`${c ? '  ✓' : '  ✗'} ${msg}`); if (!c) failed++; };
const dir = new URL('../src/scenarios/', import.meta.url);
const scenarios = readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(new URL(f, dir), 'utf8')));
const RANK = { safe: 0, risky: 1, compromise: 2 };

// Bot players: the most gullible and the most careful person possible.
function play(s, gullible) {
  let st = start(s, 0), t = 0, guard = 0;
  while (!st.done && guard++ < 50) {
    const n = s.nodes[st.nodeId]; t += 3000;
    if (n.input && gullible) st = step(s, st, { type: 'input_submit', len: n.input.kind === 'pin' ? 4 : 6, hesitationMs: 900 }, t);
    else if (n.input && !n.choices?.length) st = step(s, st, { type: 'input_cancel' }, t);
    else { const c = [...n.choices].sort((a, b) => gullible ? RANK[b.risk] - RANK[a.risk] : RANK[a.risk] - RANK[b.risk])[0]; st = step(s, st, { type: 'choose', choiceId: c.id }, t); }
  }
  return result(s, st, t);
}

console.log('SCENARIOS');
const results = [];
for (const s of scenarios) {
  const errs = validate(s); ok(errs.length === 0, `${s.id}: graph valid ${errs.length ? JSON.stringify(errs) : ''}`);
  const g = play(s, true), c = play(s, false); results.push(g);
  ok(g.outcome === 'scammed' && g.lossInr > 0, `${s.id}: gullible bot is scammed (−₹${g.lossInr}, walked past ${g.flagsWalkedPast.length}/${g.flagsTotal} flags)`);
  ok(c.outcome === 'escaped' && c.lossInr === 0 && c.behaviourScore === 1, `${s.id}: careful bot escapes clean`);
}
const gap = knowledgeBehaviourGap(results.map(() => true), results);
ok(gap.gap === 1 && gap.knewButFell === results.length, `gap metric: knew every rule, fell for all → gap ${gap.gap}`);

// timeout path + late escape
const s1 = scenarios.find(s => s.id === 'olx-qr');
let st = start(s1, 0); st = step(s1, st, { type: 'choose', choiceId: 'a' }, 1); st = step(s1, st, { type: 'choose', choiceId: 'b' }, 2);
st = step(s1, st, { type: 'timeout' }, 3); st = step(s1, st, { type: 'choose', choiceId: 'b' }, 4);
ok(result(s1, st, 5).outcome === 'escaped_late', 'olx-qr: complied first, then blocked → escaped_late (0.5)');
let threw = false; try { step(s1, st, { type: 'timeout' }, 6); } catch { threw = true } ok(threw, 'engine refuses actions after the run is finished');

console.log('\n/check RULES');
const caught = SCAM.filter(m => checkMessage(m).verdict !== 'no_red_flags_found');
const falseAlarms = GENUINE.filter(m => checkMessage(m).verdict !== 'no_red_flags_found');
SCAM.forEach(m => { const r = checkMessage(m); console.log(`   [${r.verdict.padEnd(18)}] s=${String(r.score).padStart(2)} ${r.archetype.padEnd(18)} ${r.flags.join(',')}`); });
GENUINE.forEach(m => { const r = checkMessage(m); if (r.verdict !== 'no_red_flags_found') console.log(`   FALSE ALARM s=${r.score} ${r.flags.join(',')} :: ${m.slice(0, 70)}`); });
ok(caught.length === SCAM.length, `scam recall ${caught.length}/${SCAM.length}`);
ok(falseAlarms.length === 0, `false alarms on genuine messages ${falseAlarms.length}/${GENUINE.length}`);
ok(checkMessage(GENUINE[0]).flags.includes('otp_request') === false, `"Do not share this OTP" is NOT read as an OTP request`);

console.log(failed ? `\n${failed} FAILED` : '\nALL PASS'); process.exit(failed ? 1 : 0);
