// Run: npm test   (node --experimental-strip-types tests/run-tests.mjs)
import { readFileSync, readdirSync } from 'node:fs';
import { start, step, result, validate, isScenario, knowledgeBehaviourGap } from '../src/engine/engine.ts';
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
  ok(st.done && guard <= 50, `${s.id}: ${gullible ? 'gullible' : 'careful'} bot terminates (${guard} steps, limit 50)`);
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

// knowledgeBehaviourGap: mixed cases
{
  const R = (outcome, score) => ({ outcome, behaviourScore: score });
  const g1 = knowledgeBehaviourGap([true, true, false], [R('scammed', 0), R('escaped', 1), R('scammed', 0)]);
  ok(Math.abs(g1.knowledge - 2 / 3) < 1e-9 && Math.abs(g1.behaviour - 1 / 3) < 1e-9 && g1.knewButFell === 1, 'gap: knew 2 of 3, escaped 1 of 3, knew-but-fell = 1');
  const g2 = knowledgeBehaviourGap([false, false], [R('escaped', 1), R('escaped_late', 0.5)]);
  ok(g2.knowledge === 0 && g2.behaviour === 0.75 && g2.knewButFell === 0 && g2.gap < 0, 'gap: behaviour better than knowledge gives a negative gap');
  const g3 = knowledgeBehaviourGap([], []);
  ok(g3.knowledge === 0 && g3.behaviour === 0 && g3.knewButFell === 0, 'gap: empty input does not divide by zero');
}

// Runtime structure checks: a malformed scenario must be rejected, not rendered
{
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const base = scenarios[0];
  const badSurface = clone(base); badSurface.nodes[badSurface.start].surface = 'telepathy';
  const badRisk = clone(base); badRisk.nodes[badRisk.start].choices[0].risk = 'fine';
  const badNext = clone(base); badNext.nodes[badNext.start].choices[0].next = 'nowhere';
  const noHindi = clone(base); noHindi.nodes[noHindi.start].messages[0].text.hi = '';
  const cyclic = clone(base); for (const n of Object.values(cyclic.nodes)) { if (n.end) { delete n.end; n.choices = [{ id: 'a', label: { en: 'x', hi: 'x' }, next: cyclic.start, risk: 'safe', tag: 'stall' }, { id: 'b', label: { en: 'y', hi: 'y' }, next: cyclic.start, risk: 'safe', tag: 'stall' }]; } }
  ok(!isScenario(badSurface), 'validator rejects an unknown surface');
  ok(!isScenario(badRisk), 'validator rejects an unknown risk level');
  ok(!isScenario(badNext), 'validator rejects a pointer to a missing node');
  ok(!isScenario(noHindi), 'validator rejects a missing Hindi translation');
  ok(!isScenario(cyclic), 'validator rejects a graph with no way out (cycle, no endings)');
  ok(!isScenario(null) && !isScenario({}) && !isScenario('x'), 'validator rejects non-objects');
  ok(scenarios.every(isScenario), 'all shipped scenarios pass the runtime type guard');
}

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

// A flag counts once, however many patterns or sentences match it
{
  const one = checkMessage('Enter your PIN to receive the refund');
  ok(one.score === 4 && one.flags.length === 1, `one sentence, one flag, scored once (score ${one.score})`);
  const thrice = checkMessage('Enter your PIN to receive the refund. Enter your PIN to receive the cashback. Scan and enter PIN to get the money credited.');
  ok(thrice.flags.filter(f => f === 'pin_to_receive').length === 1, 'repeating a trick does not add its weight again');
  ok(thrice.findings.length >= 2, 'but every occurrence is still highlighted for the reader');
  const job = checkMessage('Part time work from home. Earn 3000 per day. Join Telegram and like and subscribe videos.');
  ok(job.archetype === 'job_task' && job.flags.includes('job_bait') && job.verdict !== 'no_red_flags_found', `easy-money task offer is caught as job_task (${job.verdict})`);
  ok(checkMessage('We are hiring part-time tutors. Work from home possible. Apply on our careers page.').verdict === 'no_red_flags_found', 'an ordinary part-time job post is not flagged');
  ok(checkMessage('').verdict === 'no_red_flags_found' && checkMessage('   ').findings.length === 0, 'empty input is handled');
}

console.log(failed ? `\n${failed} FAILED` : '\nALL PASS'); process.exit(failed ? 1 : 0);
