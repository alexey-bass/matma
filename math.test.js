import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rand, pick, getRange, generateProblem, checkAnswer } from './math.js';

describe('rand', () => {
  it('returns values within [min, max]', () => {
    for (let i = 0; i < 200; i++) {
      const v = rand(3, 7);
      assert.ok(v >= 3 && v <= 7, `got ${v}`);
    }
  });

  it('returns min when min === max', () => {
    assert.strictEqual(rand(5, 5), 5);
  });

  it('returns integers', () => {
    for (let i = 0; i < 50; i++) {
      const v = rand(1, 100);
      assert.strictEqual(v, Math.floor(v));
    }
  });
});

describe('pick', () => {
  it('returns an element from the array', () => {
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 50; i++) {
      assert.ok(arr.includes(pick(arr)));
    }
  });

  it('works with a single-element array', () => {
    assert.strictEqual(pick([42]), 42);
  });
});

describe('getRange', () => {
  it('returns correct range for easy', () => {
    assert.deepStrictEqual(getRange('easy'), { add: 20, mul: 5 });
  });

  it('returns correct range for medium', () => {
    assert.deepStrictEqual(getRange('medium'), { add: 50, mul: 10 });
  });

  it('returns correct range for hard', () => {
    assert.deepStrictEqual(getRange('hard'), { add: 100, mul: 12 });
  });
});

describe('generateProblem', () => {
  it('generates correct addition problems', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateProblem('easy', ['+']);
      assert.strictEqual(p.op, '+');
      assert.strictEqual(p.correctAnswer, p.a + p.b);
      assert.ok(p.a >= 1 && p.a <= 20);
      assert.ok(p.b >= 1 && p.b <= 20);
    }
  });

  it('generates subtraction with non-negative results (b <= a)', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateProblem('medium', ['−']);
      assert.strictEqual(p.op, '−');
      assert.ok(p.b <= p.a, `b(${p.b}) > a(${p.a})`);
      assert.strictEqual(p.correctAnswer, p.a - p.b);
      assert.ok(p.correctAnswer >= 0);
    }
  });

  it('generates correct multiplication problems', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateProblem('hard', ['×']);
      assert.strictEqual(p.op, '×');
      assert.strictEqual(p.correctAnswer, p.a * p.b);
      assert.ok(p.a >= 1 && p.a <= 12);
      assert.ok(p.b >= 1 && p.b <= 12);
    }
  });

  it('respects difficulty ranges for addition', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateProblem('easy', ['+']);
      assert.ok(p.a <= 20 && p.b <= 20);
    }
    for (let i = 0; i < 50; i++) {
      const p = generateProblem('hard', ['+']);
      assert.ok(p.a <= 100 && p.b <= 100);
    }
  });

  it('never produces x1 multiplication on medium', () => {
    for (let i = 0; i < 200; i++) {
      const p = generateProblem('medium', ['×']);
      assert.ok(p.a >= 2, `medium: a was ${p.a}`);
      assert.ok(p.b >= 2, `medium: b was ${p.b}`);
    }
  });

  it('never produces x1 multiplication on hard', () => {
    for (let i = 0; i < 200; i++) {
      const p = generateProblem('hard', ['×']);
      assert.ok(p.a >= 2, `hard: a was ${p.a}`);
      assert.ok(p.b >= 2, `hard: b was ${p.b}`);
    }
  });

  it('allows x1 multiplication on easy', () => {
    // Run enough times that we'd expect to see a 1 if it's possible
    let sawOne = false;
    for (let i = 0; i < 500; i++) {
      const p = generateProblem('easy', ['×']);
      if (p.a === 1 || p.b === 1) { sawOne = true; break; }
    }
    assert.ok(sawOne, 'easy mode should allow 1 as a multiplication operand');
  });

  it('returns a text property with = ?', () => {
    const p = generateProblem('easy', ['+']);
    assert.ok(p.text.endsWith('= ?'));
  });
});

describe('checkAnswer', () => {
  it('returns true for correct answer', () => {
    assert.strictEqual(checkAnswer('42', 42), true);
  });

  it('returns false for wrong answer', () => {
    assert.strictEqual(checkAnswer('10', 42), false);
  });

  it('returns null for empty input', () => {
    assert.strictEqual(checkAnswer('', 42), null);
  });

  it('returns null for whitespace-only input', () => {
    assert.strictEqual(checkAnswer('   ', 42), null);
  });

  it('handles zero correctly', () => {
    assert.strictEqual(checkAnswer('0', 0), true);
    assert.strictEqual(checkAnswer('0', 5), false);
  });
});
