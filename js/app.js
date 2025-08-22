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
              <li>Schedule funeral service date and time</li>
              <li>Choose vigil location and date</li>
              <li>Select readings and music</li>
              <li>Coordinate with funeral home for transportation</li>
              <li>Prepare obituary</li>
            </ul>
          </div>
          
          <div class="border-l-4 border-catholic-red pl-4">
            <h3 class="font-semibold text-lg">Final Preparations</h3>
            <ul class="list-disc list-inside space-y-2 mt-2 text-gray-700">
              <li>Prepare program for service</li>
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
                      `<span class="bg-catholic-red text-white px-2 py-1 rounded text-xs">${theme}</span>`
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

// Generate beautiful PDF for specific documents with rich formatting
function generateDocumentPDF(title, content) {
  const doc = new window.jspdf.jsPDF();
  let y = 20;
  
  // Header with beautiful styling
  doc.setFillColor(30, 58, 138); // Catholic blue
  doc.rect(0, 0, 210, 35, 'F');
  
  // Add subtle pattern to header
  doc.setFillColor(255, 255, 255);
  doc.rect(5, 5, 200, 25, 'F');
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, 22, { align: "center" });
  
  // Reset text color for content
  doc.setTextColor(0, 0, 0);
  y = 45;
  
  // Convert HTML content to beautifully formatted text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  // Process headings and content with rich formatting
  const processContent = (element, level = 0) => {
    if (element.nodeType === Node.TEXT_NODE) {
      return element.textContent;
    }
    
    let text = '';
    if (element.tagName === 'H2') {
      // Main section heading
      doc.setFillColor(124, 58, 237); // Catholic purple
      doc.rect(10, y-5, 190, 8, 'F');
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(element.textContent, 15, y);
      y += 12;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    } else if (element.tagName === 'H3') {
      // Subsection heading
      doc.setFillColor(30, 58, 138); // Catholic blue
      doc.rect(15, y-3, 180, 6, 'F');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(element.textContent, 20, y);
      y += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    } else if (element.tagName === 'H4') {
      // Minor heading
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(element.textContent, 20, y);
      y += 6;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    } else if (element.tagName === 'UL') {
      // Bullet points with styling
      y += 3;
      element.querySelectorAll('li').forEach((li, index) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        // Add colored bullet
        doc.setFillColor(217, 119, 6); // Catholic gold
        doc.circle(22, y-1, 1.5, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text(li.textContent, 28, y);
        y += 6;
      });
      y += 3;
    } else if (element.tagName === 'P') {
      // Paragraphs with proper spacing
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(element.textContent, 170);
      lines.forEach(line => {
        doc.text(line, 20, y);
        y += 5;
      });
      y += 3;
    } else if (element.tagName === 'DIV') {
      // Process child elements
      element.childNodes.forEach(child => {
        processContent(child, level + 1);
      });
    }
  };
  
  processContent(tempDiv);
  
  // Add beautiful footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(0.5);
    doc.line(20, 280, 190, 280);
    
    // Page numbers with styling
    doc.setFontSize(10);
    doc.setTextColor(124, 58, 237);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    
    // Add subtle watermark
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(8);
    doc.text("Catholic Funeral Planner", 105, 295, { align: "center" });
  }
  
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  
  // Show success message
  $('#document-modal').addClass('hidden');
  $('#pdf-status').text(`${title} PDF generated and downloaded!`).fadeIn();
  setTimeout(() => {
    $('#pdf-status').fadeOut();
  }, 3000);
}

// Generate full planning booklet with cover page
function generateFullPlanningBooklet() {
  const { hymns, readings } = getSelections();
  const churchName = $('#church-name').val() || 'Catholic Church';
  const coverImage = window.coverImageData;
  
  const doc = new window.jspdf.jsPDF();
  let y = 20;
  
  // Beautiful cover page
  doc.setFillColor(30, 58, 138); // Catholic blue
  doc.rect(0, 0, 210, 297, 'F');
  
  // Add white overlay for content area
  doc.setFillColor(255, 255, 255);
  doc.rect(10, 10, 190, 277, 'F');
  
  // Church name at top
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(churchName, 105, 60, { align: "center" });
  
  // Title
  doc.setTextColor(124, 58, 237); // Catholic purple
  doc.setFontSize(24);
  doc.text("Funeral Planning Booklet", 105, 90, { align: "center" });
  
  // Subtitle
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text("A comprehensive guide for Catholic funeral planning", 105, 110, { align: "center" });
  
  // Date
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  const today = new Date().toLocaleDateString();
  doc.text(`Generated on: ${today}`, 105, 140, { align: "center" });
  
  // Add new page for content
  doc.addPage();
  y = 20;
  
  // Content header
  doc.setFillColor(124, 58, 237); // Catholic purple
  doc.rect(0, 0, 210, 40, 'F');
  
  // Add white overlay for text
  doc.setFillColor(255, 255, 255);
  doc.rect(5, 5, 200, 30, 'F');
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text("Funeral Planning Details", 105, 25, { align: "center" });
  
  // Reset text color for content
  doc.setTextColor(0, 0, 0);
  y = 50;

  // Hymns section with beautiful styling
  doc.setFillColor(124, 58, 237); // Catholic purple
  doc.rect(10, y-8, 190, 10, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text("Selected Hymns", 15, y);
  y += 12;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  if (hymns.length === 0) {
    doc.text("No hymns selected.", 20, y);
    y += 7;
  } else {
    hymns.forEach((hymn, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      // Hymn title with styling
      doc.setFillColor(217, 119, 6); // Catholic gold
      doc.rect(15, y-3, 180, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`${index + 1}. ${hymn.title}`, 20, y);
      y += 8;
      
      // Hymn description
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`   ${hymn.description}`, 20, y);
      y += 6;
      
      // YouTube link with subtle styling
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(10);
      doc.text(`   YouTube: ${hymn.youtube}`, 20, y);
      y += 8;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
    });
  }
  
  y += 8;
  
  // Readings section with beautiful styling
  doc.setFillColor(30, 58, 138); // Catholic blue
  doc.rect(10, y-8, 190, 10, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text("Selected Readings", 15, y);
  y += 12;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  ["First Reading", "Psalm", "Second Reading", "Gospel"].forEach(type => {
    if (readings[type]) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      // Reading type with colored background
      doc.setFillColor(124, 58, 237); // Catholic purple
      doc.rect(15, y-3, 180, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`${type}:`, 20, y);
      y += 8;
      
      // Reading details
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`   ${readings[type].title} (${readings[type].ref})`, 20, y);
      y += 6;
      
      // Reading text with proper formatting
      const lines = doc.splitTextToSize(readings[type].text, 170);
      lines.forEach(line => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 5;
      });
      y += 4;
    } else {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${type}: [not selected]`, 15, y);
      y += 7;
    }
  });

  // Beautiful footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(0.5);
    doc.line(20, 280, 190, 280);
    
    // Page numbers
    doc.setFontSize(10);
    doc.setTextColor(124, 58, 237);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    
    // Watermark
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(8);
    doc.text("Catholic Funeral Planner", 105, 295, { align: "center" });
  }

  doc.save(`${churchName.replace(/\s+/g, '-')}-funeral-planning-booklet.pdf`);
  $('#pdf-status').text("Full planning booklet generated and downloaded!").fadeIn();
  setTimeout(() => {
    $('#pdf-status').fadeOut();
  }, 3000);
}

// Generate beautiful PDF with jsPDF - enhanced version
function generatePDF() {
  const { hymns, readings } = getSelections();
  const doc = new window.jspdf.jsPDF();
  let y = 20;
  
  // Beautiful header with gradient effect
  doc.setFillColor(30, 58, 138); // Catholic blue
  doc.rect(0, 0, 210, 40, 'F');
  
  // Add white overlay for text
  doc.setFillColor(255, 255, 255);
  doc.rect(5, 5, 200, 30, 'F');
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text("Catholic Funeral Plan", 105, 25, { align: "center" });
  
  // Reset text color for content
  doc.setTextColor(0, 0, 0);
  y = 50;

  // Hymns section with beautiful styling
  doc.setFillColor(124, 58, 237); // Catholic purple
  doc.rect(10, y-8, 190, 10, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text("Selected Hymns", 15, y);
  y += 12;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  if (hymns.length === 0) {
    doc.text("No hymns selected.", 20, y);
    y += 7;
  } else {
    hymns.forEach((hymn, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      // Hymn title with styling
      doc.setFillColor(217, 119, 6); // Catholic gold
      doc.rect(15, y-3, 180, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`${index + 1}. ${hymn.title}`, 20, y);
      y += 8;
      
      // Hymn description
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`   ${hymn.description}`, 20, y);
      y += 6;
      
      // YouTube link with subtle styling
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(10);
      doc.text(`   YouTube: ${hymn.youtube}`, 20, y);
      y += 8;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
    });
  }
  
  y += 8;
  
  // Readings section with beautiful styling
  doc.setFillColor(30, 58, 138); // Catholic blue
  doc.rect(10, y-8, 190, 10, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text("Selected Readings", 15, y);
  y += 12;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  ["First Reading", "Psalm", "Second Reading", "Gospel"].forEach(type => {
    if (readings[type]) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      // Reading type with colored background
      doc.setFillColor(124, 58, 237); // Catholic purple
      doc.rect(15, y-3, 180, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`${type}:`, 20, y);
      y += 8;
      
      // Reading details
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`   ${readings[type].title} (${readings[type].ref})`, 20, y);
      y += 6;
      
      // Reading text with proper formatting
      const lines = doc.splitTextToSize(readings[type].text, 170);
      lines.forEach(line => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 5;
      });
      y += 4;
    } else {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${type}: [not selected]`, 15, y);
      y += 7;
    }
  });

  // Beautiful footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(0.5);
    doc.line(20, 280, 190, 280);
    
    // Page numbers
    doc.setFontSize(10);
    doc.setTextColor(124, 58, 237);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    
    // Watermark
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(8);
    doc.text("Catholic Funeral Planner", 105, 295, { align: "center" });
  }

  doc.save("funeral-plan.pdf");
  $('#pdf-status').text("PDF generated and downloaded!").fadeIn();
  setTimeout(() => {
    $('#pdf-status').fadeOut();
  }, 2500);
}

// Generate DOCX document
function generateDOCX() {
  const { hymns, readings } = getSelections();
  const churchName = $('#church-name').val() || 'Catholic Church';
  
  // Check if docx library is available
  if (!window.docx || !window.docx.Document) {
    alert('DOCX generation is not available. Please try the PDF option instead.');
    return;
  }
  
  // Create a new document
  const doc = new window.docx.Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      children: [
        // Title
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: "Catholic Funeral Plan",
              bold: true,
              size: 32,
              color: "1e3a8a" // Catholic blue
            })
          ],
          alignment: window.docx.AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        
        // Hymns section
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: "Selected Hymns",
              bold: true,
              size: 24,
              color: "7c3aed" // Catholic purple
            })
          ],
          spacing: { before: 400, after: 200 }
        }),
        
        // Hymn list
        ...hymns.map((hymn, index) => [
          new window.docx.Paragraph({
            children: [
              new window.docx.TextRun({
                text: `${index + 1}. ${hymn.title}`,
                bold: true,
                size: 20
              })
            ],
            spacing: { before: 200 }
          }),
          new window.docx.Paragraph({
            children: [
              new window.docx.TextRun({
                text: hymn.description,
                size: 18
              })
            ],
            spacing: { before: 100 }
          }),
          new window.docx.Paragraph({
            children: [
              new window.docx.TextRun({
                text: `YouTube: ${hymn.youtube}`,
                size: 16,
                color: "666666"
              })
            ],
            spacing: { before: 100, after: 200 }
          })
        ]).flat(),
        
        // Readings section
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: "Selected Readings",
              bold: true,
              size: 24,
              color: "1e3a8a" // Catholic blue
            })
          ],
          spacing: { before: 400, after: 200 }
        }),
        
        // Reading list
        ...["First Reading", "Psalm", "Second Reading", "Gospel"].map(type => {
          if (readings[type]) {
            return [
              new window.docx.Paragraph({
                children: [
                  new window.docx.TextRun({
                    text: `${type}:`,
                    bold: true,
                    size: 20,
                    color: "7c3aed" // Catholic purple
                  })
                ],
                spacing: { before: 200 }
              }),
              new window.docx.Paragraph({
                children: [
                  new window.docx.TextRun({
                    text: `${readings[type].title} (${readings[type].ref})`,
                    size: 18
                  })
                ],
                spacing: { before: 100 }
              }),
              new window.docx.Paragraph({
                children: [
                  new window.docx.TextRun({
                    text: readings[type].text.substring(0, 200) + "...",
                    size: 16
                  })
                ],
                spacing: { before: 100, after: 200 }
              })
            ];
          } else {
            return new window.docx.Paragraph({
              children: [
                new window.docx.TextRun({
                  text: `${type}: [not selected]`,
                  size: 18,
                  color: "999999"
                })
              ],
              spacing: { before: 200, after: 200 }
            });
          }
        }).flat()
      ]
    }]
  });
  
  // Generate and download the document
  window.docx.Packer.toBlob(doc).then(blob => {
    window.saveAs(blob, `${churchName.replace(/\s+/g, '-')}-funeral-plan.docx`);
    $('#pdf-status').text("DOCX document generated and downloaded!").fadeIn();
    setTimeout(() => {
      $('#pdf-status').fadeOut();
    }, 3000);
  });
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

// Church customization functionality
function attachChurchCustomizationListeners() {
  // Cover image change
  $('#change-cover-image').on('click', function() {
    $('#cover-image-input').click();
  });
  
  $('#cover-image-preview').on('click', function() {
    $('#cover-image-input').click();
  });
  
  $('#cover-image-input').on('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        $('#cover-image-preview').html(`
          <img src="${e.target.result}" alt="Cover Image" class="w-full h-full object-cover rounded-lg">
        `);
        // Store the image data
        window.coverImageData = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Save church name to localStorage
  $('#church-name').on('input', function() {
    localStorage.setItem('church-name', $(this).val());
  });
  
  // Load saved church name
  const savedChurchName = localStorage.getItem('church-name');
  if (savedChurchName) {
    $('#church-name').val(savedChurchName);
  }
  
  // Check URL parameters for church customization
  const urlParams = new URLSearchParams(window.location.search);
  const urlChurchName = urlParams.get('church_name');
  if (urlChurchName) {
    $('#church-name').val(urlChurchName);
    localStorage.setItem('church-name', urlChurchName);
  }
}

// Contact customization functionality
function attachContactCustomizationListeners() {
  // Toggle edit mode
  $('#toggle-contact-edit').on('click', function() {
    $('#contact-view-mode').addClass('hidden');
    $('#contact-edit-mode').removeClass('hidden');
    $(this).text(t('editing'));
  });
  
  // Cancel edit
  $('#cancel-contact-edit').on('click', function() {
    $('#contact-edit-mode').addClass('hidden');
    $('#contact-view-mode').removeClass('hidden');
    $('#toggle-contact-edit').text(t('customize'));
    // Reset form to current values
    loadContactInfo();
  });
  
  // Save contact info
  $('#save-contact-info').on('click', function() {
    const contactInfo = {
      description: $('#contact-description-input').val(),
      phone: $('#contact-phone-input').val(),
      email: $('#contact-email-input').val(),
      address: $('#contact-address-input').val(),
      hours: $('#contact-hours-input').val()
    };
    
    // Save to localStorage
    localStorage.setItem('contact-info', JSON.stringify(contactInfo));
    
    // Update view mode
    updateContactDisplay(contactInfo);
    
    // Switch back to view mode
    $('#contact-edit-mode').addClass('hidden');
    $('#contact-view-mode').removeClass('hidden');
    $('#toggle-contact-edit').text(t('customize'));
    
    // Show success message
    $('#pdf-status').text(t('contact_updated')).fadeIn();
    setTimeout(() => {
      $('#pdf-status').fadeOut();
    }, 2000);
  });
  
  // Load saved contact info
  loadContactInfo();
  
  // Add URL generation button
  const urlGenButton = $('<button class="bg-catholic-purple hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition-colors ml-2">🔗 Generate URL</button>');
  $('#toggle-contact-edit').after(urlGenButton);
  
  urlGenButton.on('click', function() {
    const contactInfo = JSON.parse(localStorage.getItem('contact-info') || '{}');
    const churchName = $('#church-name').val();
    
    let customUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    
    if (churchName && churchName !== 'Catholic Church') {
      params.append('church_name', churchName);
    }
    
    if (contactInfo.description && contactInfo.description !== 'For specific guidance on Catholic funeral planning, please contact your local parish priest or funeral coordinator.') {
      params.append('contact_desc', contactInfo.description);
    }
    if (contactInfo.phone) params.append('contact_phone', contactInfo.phone);
    if (contactInfo.email) params.append('contact_email', contactInfo.email);
    if (contactInfo.address) params.append('contact_address', contactInfo.address);
    if (contactInfo.hours) params.append('contact_hours', contactInfo.hours);
    
    if (params.toString()) {
      customUrl += '?' + params.toString();
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(customUrl).then(() => {
      $('#pdf-status').text(t('url_copied')).fadeIn();
      setTimeout(() => {
        $('#pdf-status').fadeOut();
      }, 3000);
    }).catch(() => {
      // Fallback: show URL in alert
      alert('Custom URL:\n' + customUrl);
    });
  });
}

// Load contact information from localStorage or URL parameters
function loadContactInfo() {
  let contactInfo = JSON.parse(localStorage.getItem('contact-info') || '{}');
  
  // Check URL parameters for contact info
  const urlParams = new URLSearchParams(window.location.search);
  const urlContactInfo = {
    description: urlParams.get('contact_desc'),
    phone: urlParams.get('contact_phone'),
    email: urlParams.get('contact_email'),
    address: urlParams.get('contact_address'),
    hours: urlParams.get('contact_hours')
  };
  
  // Merge URL parameters with saved info (URL takes precedence)
  contactInfo = { ...contactInfo, ...urlContactInfo };
  
  // Set form values
  $('#contact-description-input').val(contactInfo.description || 'For specific guidance on Catholic funeral planning, please contact your local parish priest or funeral coordinator.');
  $('#contact-phone-input').val(contactInfo.phone || '');
  $('#contact-email-input').val(contactInfo.email || '');
  $('#contact-address-input').val(contactInfo.address || '');
  $('#contact-hours-input').val(contactInfo.hours || '');
  
  // Update display
  updateContactDisplay(contactInfo);
}

// Update contact display
function updateContactDisplay(contactInfo) {
  $('#contact-description').text(contactInfo.description || 'For specific guidance on Catholic funeral planning, please contact your local parish priest or funeral coordinator.');
  
  if (contactInfo.phone) {
    $('#contact-phone').html(`📞 <a href="tel:${contactInfo.phone}" class="hover:text-blue-800">${contactInfo.phone}</a>`);
  } else {
    $('#contact-phone').html('');
  }
  
  if (contactInfo.email) {
    $('#contact-email').html(`✉️ <a href="mailto:${contactInfo.email}" class="hover:text-blue-800">${contactInfo.email}</a>`);
  } else {
    $('#contact-email').html('');
  }
  
  if (contactInfo.address) {
    $('#contact-address').html(`📍 ${contactInfo.address}`);
  } else {
    $('#contact-address').html('');
  }
  
  if (contactInfo.hours) {
    $('#contact-hours').html(`🕒 ${contactInfo.hours}`);
  } else {
    $('#contact-hours').html('');
  }
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
  attachChurchCustomizationListeners();
  attachContactCustomizationListeners();

  $('#generate-planning-booklet').on('click', generateFullPlanningBooklet);
  $('#download-pdf').on('click', generatePDF);
  $('#download-docx').on('click', generateDOCX);
  
  // Theme filter change
  $('#theme-filter').on('change', function() {
    const currentSelections = getSavedSelections();
    renderReadings($(this).val(), currentSelections);
    // Re-attach listeners after re-rendering
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
