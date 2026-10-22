const test = require('node:test');
const assert = require('node:assert/strict');
const storageApi = require('../js/planner-storage.js');

function createMockStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

test('normalizePlannerState migrates legacy flat selection object into versioned shape', () => {
  const result = storageApi.normalizePlannerState({
    hymns: [1, 2],
    hymnIdxs: [1, 2],
    readings: { 'First Reading': 'r1' },
    readingIds: { 'First Reading': 'r1' }
  });

  assert.equal(result.schemaVersion, 2);
  assert.deepEqual(result.data.hymns, [1, 2]);
  assert.deepEqual(result.data.hymnIdxs, [1, 2]);
  assert.deepEqual(result.data.readings, { 'First Reading': 'r1' });
  assert.deepEqual(result.data.readingIds, { 'First Reading': 'r1' });
});

test('loadSelections returns fallback when storage data is missing or malformed', () => {
  const mockStorage = createMockStorage({});
  const result = storageApi.readStoredValue('funeral-planner-v1', storageApi.createFallbackState());
  assert.deepEqual(result, storageApi.createFallbackState());

  const legacy = storageApi.normalizePlannerState({ not: 'valid' });
  assert.deepEqual(legacy.data, storageApi.createFallbackState().data);
  assert.equal(legacy.schemaVersion, 2);
});

test('saveSelections persists a versioned record and clearSelections removes it', () => {
  const mockStorage = createMockStorage();
  const originalLocalStorage = global.localStorage;

  global.localStorage = mockStorage;

  try {
    const selections = {
      hymns: [0],
      hymnIdxs: [0],
      readings: { 'First Reading': 'reading-1' },
      readingIds: { 'First Reading': 'reading-1' }
    };

    const saved = storageApi.saveSelections(selections);
    assert.equal(saved, true);

    const raw = mockStorage.getItem(storageApi.STORAGE_KEY);
    const parsed = JSON.parse(raw);
    assert.equal(parsed.schemaVersion, 2);
    assert.deepEqual(parsed.data, selections);

    const cleared = storageApi.clearSelections();
    assert.equal(cleared, true);
    assert.equal(mockStorage.getItem(storageApi.STORAGE_KEY), null);
  } finally {
    global.localStorage = originalLocalStorage;
  }
});
