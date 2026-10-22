(function (global) {
  function groupReadings(readings) {
    const groups = {};
    (Array.isArray(readings) ? readings : []).forEach(r => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return groups;
  }

  function analyzeThemes(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const nlp = global.nlp || globalThis.nlp;
    if (!nlp) {
      const textLower = text.toLowerCase();
      const themes = [];

      if (textLower.includes('hope') || textLower.includes('resurrection') || textLower.includes('eternal')) themes.push('hope');
      if (textLower.includes('comfort') || textLower.includes('peace') || textLower.includes('consolation')) themes.push('comfort');
      if (textLower.includes('trust') || textLower.includes('faith') || textLower.includes('belief')) themes.push('trust');
      if (textLower.includes('light') || textLower.includes('salvation') || textLower.includes('deliverance')) themes.push('light');
      if (textLower.includes('blessed') || textLower.includes('kingdom') || textLower.includes('heaven')) themes.push('blessedness');
      if (textLower.includes('baptism') || textLower.includes('buried') || textLower.includes('risen')) themes.push('resurrection');

      return themes.length > 0 ? themes : ['general'];
    }

    const doc = nlp(text);
    const nouns = doc.nouns().out('array');
    const verbs = doc.verbs().out('array');
    const adjectives = doc.adjectives().out('array');
    void nouns; void verbs; void adjectives;

    const themes = [];
    const textLower = text.toLowerCase();

    if (textLower.includes('hope') || textLower.includes('resurrection') || textLower.includes('eternal')) themes.push('hope');
    if (textLower.includes('comfort') || textLower.includes('peace') || textLower.includes('consolation')) themes.push('comfort');
    if (textLower.includes('trust') || textLower.includes('faith') || textLower.includes('belief')) themes.push('trust');
    if (textLower.includes('light') || textLower.includes('salvation') || textLower.includes('deliverance')) themes.push('light');
    if (textLower.includes('blessed') || textLower.includes('kingdom') || textLower.includes('heaven')) themes.push('blessedness');
    if (textLower.includes('baptism') || textLower.includes('buried') || textLower.includes('risen')) themes.push('resurrection');

    return themes.length > 0 ? themes : ['general'];
  }

  function getAllThemes(readings) {
    const set = new Set();
    (Array.isArray(readings) ? readings : []).forEach(r => {
      if (r.theme && Array.isArray(r.theme)) {
        r.theme.forEach(t => set.add(t));
      }
    });
    return Array.from(set).sort();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    return /^[+0-9()\-\s]{6,}$/.test(phone);
  }

  const api = {
    groupReadings,
    analyzeThemes,
    getAllThemes,
    isValidEmail,
    isValidPhone
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.PlannerLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
