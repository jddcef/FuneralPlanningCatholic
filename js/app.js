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

// Document content definitions
const documentContents = {
  checklist: {
    title: "Funeral Planning Checklist",
    content: `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-catholic-blue">Catholic Funeral Planning Checklist</h2>
        
        <div class="space-y-4">
          <div class="border-l-4 border-catholic-blue pl-4">
            <h3 class="font-semibold text-lg">Immediate Actions (First 24-48 hours)</h3>
            <ul class="list-disc list-inside space-y-2 mt-2 text-gray-700">
              <li>Contact parish priest or office</li>
              <li>Contact funeral home</li>
              <li>Notify family and close friends</li>
              <li>Begin planning vigil/wake service</li>
            </ul>
          </div>
          
          <div class="border-l-4 border-catholic-gold pl-4">
            <h3 class="font-semibold text-lg">Within First Week</h3>
            <ul class="list-disc list-inside space-y-2 mt-2 text-gray-700">
              <li>Schedule funeral mass date and time</li>
              <li>Choose vigil location and date</li>
              <li>Select readings and music</li>
              <li>Coordinate with funeral home for transportation</li>
              <li>Prepare obituary</li>
            </ul>
          </div>
          
          <div class="border-l-4 border-catholic-red pl-4">
            <h3 class="font-semibold text-lg">Final Preparations</h3>
            <ul class="list-disc list-inside space-y-2 mt-2 text-gray-700">
              <li>Prepare program for mass</li>
              <li>Arrange burial/interment</li>
              <li>Organize hospitality for after burial</li>
              <li>Confirm all participants (readers, musicians)</li>
              <li>Prepare eulogy if desired</li>
            </ul>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-lg text-catholic-blue">Important Notes</h3>
            <ul class="list-disc list-inside space-y-1 mt-2 text-sm text-gray-700">
              <li>Keep parish priest informed of all decisions</li>
              <li>Consider seasonal liturgical restrictions</li>
              <li>Plan for inclement weather at graveside</li>
              <li>Have backup plans for outdoor services</li>
            </ul>
          </div>
        </div>
      </div>
    `
  },
  
  program: {
    title: "Funeral Program Template",
    content: `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-catholic-blue">Funeral Program Template</h2>
        
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="font-semibold text-lg mb-4">Sample Program Structure</h3>
          
          <div class="space-y-4 text-sm">
            <div class="border-b pb-2">
              <h4 class="font-medium text-catholic-blue">Cover</h4>
              <p class="text-gray-600">Name, dates, photo, "In Loving Memory"</p>
            </div>
            
            <div class="border-b pb-2">
              <h4 class="font-medium text-catholic-blue">Order of Service</h4>
              <ul class="list-decimal list-inside space-y-1 text-gray-600">
                <li>Gathering Music</li>
                <li>Opening Prayer</li>
                <li>First Reading</li>
                <li>Responsorial Psalm</li>
                <li>Second Reading</li>
                <li>Gospel Acclamation</li>
                <li>Gospel</li>
                <li>Homily</li>
                <li>Prayers of the Faithful</li>
                <li>Preparation of the Gifts</li>
                <li>Eucharistic Prayer</li>
                <li>Communion</li>
                <li>Final Commendation</li>
                <li>Procession to Place of Committal</li>
              </ul>
            </div>
            
            <div class="border-b pb-2">
              <h4 class="font-medium text-catholic-blue">Readings</h4>
              <p class="text-gray-600">Include full text or references for selected readings</p>
            </div>
            
            <div class="border-b pb-2">
              <h4 class="font-medium text-catholic-blue">Music</h4>
              <p class="text-gray-600">List all hymns and musical selections</p>
            </div>
            
            <div>
              <h4 class="font-medium text-catholic-blue">Back Cover</h4>
              <p class="text-gray-600">Thank you message, funeral home information, acknowledgments</p>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="font-semibold text-lg text-catholic-blue mb-2">Customization Tips</h3>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>Use consistent fonts and spacing</li>
            <li>Include meaningful photos</li>
            <li>Add personal touches that reflect the deceased</li>
            <li>Keep text readable and well-organized</li>
            <li>Consider printing on quality paper</li>
          </ul>
        </div>
      </div>
    `
  },
  
  readings: {
    title: "Catholic Funeral Readings Booklet",
    content: `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-catholic-blue">Catholic Funeral Readings Booklet</h2>
        
        <div class="space-y-6">
          <div>
            <h3 class="font-semibold text-lg text-catholic-blue mb-3">First Reading Options</h3>
            <div class="space-y-3">
              ${window.readings.filter(r => r.type === "First Reading").map(reading => `
                <div class="border-l-4 border-catholic-blue pl-4">
                  <h4 class="font-medium">${reading.title}</h4>
                  <p class="text-sm text-gray-600 mb-2">${reading.text.substring(0, 150)}...</p>
                  <div class="flex flex-wrap gap-1">
                    ${reading.theme.map(theme => 
                      `<span class="bg-catholic-blue text-white px-2 py-1 rounded text-xs">${theme}</span>`
                    ).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div>
            <h3 class="font-semibold text-lg text-catholic-blue mb-3">Psalm Options</h3>
            <div class="space-y-3">
              ${window.readings.filter(r => r.type === "Psalm").map(reading => `
                <div class="border-l-4 border-catholic-gold pl-4">
                  <h4 class="font-medium">${reading.title}</h4>
                  <p class="text-sm text-gray-600 mb-2">${reading.text.substring(0, 150)}...</p>
                  <div class="flex flex-wrap gap-1">
                    ${reading.theme.map(theme => 
                      `<span class="bg-catholic-gold text-white px-2 py-1 rounded text-xs">${theme}</span>`
                    ).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div>
            <h3 class="font-semibold text-lg text-catholic-blue mb-3">Second Reading Options</h3>
            <div class="space-y-3">
              ${window.readings.filter(r => r.type === "Second Reading").map(reading => `
                <div class="border-l-4 border-catholic-red pl-4">
                  <h4 class="font-medium">${reading.title}</h4>
                  <p class="text-sm text-gray-600 mb-2">${reading.text.substring(0, 150)}...</p>
                  <div class="flex flex-wrap gap-1">
                    ${reading.theme.map(theme => 
                      `<span class="bg-catholic-red text-white px-2 py-1 rounded text-xs">${theme}</span>`
                    ).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div>
            <h3 class="font-semibold text-lg text-catholic-blue mb-3">Gospel Options</h3>
            <div class="space-y-3">
              ${window.readings.filter(r => r.type === "Gospel").map(reading => `
                <div class="border-l-4 border-green-600 pl-4">
                  <h4 class="font-medium">${reading.title}</h4>
                  <p class="text-sm text-gray-600 mb-2">${reading.text.substring(0, 150)}...</p>
                  <div class="flex flex-wrap gap-1">
                    ${reading.theme.map(theme => 
                      `<span class="bg-green-600 text-white px-2 py-1 rounded text-xs">${theme}</span>`
                    ).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `
  },
  
  vigil: {
    title: "Vigil Prayer Service Outline",
    content: `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-catholic-blue">Vigil Prayer Service Outline</h2>
        
        <div class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-lg text-catholic-blue mb-2">Opening</h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Gathering Song</li>
              <li>Sign of the Cross</li>
              <li>Opening Prayer</li>
              <li>Scripture Reading (15-20 minutes)</li>
            </ul>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-lg text-catholic-blue mb-2">Prayers and Remembrance</h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Prayers of the Faithful</li>
              <li>Personal Tributes (2-3 minutes each)</li>
              <li>Shared Memories</li>
              <li>Silent Prayer</li>
            </ul>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-lg text-catholic-blue mb-2">Closing</h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Final Prayer</li>
              <li>Blessing</li>
              <li>Sign of the Cross</li>
              <li>Closing Song</li>
            </ul>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-semibold text-lg text-catholic-blue mb-2">Suggested Scripture Readings</h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Wisdom 3:1-9 (Hope and Resurrection)</li>
              <li>Psalm 23 (The Lord is My Shepherd)</li>
              <li>John 14:1-6 (Do Not Let Your Hearts Be Troubled)</li>
              <li>Romans 8:31-35, 37-39 (Nothing Can Separate Us)</li>
            </ul>
          </div>
          
          <div class="bg-yellow-50 p-4 rounded-lg">
            <h3 class="font-semibold text-lg text-catholic-blue mb-2">Pastoral Notes</h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Keep the service to 45-60 minutes</li>
              <li>Allow time for personal sharing</li>
              <li>Provide tissues and comfortable seating</li>
              <li>Consider having refreshments available after</li>
              <li>Respect cultural and family traditions</li>
            </ul>
          </div>
        </div>
      </div>
    `
  }
};

// Document preview functionality
function attachDocumentListeners() {
  $(document).on('click', '.download-btn', function() {
    const type = $(this).data('type');
    const document = documentContents[type];
    
    if (document) {
      $('#document-title').text(document.title);
      $('#document-content').html(document.content);
      $('#document-modal').removeClass('hidden');
    }
  });
  
  $('#close-document').on('click', function() {
    $('#document-modal').addClass('hidden');
  });
  
  // Close modal when clicking outside
  $('#document-modal').on('click', function(e) {
    if (e.target === this) {
      $(this).addClass('hidden');
    }
  });
  
  // Generate PDF for specific document
  $('#generate-document-pdf').on('click', function() {
    const title = $('#document-title').text();
    const content = $('#document-content').html();
    generateDocumentPDF(title, content);
  });
}

// Generate PDF for specific documents
function generateDocumentPDF(title, content) {
  const doc = new window.jspdf.jsPDF();
  let y = 15;
  
  doc.setFontSize(18);
  doc.text(title, 105, y, { align: "center" });
  y += 15;
  
  // Convert HTML content to plain text for PDF
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  doc.setFontSize(12);
  const lines = doc.splitTextToSize(textContent, 180);
  lines.forEach(line => {
    if (y > 270) {
      doc.addPage();
      y = 15;
    }
    doc.text(line, 15, y);
    y += 7;
  });
  
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  
  // Show success message
  $('#document-modal').addClass('hidden');
  $('#pdf-status').text(`${title} PDF generated and downloaded!`).fadeIn();
  setTimeout(() => {
    $('#pdf-status').fadeOut();
  }, 3000);
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
        if (y > 270) {
          doc.addPage();
          y = 15;
        }
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
  attachDocumentListeners();

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
