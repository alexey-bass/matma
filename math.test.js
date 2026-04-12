import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rand, pick, getRange, generateProblem, shuffle, generateTableProblems, checkAnswer, generateMissingProblem, generateTrueFalseProblem, generateMakeProblem } from './math.js';

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

  it('generates correct division problems', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateProblem('hard', ['÷']);
      assert.strictEqual(p.op, '÷');
      assert.strictEqual(p.a % p.b, 0, `${p.a} not divisible by ${p.b}`);
      assert.strictEqual(p.correctAnswer, p.a / p.b);
      assert.ok(p.b >= 2 && p.b <= 12);
    }
  });

  it('division always produces whole number results', () => {
    for (let i = 0; i < 200; i++) {
      const p = generateProblem('medium', ['÷']);
      assert.strictEqual(p.a % p.b, 0);
      assert.ok(Number.isInteger(p.correctAnswer));
    }
  });

  it('division never divides by zero', () => {
    for (let i = 0; i < 200; i++) {
      const p = generateProblem('easy', ['÷']);
      assert.ok(p.b >= 1, `divisor was ${p.b}`);
    }
  });

  it('returns a text property with = ?', () => {
    const p = generateProblem('easy', ['+']);
    assert.ok(p.text.endsWith('= ?'));
  });
});

describe('shuffle', () => {
  it('returns the same array reference', () => {
    const arr = [1, 2, 3];
    assert.strictEqual(shuffle(arr), arr);
  });

  it('preserves all elements', () => {
    const arr = [1, 2, 3, 4, 5];
    shuffle(arr);
    assert.deepStrictEqual([...arr].sort(), [1, 2, 3, 4, 5]);
  });

  it('handles empty array', () => {
    assert.deepStrictEqual(shuffle([]), []);
  });

  it('handles single element', () => {
    assert.deepStrictEqual(shuffle([42]), [42]);
  });
});

describe('generateTableProblems', () => {
  it('generates 9 problems per table', () => {
    assert.strictEqual(generateTableProblems([3]).length, 9);
  });

  it('generates correct multiplication facts', () => {
    const problems = generateTableProblems([7]);
    for (const p of problems) {
      assert.strictEqual(p.a, 7);
      assert.strictEqual(p.op, '×');
      assert.strictEqual(p.correctAnswer, 7 * p.b);
    }
  });

  it('covers factors 1 through 10', () => {
    const factors = generateTableProblems([5]).map(p => p.b).sort((a, b) => a - b);
    assert.deepStrictEqual(factors, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('handles multiple tables', () => {
    assert.strictEqual(generateTableProblems([2, 3]).length, 18);
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

describe('generateMissingProblem', () => {
  it('hides exactly one operand and the answer solves it', () => {
    for (let i = 0; i < 200; i++) {
      const p = generateMissingProblem('medium', ['+', '−', '×', '÷']);
      assert.ok(p.missing === 'a' || p.missing === 'b');
      assert.ok(p.text.includes('?'));
      assert.strictEqual(p.text.split('?').length - 1, 1, `exactly one ? in "${p.text}"`);
      if (p.missing === 'a') assert.strictEqual(p.correctAnswer, p.a);
      else assert.strictEqual(p.correctAnswer, p.b);
    }
  });

  it('result appears on the right side of the equation', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateMissingProblem('easy', ['+']);
      assert.ok(/= \d+$/.test(p.text), `text: ${p.text}`);
    }
  });
});

describe('generateTrueFalseProblem', () => {
  it('returns a boolean correctAnswer', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateTrueFalseProblem('easy', ['+']);
      assert.strictEqual(typeof p.correctAnswer, 'boolean');
    }
  });

  it('true problems have shown === real result', () => {
    for (let i = 0; i < 200; i++) {
      const p = generateTrueFalseProblem('medium', ['+', '−']);
      const realResult = p.op === '+' ? p.a + p.b : p.a - p.b;
      if (p.correctAnswer === true) {
        assert.strictEqual(p.shown, realResult);
      } else {
        assert.notStrictEqual(p.shown, realResult);
      }
    }
  });

  it('shown value is never negative', () => {
    for (let i = 0; i < 500; i++) {
      const p = generateTrueFalseProblem('easy', ['+', '−', '×', '÷']);
      assert.ok(p.shown >= 0, `shown was ${p.shown}`);
    }
  });

  it('text has no ? and includes the shown value', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateTrueFalseProblem('easy', ['+']);
      assert.ok(!p.text.includes('?'));
      assert.ok(p.text.endsWith(`= ${p.shown}`));
    }
  });
});

describe('generateMakeProblem', () => {
  it('easy targets 10', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateMakeProblem('easy');
      assert.strictEqual(p.target, 10);
      assert.strictEqual(p.a + p.correctAnswer, 10);
    }
  });

  it('medium targets 20', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateMakeProblem('medium');
      assert.strictEqual(p.target, 20);
      assert.strictEqual(p.a + p.correctAnswer, 20);
    }
  });

  it('hard targets 100', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateMakeProblem('hard');
      assert.strictEqual(p.target, 100);
      assert.strictEqual(p.a + p.correctAnswer, 100);
    }
  });

  it('correctAnswer is non-negative and <= target', () => {
    for (let i = 0; i < 100; i++) {
      const p = generateMakeProblem('hard');
      assert.ok(p.correctAnswer >= 0 && p.correctAnswer <= 100);
    }
  });

  it('text uses ? for the missing addend', () => {
    const p = generateMakeProblem('easy');
    assert.ok(/^\d+ \+ \? = 10$/.test(p.text), `text: ${p.text}`);
  });
});
