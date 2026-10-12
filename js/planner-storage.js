(function (global) {
  const STORAGE_KEY = 'funeral-planner-v1';
  const SCHEMA_VERSION = 2;

  function createFallbackState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      data: {
        hymns: [],
        hymnIdxs: [],
        readings: {},
        readingIds: {}
      }
    };
  }

  function normalizePlannerState(value) {
    const fallback = createFallbackState();

    if (!value || typeof value !== 'object') {
      return fallback;
    }

    if (value.schemaVersion === SCHEMA_VERSION && value.data && typeof value.data === 'object') {
      return {
        schemaVersion: SCHEMA_VERSION,
        data: {
          hymns: Array.isArray(value.data.hymns) ? value.data.hymns : [],
          hymnIdxs: Array.isArray(value.data.hymnIdxs) ? value.data.hymnIdxs : [],
          readings: value.data.readings && typeof value.data.readings === 'object' ? value.data.readings : {},
          readingIds: value.data.readingIds && typeof value.data.readingIds === 'object' ? value.data.readingIds : {}
        }
      };
    }

    const migrated = {
      schemaVersion: SCHEMA_VERSION,
      data: {
        hymns: Array.isArray(value.hymns) ? value.hymns : [],
        hymnIdxs: Array.isArray(value.hymnIdxs) ? value.hymnIdxs : [],
        readings: value.readings && typeof value.readings === 'object' ? value.readings : {},
        readingIds: value.readingIds && typeof value.readingIds === 'object' ? value.readingIds : {}
      }
    };

    return migrated;
  }

  function readStoredValue(key, fallback) {
    const storage = global.localStorage;
    if (!storage) {
      return fallback;
    }

    try {
      const raw = storage.getItem(key);
      if (!raw) {
        return fallback;
      }

      const parsed = JSON.parse(raw);
      return normalizePlannerState(parsed);
    } catch (error) {
      return fallback;
    }
  }

  function writeStoredValue(key, value) {
    const storage = global.localStorage;
    if (!storage) {
      return false;
    }

    try {
      storage.setItem(key, JSON.stringify(normalizePlannerState(value)));
      return true;
    } catch (error) {
      return false;
    }
  }

  function saveSelections(selections) {
    return writeStoredValue(STORAGE_KEY, selections);
  }

  function loadSelections() {
    return readStoredValue(STORAGE_KEY, createFallbackState());
  }

  function clearSelections() {
    const storage = global.localStorage;
    if (!storage) {
      return false;
    }

    try {
      storage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  const api = {
    STORAGE_KEY,
    SCHEMA_VERSION,
    createFallbackState,
    normalizePlannerState,
    readStoredValue,
    writeStoredValue,
    saveSelections,
    loadSelections,
    clearSelections
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.PlannerStorage = api;
})(typeof window !== 'undefined' ? window : globalThis);
