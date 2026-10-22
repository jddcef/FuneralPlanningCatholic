const test = require('node:test');
const assert = require('node:assert/strict');
const logic = require('../js/planner-logic.js');

test('groupReadings groups readings by their type', () => {
  const readings = [
    { type: 'First Reading', id: 'first1' },
    { type: 'First Reading', id: 'first2' },
    { type: 'Gospel', id: 'gospel1' }
  ];

  const grouped = logic.groupReadings(readings);
  assert.deepEqual(grouped['First Reading'].map(r => r.id), ['first1', 'first2']);
  assert.deepEqual(grouped.Gospel.map(r => r.id), ['gospel1']);
});

test('analyzeThemes detects expected funeral themes from text', () => {
  const themes = logic.analyzeThemes('Jesus offers comfort and hope through resurrection and eternal life.');
  assert.ok(themes.includes('hope'));
  assert.ok(themes.includes('comfort'));
});

test('getAllThemes returns a sorted list of unique themes', () => {
  const readings = [
    { theme: ['hope', 'comfort'] },
    { theme: ['hope', 'trust'] },
    { theme: ['comfort'] }
  ];

  const themes = logic.getAllThemes(readings);
  assert.deepEqual(themes, ['comfort', 'hope', 'trust']);
});

test('email and phone validators reject invalid values and accept valid ones', () => {
  assert.equal(logic.isValidEmail('name@example.com'), true);
  assert.equal(logic.isValidEmail('bad-email'), false);
  assert.equal(logic.isValidPhone('+27 12 345 6789'), true);
  assert.equal(logic.isValidPhone('abc'), false);
});
