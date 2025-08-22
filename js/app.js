// Utility: Group readings by type
function groupReadings(readings) {
  const groups = {};
  readings.forEach(r => {
    if (!groups[r.type]) groups[r.type] = [];
    groups[r.type].push(r);
  });
  return groups;
}

// LocalStorage helpers
const LS_KEY = "funeral-planner-v1";
function saveSelections(selections) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(selections));
  } catch (e) {}
}
function loadSelections() {
  try {
    const d = localStorage.getItem(LS_KEY);
    return d ? JSON.parse(d) : null;
  } catch (e) { return null; }
}
function clearSelections() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch (e) {}
}

// Populate hymn list with checkboxes
function renderHymns(saved) {
  const list = document.getElementById("hymn-list");
  list.innerHTML = "";
  window.hymns.forEach((hymn, i) => {
    const li = document.createElement("li");
    const checked = saved && saved.hymns && saved.hymns.includes(i);
    li.innerHTML = `
      <label>
        <input type="checkbox" name="hymn" value="${i}" ${checked ? "checked" : ""}>
        ${hymn.title}
        <a href="${hymn.youtube}" target="_blank" rel="noopener">[YouTube]</a>
        <span class="desc">${hymn.description}</span>
      </label>
    `;
    list.appendChild(li);
  });
}

// Get all unique themes from readings
function getAllThemes() {
  const set = new Set();
  window.readings.forEach(r => r.theme.forEach(t => set.add(t)));
  return Array.from(set).sort();
}

// Render reading selection, grouped by type, with radio buttons
function renderReadings(filterTheme = "", saved) {
  const container = document.getElementById("reading-sections");
  container.innerHTML = "";
  const byType = groupReadings(window.readings);
  Object.keys(byType).forEach(type => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "reading-group";
    groupDiv.innerHTML = `<h3>${type}</h3>`;
    const group = byType[type];
    group.forEach(r => {
      if (filterTheme && !r.theme.includes(filterTheme)) return;
      const id = `${type.replace(/\\s+/g,"")}_${r.id}`;
      const checked = saved && saved.readings && saved.readings[type] === r.id;
      const radio = `
        <label>
          <input type="radio" name="reading-${type}" value="${r.id}" ${checked ? "checked" : ""}> 
          <strong>${r.title}</strong> <span class="small">(${r.ref})</span>
          <span class="theme">[${r.theme.join(", ")}]</span>
          <div class="reading-text">${r.text.substring(0, 80)}...</div>
        </label>
      `;
      groupDiv.innerHTML += radio;
    });
    container.appendChild(groupDiv);
  });
}

// Populate theme filter dropdown
function renderThemeFilter() {
  const themes = getAllThemes();
  const select = document.getElementById("theme-filter");
  themes.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    select.appendChild(opt);
  });
  select.addEventListener("change", e => {
    renderReadings(e.target.value, getSavedSelections());
    attachReadingListeners();
  });
}

// Gather selected hymns/readings and return as object
function getSelections() {
  // Hymns
  const hymnEls = document.querySelectorAll('input[name="hymn"]:checked');
  const hymnIdxs = Array.from(hymnEls).map(el => parseInt(el.value, 10));
  const hymns = hymnIdxs.map(idx => window.hymns[idx]);
  // Readings (one per type)
  const readingSelections = {};
  const readingIds = {};
  const byType = groupReadings(window.readings);
  Object.keys(byType).forEach(type => {
    const sel = document.querySelector(`input[name="reading-${type}"]:checked`);
    if (sel) {
      const reading = window.readings.find(r => r.id === sel.value);
      readingSelections[type] = reading;
      readingIds[type] = sel.value;
    }
  });
  return { hymns, hymnIdxs, readings: readingSelections, readingIds };
}
function getSavedSelections() {
  const sel = loadSelections();
  if (!sel) return null;
  // Map indices to hymn objects for compatibility
  const hymns = (sel.hymns || []).map(idx => window.hymns[idx]);
  const readings = {};
  Object.keys(sel.readings || {}).forEach(type => {
    const r = window.readings.find(rd => rd.id === sel.readings[type]);
    if (r) readings[type] = r;
  });
  return { hymns, hymnIdxs: sel.hymns, readings, readingIds: sel.readings };
}

// Save on every selection
function attachHymnListeners() {
  document.querySelectorAll('input[name="hymn"]').forEach(el => {
    el.addEventListener("change", () => {
      const selections = getSelections();
      saveSelections({
        hymns: selections.hymnIdxs,
        readings: selections.readingIds
      });
    });
  });
}
function attachReadingListeners() {
  document.querySelectorAll('input[type="radio"][name^="reading-"]').forEach(el => {
    el.addEventListener("change", () => {
      const selections = getSelections();
      saveSelections({
        hymns: selections.hymnIdxs,
        readings: selections.readingIds
      });
    });
  });
}

// Generate printable PDF with jsPDF
function generatePDF() {
  const { hymns, readings } = getSelections();
  const doc = new window.jspdf.jsPDF();
  let y = 15;
  doc.setFontSize(18);
  doc.text("Catholic Funeral Plan", 105, y, { align: "center" });
  y += 10;

  doc.setFontSize(14);
  doc.text("Hymns:", 10, y);
  y += 6;
  doc.setFontSize(12);
  if (hymns.length === 0) {
    doc.text("No hymn selected.", 12, y);
    y += 7;
  } else {
    hymns.forEach(hymn => {
      doc.text(`${hymn.title} (${hymn.youtube})`, 12, y);
      y += 7;
    });
  }
  y += 3;
  doc.setFontSize(14);
  doc.text("Readings:", 10, y);
  y += 6;
  doc.setFontSize(12);
  ["First Reading", "Psalm", "Second Reading", "Gospel"].forEach(type => {
    if (readings[type]) {
      doc.text(`${type}: ${readings[type].title} (${readings[type].ref})`, 12, y);
      y += 5;
      const lines = doc.splitTextToSize(readings[type].text, 180);
      lines.forEach(line => {
        doc.text(line, 14, y);
        y += 5;
      });
      y += 2;
    } else {
      doc.text(`${type}: [not selected]`, 12, y);
      y += 7;
    }
  });

  doc.save("funeral-plan.pdf");
  document.getElementById("pdf-status").textContent = "PDF generated and downloaded!";
  setTimeout(() => {
    document.getElementById("pdf-status").textContent = "";
  }, 2500);
}

// Reset functionality
function attachResetListener() {
  document.getElementById("reset-app").addEventListener("click", e => {
    e.preventDefault();
    clearSelections();
    renderHymns();
    renderReadings("", null);
    attachHymnListeners();
    attachReadingListeners();
  });
}

// Init
window.addEventListener("DOMContentLoaded", () => {
  const saved = getSavedSelections();
  renderHymns(saved);
  renderThemeFilter();
  renderReadings("", saved);

  attachHymnListeners();
  attachReadingListeners();
  attachResetListener();

  document.getElementById("generate-pdf").addEventListener("click", generatePDF);
}