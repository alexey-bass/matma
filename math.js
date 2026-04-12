/**
 * Pure math/logic functions extracted from the app for testability.
 */

/** Random integer in [min, max] */
export function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random element from array */
export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Returns {add, mul} ranges for the given difficulty mode */
export function getRange(mode) {
  if (mode === 'easy')   return { add: 20, mul: 5 };
  if (mode === 'medium') return { add: 50, mul: 10 };
  return { add: 100, mul: 12 };
}

/**
 * Generate a math problem.
 * @param {string} mode - 'easy' | 'medium' | 'hard'
 * @param {string[]} activeOps - array of operation symbols: '+', '−', '×', '÷'
 * @returns {{ a: number, b: number, op: string, correctAnswer: number, text: string }}
 */
export function generateProblem(mode, activeOps) {
  const op = pick(activeOps);
  const r = getRange(mode);
  let a, b, correctAnswer, text;

  if (op === '+') {
    a = rand(1, r.add);
    b = rand(1, r.add);
    correctAnswer = a + b;
    text = `${a} + ${b} = ?`;
  } else if (op === '−') {
    a = rand(1, r.add);
    b = rand(1, a);
    correctAnswer = a - b;
    text = `${a} − ${b} = ?`;
  } else if (op === '÷') {
    const mulMin = mode === 'easy' ? 1 : 2;
    b = rand(mulMin, r.mul);
    const quotient = rand(mulMin, r.mul);
    a = b * quotient;
    correctAnswer = quotient;
    text = `${a} ÷ ${b} = ?`;
  } else {
    const mulMin = mode === 'easy' ? 1 : 2;
    a = rand(mulMin, r.mul);
    b = rand(mulMin, r.mul);
    correctAnswer = a * b;
    text = `${a} × ${b} = ?`;
  }

  return { a, b, op, correctAnswer, text };
}

/**
 * Check the user's answer.
 * @param {string} inputVal - raw string from the input field
 * @param {number} correctAnswer
 * @returns {true | false | null} true = correct, false = wrong, null = empty/invalid
 */
/** Shuffle array in place (Fisher-Yates) */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate all problems for given multiplication tables (factors 1–10).
 * @param {number[]} tables - e.g. [2, 3, 7]
 * @returns {Array<{a: number, b: number, op: string, correctAnswer: number, text: string}>}
 */
export function generateTableProblems(tables) {
  const problems = [];
  for (const t of tables) {
    for (let i = 1; i <= 9; i++) {
      problems.push({ a: t, b: i, op: '×', correctAnswer: t * i, text: `${t} × ${i} = ?` });
    }
  }
  return problems;
}

export function checkAnswer(inputVal, correctAnswer) {
  const trimmed = inputVal.trim();
  if (trimmed === '') return null;
  return parseInt(trimmed, 10) === correctAnswer;
}

/**
 * Generate a "missing number" problem by hiding one operand of a normal problem.
 * E.g. `? + 5 = 12` (find 7) or `8 × ? = 24` (find 3).
 * @returns {{ a, b, op, correctAnswer, text, missing: 'a'|'b' }}
 */
export function generateMissingProblem(mode, activeOps) {
  const p = generateProblem(mode, activeOps);
  const result = p.correctAnswer;
  const hide = Math.random() < 0.5 ? 'a' : 'b';
  let text, correctAnswer;
  if (hide === 'a') {
    text = `? ${p.op} ${p.b} = ${result}`;
    correctAnswer = p.a;
  } else {
    text = `${p.a} ${p.op} ? = ${result}`;
    correctAnswer = p.b;
  }
  return { a: p.a, b: p.b, op: p.op, correctAnswer, text, missing: hide };
}

/**
 * Generate a "true or false" equation. ~50% are true; the rest are perturbed
 * by a small non-zero delta (and kept non-negative).
 * @returns {{ a, b, op, shown: number, correctAnswer: boolean, text: string }}
 */
export function generateTrueFalseProblem(mode, activeOps) {
  const p = generateProblem(mode, activeOps);
  const isTrue = Math.random() < 0.5;
  let shown = p.correctAnswer;
  if (!isTrue) {
    const deltas = [-3, -2, -1, 1, 2, 3];
    let delta = pick(deltas);
    if (p.correctAnswer + delta < 0) delta = Math.abs(delta);
    shown = p.correctAnswer + delta;
    if (shown === p.correctAnswer) shown = p.correctAnswer + 1;
  }
  const text = `${p.a} ${p.op} ${p.b} = ${shown}`;
  return { a: p.a, b: p.b, op: p.op, shown, correctAnswer: isTrue, text };
}

/**
 * Generate a "make N" number-bond problem: `a + ? = target`.
 * Target depends on difficulty: easy=10, medium=20, hard=100.
 * @returns {{ a, b, op: '+', correctAnswer, text, target }}
 */
export function generateMakeProblem(mode) {
  const target = mode === 'easy' ? 10 : mode === 'medium' ? 20 : 100;
  const a = rand(0, target);
  const correctAnswer = target - a;
  const text = `${a} + ? = ${target}`;
  return { a, b: correctAnswer, op: '+', correctAnswer, text, target };
}
