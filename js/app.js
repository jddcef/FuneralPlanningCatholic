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
    localStorage.removeItem(selections);
  } catch (e) {}
}

// Semantic theme analysis using compromise.js
function analyzeThemes(text) {
  if (!window.nlp) return [];
  
  const doc = window.nlp(text);
  const nouns = doc.nouns().out('array');
  const verbs = doc.verbs().out('array');
  const adjectives = doc.adjectives().out('array');
  
  // Extract key themes based on common funeral-related terms
  const themes = [];
  const textLower = text.toLowerCase();
  
  if (textLower.includes('hope') || textLower.includes('resurrection') || textLower.includes('eternal')) {
    themes.push('hope');
  }
  if (textLower.includes('comfort') || textLower.includes('peace') || textLower.includes('consolation')) {
    themes.push('comfort');
  }
  if (textLower.includes('trust') || textLower.includes('faith') || textLower.includes('belief')) {
    themes.push('trust');
  }
  if (textLower.includes('light') || textLower.includes('salvation') || textLower.includes('deliverance')) {
    themes.push('light');
  }
  if (textLower.includes('blessed') || textLower.includes('kingdom') || textLower.includes('heaven')) {
    themes.push('blessedness');
  }
  if (textLower.includes('baptism') || textLower.includes('buried') || textLower.includes('risen')) {
    themes.push('resurrection');
  }
  
  return themes.length > 0 ? themes : ['general'];
}

// Populate hymn list with checkboxes and video preview
function renderHymns(saved) {
  const $list = $('#hymn-list');
  $list.empty();
  
  window.hymns.forEach((hymn, i) => {
    const checked = saved && saved.hymns && saved.hymns.includes(i);
    const hymnHtml = `
      <div class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
        <input type="checkbox" name="hymn" value="${i}" ${checked ? "checked" : ""} class="mt-1">
        <div class="flex-1">
          <div class="font-medium text-gray-900">${hymn.title}</div>
          <div class="text-sm text-gray-600 mb-2">${hymn.description}</div>
          <div class="flex space-x-2">
            <button class="watch-video-btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors" 
                    data-youtube="${hymn.youtube}" data-title="${hymn.title}">
              🎥 Watch Video
            </button>
            <a href="${hymn.youtube}" target="_blank" rel="noopener" 
               class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm transition-colors">
              Open in YouTube
            </a>
          </div>
        </div>
      </div>
    `;
    $list.append(hymnHtml);
  });
}

// Get all unique themes from readings
function getAllThemes() {
  const set = new Set();
  window.readings.forEach(r => {
    if (r.theme && Array.isArray(r.theme)) {
      r.theme.forEach(t => set.add(t));
    }
  });
  return Array.from(set).sort();
}

// Render reading selection, grouped by type, with radio buttons
function renderReadings(filterTheme = "", saved) {
  const $container = $('#reading-sections');
  $container.empty();
  
  const byType = groupReadings(window.readings);
  Object.keys(byType).forEach(type => {
    const $groupDiv = $(`
      <div class="reading-group mb-6">
        <h4 class="text-lg font-semibold text-catholic-blue mb-3">${type}</h4>
        <div class="space-y-3"></div>
      </div>
    `);
    
    const $readingsContainer = $groupDiv.find('.space-y-3');
    const group = byType[type];
    
    group.forEach(r => {
      if (filterTheme && (!r.theme || !r.theme.includes(filterTheme))) return;
      
      const id = `${type.replace(/\s+/g, "")}_${r.id}`;
      const checked = saved && saved.readings && saved.readings[type] === r.id;
      
      const readingHtml = `
        <label class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input type="radio" name="reading-${type}" value="${r.id}" ${checked ? "checked" : ""} class="mt-1">
          <div class="flex-1">
            <div class="font-medium text-gray-900">${r.title} <span class="text-sm text-gray-500">(${r.ref})</span></div>
            <div class="text-sm text-gray-600 mb-2">${r.text.substring(0, 100)}...</div>
            <div class="flex flex-wrap gap-1">
              ${(r.theme || []).map(theme => 
                `<span class="bg-catholic-blue text-white px-2 py-1 rounded text-xs">${theme}</span>`
              ).join('')}
            </div>
          </div>
        </label>
      `;
      $readingsContainer.append(readingHtml);
    });
    
    $container.append($groupDiv);
  });
}

// Populate theme filter dropdown
function renderThemeFilter() {
  const themes = getAllThemes();
  const $select = $('#theme-filter');
  $select.find('option:not(:first)').remove();
  
  themes.forEach(t => {
    $select.append(`<option value="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</option>`);
  });
}

// Gather selected hymns/readings and return as object
function getSelections() {
  // Hymns
  const hymnIdxs = $('input[name="hymn"]:checked').map(function() {
    return parseInt($(this).val(), 10);
  }).get();
  const hymns = hymnIdxs.map(idx => window.hymns[idx]);
  
  // Readings (one per type)
  const readingSelections = {};
  const readingIds = {};
  const byType = groupReadings(window.readings);
  
  Object.keys(byType).forEach(type => {
    const $sel = $(`input[name="reading-${type}"]:checked`);
    if ($sel.length) {
      const reading = window.readings.find(r => r.id === $sel.val());
      readingSelections[type] = reading;
      readingIds[type] = $sel.val();
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
  $(document).on('change', 'input[name="hymn"]', function() {
    const selections = getSelections();
    saveSelections({
      hymns: selections.hymnIdxs,
      readings: selections.readingIds
    });
  });
}

function attachReadingListeners() {
  $(document).on('change', 'input[type="radio"][name^="reading-"]', function() {
    const selections = getSelections();
    saveSelections({
      hymns: selections.hymnIdxs,
      readings: selections.readingIds
    });
  });
}

// Video modal functionality
function attachVideoListeners() {
  $(document).on('click', '.watch-video-btn', function() {
    const youtubeUrl = $(this).data('youtube');
    const title = $(this).data('title');
    const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    
    if (videoId) {
      $('#video-title').text(title);
      $('#video-container').html(`
        <iframe width="100%" height="100%" 
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>
      `);
      $('#video-modal').removeClass('hidden');
    }
  });
  
  $('#close-video').on('click', function() {
    $('#video-modal').addClass('hidden');
    $('#video-container').empty();
  });
  
  // Close modal when clicking outside
  $('#video-modal').on('click', function(e) {
    if (e.target === this) {
      $(this).addClass('hidden');
      $('#video-container').empty();
    }
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
  $('#pdf-status').text("PDF generated and downloaded!").fadeIn();
  setTimeout(() => {
    $('#pdf-status').fadeOut();
  }, 2500);
}

// Reset functionality
function attachResetListener() {
  $('#reset-app').on('click', function(e) {
    e.preventDefault();
    clearSelections();
    renderHymns();
    renderReadings("", null);
    attachHymnListeners();
    attachReadingListeners();
  });
}

// Smooth scrolling navigation
function attachNavigationListeners() {
  $('a[href^="#"]').on('click', function(e) {
    e.preventDefault();
    const target = $(this.getAttribute('href'));
    if (target.length) {
      $('html, body').animate({
        scrollTop: target.offset().top - 80
      }, 800);
    }
  });
  
  // Mobile menu toggle
  $('#mobile-menu-btn').on('click', function() {
    $('#mobile-menu').toggleClass('hidden');
  });
}

// Initialize the application
$(document).ready(function() {
  const saved = getSavedSelections();
  
  renderHymns(saved);
  renderThemeFilter();
  renderReadings("", saved);

  attachHymnListeners();
  attachReadingListeners();
  attachResetListener();
  attachVideoListeners();
  attachNavigationListeners();

  $('#generate-pdf').on('click', generatePDF);
  
  // Theme filter change
  $('#theme-filter').on('change', function() {
    renderReadings($(this).val(), getSavedSelections());
    attachReadingListeners();
  });
  
  // Initialize with semantic theme analysis if compromise.js is available
  if (window.nlp) {
    // Enhance existing readings with semantic analysis
    window.readings.forEach(reading => {
      if (!reading.theme || reading.theme.length === 0) {
        reading.theme = analyzeThemes(reading.text);
      }
    });
    renderThemeFilter();
    renderReadings("", saved);
  }
});
