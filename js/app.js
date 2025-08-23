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
      <label class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
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
      </label>
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

// Document preview functionality
function attachDocumentListeners() {
  $(document).on('click', '.download-btn', function() {
    const type = $(this).data('type');
    const format = $(this).data('format');
    const template = document.getElementById(`${type}-template`);

    if (template) {
      const content = template.innerHTML;
      $('#document-content').html(content);

      if (type === 'readings') {
        // Populate readings
        const byType = groupReadings(window.readings);
        Object.keys(byType).forEach(readingType => {
          const containerId = `#readings-${readingType.toLowerCase().replace(' ', '-')}`;
          const $container = $(containerId);
          $container.empty();
          byType[readingType].forEach(reading => {
            const readingHtml = `
              <div class="border-l-4 border-catholic-blue pl-4 mb-4">
                <h4 class="font-medium">${reading.title}</h4>
                <p class="text-sm text-gray-600 mb-2">${reading.text.substring(0, 150)}...</p>
                <div class="flex flex-wrap gap-1">
                  ${(reading.theme || []).map(theme =>
                    `<span class="bg-catholic-blue text-white px-2 py-1 rounded text-xs">${theme}</span>`
                  ).join('')}
                </div>
              </div>
            `;
            $container.append(readingHtml);
          });
        });
      }

      $('#document-title').text(t(`${type}_title`));
      $('#document-modal').removeClass('hidden');

      if (format === 'pdf') {
        $('#generate-document-pdf').off('click').on('click', function() {
          generateDocumentPDF(t(`${type}_title`), $('#document-content').html());
        });
      } else if (format === 'docx') {
        // We can add a DOCX generation button here if needed
      }
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
  $('#pdf-status').text(t('pdf_generated', { title })).fadeIn();
  setTimeout(() => {
    $('#pdf-status').fadeOut();
  }, 3000);
}

// Generate full planning booklet with cover page
function generateFullPlanningBooklet() {
  const { hymns, readings } = getSelections();
  const churchName = $('#church-name').val() || t('church_name');
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
  doc.text(t('funeral_planning_booklet'), 105, 90, { align: "center" });
  
  // Subtitle
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(t('comprehensive_guide'), 105, 110, { align: "center" });
  
  // Contact Information on cover page
  const contactInfo = JSON.parse(localStorage.getItem('contact-info') || '{}');
  if (contactInfo.phone || contactInfo.email || contactInfo.address || contactInfo.hours) {
    y = 140;
    doc.setFillColor(124, 58, 237); // Catholic purple
    doc.rect(20, y-5, 170, 8, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(t('contact_information'), 25, y);
    y += 12;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    if (contactInfo.phone) {
      doc.text(`📞 ${t('phone_number')}: ${contactInfo.phone}`, 25, y);
      y += 5;
    }
    if (contactInfo.email) {
      doc.text(`✉️ ${t('email_address')}: ${contactInfo.email}`, 25, y);
      y += 5;
    }
    if (contactInfo.address) {
      doc.text(`📍 ${t('address')}: ${contactInfo.address}`, 25, y);
      y += 5;
    }
    if (contactInfo.hours) {
      doc.text(`🕒 ${t('office_hours')}: ${contactInfo.hours}`, 25, y);
      y += 5;
    }
    
    y += 10;
  }
  
  // Date
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  const today = new Date().toLocaleDateString();
  doc.text(`${t('generated_on')}: ${today}`, 105, y, { align: "center" });
  
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
  doc.text(t('funeral_planning_details'), 105, 25, { align: "center" });
  
  // Reset text color for content
  doc.setTextColor(0, 0, 0);
  y = 50;
  
  // Contact Information Section
  if (contactInfo.phone || contactInfo.email || contactInfo.address || contactInfo.hours) {
    doc.setFillColor(30, 58, 138); // Catholic blue
    doc.rect(10, y-8, 190, 10, 'F');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(t('contact_information'), 15, y);
    y += 12;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    if (contactInfo.phone) {
      doc.text(`📞 ${t('phone_number')}: ${contactInfo.phone}`, 20, y);
      y += 6;
    }
    if (contactInfo.email) {
      doc.text(`✉️ ${t('email_address')}: ${contactInfo.email}`, 20, y);
      y += 6;
    }
    if (contactInfo.address) {
      doc.text(`📍 ${t('address')}: ${contactInfo.address}`, 20, y);
      y += 6;
    }
    if (contactInfo.hours) {
      doc.text(`🕒 ${t('office_hours')}: ${contactInfo.hours}`, 20, y);
      y += 6;
    }
    
    y += 8;
  }

  // Order of Service Section
  doc.setFillColor(124, 58, 237); // Catholic purple
  doc.rect(10, y-8, 190, 10, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(t('order_of_service'), 15, y);
  y += 12;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Funeral Mass Order
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(t('funeral_mass_full_service'), 15, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`1. ${t('reception_of_body')}`, 20, y);
  y += 5;
  doc.text(`2. ${t('opening_prayer')}`, 20, y);
  y += 5;
  doc.text(`3. ${t('liturgy_of_the_word')}`, 20, y);
  y += 5;
  doc.text(`   • ${t('first_reading')}`, 25, y);
  y += 5;
  doc.text(`   • ${t('responsorial_psalm')}`, 25, y);
  y += 5;
  doc.text(`   • ${t('second_reading')}`, 25, y);
  y += 5;
  doc.text(`   • ${t('gospel_acclamation')}`, 25, y);
  y += 5;
  doc.text(`   • ${t('gospel_reading')}`, 25, y);
  y += 5;
  doc.text(`   • ${t('homily')}`, 25, y);
  y += 5;
  doc.text(`4. ${t('liturgy_of_the_eucharist')}`, 20, y);
  y += 5;
  doc.text(`   • ${t('preparation_of_gifts')}`, 25, y);
  y += 5;
  doc.text(`   • ${t('eucharistic_prayer')}`, 25, y);
  y += 5;
  doc.text(`   • ${t('communion')}`, 25, y);
  y += 5;
  doc.text(`5. ${t('final_commendation')}`, 20, y);
  y += 5;
  doc.text(`6. ${t('procession_to_committal')}`, 20, y);
  y += 8;
  
  // Funeral Service Order (without Eucharist)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(t('funeral_service_without_eucharist'), 15, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`1. ${t('reception_of_body')}`, 20, y);
  y += 5;
  doc.text(`2. ${t('opening_prayer')}`, 20, y);
  y += 5;
  doc.text(`3. ${t('liturgy_of_the_word')}`, 20, y);
  y += 5;
  doc.text(`   • ${t('first_reading')}`, 25, y);
  y += 5;
  doc.text(`   • ${t('responsorial_psalm')}`, 25, y);
  y += 5;
  doc.text(`   • ${t('second_reading')}`, 25, y);
  y += 5;
  doc.text(`   • ${t('gospel_acclamation')}`, 25, y);
  y += 5;
  doc.text(`   • ${t('gospel_reading')}`, 25, y);
  y += 5;
  doc.text(`   • ${t('homily')}`, 25, y);
  y += 5;
  doc.text(`4. ${t('final_commendation')}`, 20, y);
  y += 5;
  doc.text(`5. ${t('procession_to_committal')}`, 20, y);
  y += 8;
  
  // Vigil Order
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(t('vigil_service_evening_before'), 15, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`1. ${t('opening_prayer')}`, 20, y);
  y += 5;
  doc.text(`2. ${t('scripture_reading')}`, 20, y);
  y += 5;
  doc.text(`3. ${t('responsorial_psalm')}`, 20, y);
  y += 5;
  doc.text(`4. ${t('gospel_reading')}`, 20, y);
  y += 5;
  doc.text(`5. ${t('homily_or_reflection')}`, 20, y);
  y += 5;
  doc.text(`6. ${t('intercessions')}`, 20, y);
  y += 5;
  doc.text(`7. ${t('lords_prayer')}`, 20, y);
  y += 5;
  doc.text(`8. ${t('final_blessing')}`, 20, y);
  y += 8;

  // Hymns section with beautiful styling
  doc.setFillColor(124, 58, 237); // Catholic purple
  doc.rect(10, y-8, 190, 10, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(t('selected_hymns'), 15, y);
  y += 12;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  if (hymns.length === 0) {
    doc.text(t('no_hymns_selected'), 20, y);
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
  doc.text(t('selected_readings'), 15, y);
  y += 12;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  [t('first_reading'), t('psalm'), t('second_reading'), t('gospel')].forEach(type => {
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
      doc.text(`${type}: [${t('not_selected')}]`, 15, y);
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
    doc.text(`${t('page')} ${i} ${t('of')} ${pageCount}`, 105, 290, { align: "center" });
    
    // Watermark
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(8);
    doc.text(t('catholic_funeral_planner'), 105, 295, { align: "center" });
  }

  doc.save(`${churchName.replace(/\s+/g, '-')}-funeral-planning-booklet.pdf`);
  $('#pdf-status').text(t('full_planning_booklet_generated')).fadeIn();
  setTimeout(() => {
    $('#pdf-status').fadeOut();
  }, 3000);
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
}

// Generate DOCX for individual documents
function generateDocumentDOCX(type) {
  // Check if docx library is available
  if (!window.docx || !window.docx.Document) {
    // Try to load the library dynamically
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/docx@8.5.0/build/index.js';
    script.onload = function() {
      // Retry after library loads
      setTimeout(() => generateDocumentDOCX(type), 100);
    };
    script.onerror = function() {
      alert('DOCX generation is not available. Please try the PDF option instead.');
    };
    document.head.appendChild(script);
    return;
  }
  
  const content = documentContents[type];
  if (!content) {
    alert('Document content not found.');
    return;
  }
  
  // Create a new document
  const doc = new window.docx.Document({
    sections: [{
      properties: {},
      children: [
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: content.title,
              bold: true,
              size: 32
            })
          ],
          spacing: { after: 400 }
        }),
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: content.content.replace(/<[^>]*>/g, ''), // Remove HTML tags
              size: 24
            })
          ]
        })
      ]
    }]
  });
  
  // Generate and save the document
  window.docx.Packer.toBlob(doc).then(blob => {
    const fileName = `${type}_document.docx`;
    saveAs(blob, fileName);
  });
}

// Generate DOCX for full planning booklet
function generateFullPlanningBookletDOCX() {
  const { hymns, readings } = getSelections();
  const churchName = $('#church-name').val() || t('church_name');
  
  // Check if docx library is available
  if (!window.docx || !window.docx.Document) {
    // Try to load the library dynamically
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/docx@8.5.0/build/index.js';
    script.onload = function() {
      // Retry after library loads
      setTimeout(() => generateFullPlanningBookletDOCX(), 100);
    };
    script.onerror = function() {
      alert(t('docx_generation_not_available'));
    };
    document.head.appendChild(script);
    return;
  }
  
  // Create document sections
  const children = [];
  
  // Title page
  children.push(
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: t('funeral_planning_booklet'),
          bold: true,
          size: 48
        })
      ],
      spacing: { after: 400, before: 200 },
      alignment: window.docx.AlignmentType.CENTER
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: churchName,
          bold: true,
          size: 36
        })
      ],
      spacing: { after: 600 },
      alignment: window.docx.AlignmentType.CENTER
    })
  );
  
  // Contact Information
  const contactInfo = JSON.parse(localStorage.getItem('contact-info') || '{}');
  if (contactInfo.phone || contactInfo.email || contactInfo.address || contactInfo.hours) {
    children.push(
      new window.docx.Paragraph({
        children: [
          new window.docx.TextRun({
            text: t('contact_information'),
            bold: true,
            size: 32
          })
        ],
        spacing: { after: 200, before: 400 }
      })
    );
    
    if (contactInfo.phone) {
      children.push(
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: `📞 ${t('phone_number')}: ${contactInfo.phone}`,
              size: 24
            })
          ],
          spacing: { after: 100 }
        })
      );
    }
    
    if (contactInfo.email) {
      children.push(
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: `✉️ ${t('email_address')}: ${contactInfo.email}`,
              size: 24
            })
          ],
          spacing: { after: 100 }
        })
      );
    }
    
    if (contactInfo.address) {
      children.push(
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: `📍 ${t('address')}: ${contactInfo.address}`,
              size: 24
            })
          ],
          spacing: { after: 100 }
        })
      );
    }
    
    if (contactInfo.hours) {
      children.push(
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: `🕒 ${t('office_hours')}: ${contactInfo.hours}`,
              size: 24
            })
          ],
          spacing: { after: 200 }
        })
      );
    }
  }
  
  // Order of Service Section
  children.push(
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: t('order_of_service'),
          bold: true,
          size: 32
        })
      ],
      spacing: { after: 200, before: 400 }
    })
  );
  
  // Funeral Mass Order
  children.push(
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: t('funeral_mass_full_service'),
          bold: true,
          size: 28
        })
      ],
      spacing: { after: 150 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `1. ${t('reception_of_body')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `2. ${t('opening_prayer')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `3. ${t('liturgy_of_the_word')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('first_reading')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('responsorial_psalm')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('second_reading')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('gospel_acclamation')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('gospel_reading')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('homily')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `4. ${t('liturgy_of_the_eucharist')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('preparation_of_gifts')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('eucharistic_prayer')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('communion')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `5. ${t('final_commendation')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `6. ${t('procession_to_committal')}`,
          size: 24
        })
      ],
      spacing: { after: 150 }
    })
  );
  
  // Funeral Service Order (without Eucharist)
  children.push(
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: t('funeral_service_without_eucharist'),
          bold: true,
          size: 28
        })
      ],
      spacing: { after: 150 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `1. ${t('reception_of_body')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `2. ${t('opening_prayer')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `3. ${t('liturgy_of_the_word')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('first_reading')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('responsorial_psalm')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('second_reading')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('gospel_acclamation')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('gospel_reading')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `   • ${t('homily')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `4. ${t('final_commendation')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `5. ${t('procession_to_committal')}`,
          size: 24
        })
      ],
      spacing: { after: 150 }
    })
  );
  
  // Vigil Order
  children.push(
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: t('vigil_service_evening_before'),
          bold: true,
          size: 28
        })
      ],
      spacing: { after: 150 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `1. ${t('opening_prayer')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `2. ${t('scripture_reading')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `3. ${t('responsorial_psalm')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `4. ${t('gospel_reading')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `5. ${t('homily_or_reflection')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `6. ${t('intercessions')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `7. ${t('lords_prayer')}`,
          size: 24
        })
      ],
      spacing: { after: 100 }
    }),
    new window.docx.Paragraph({
      children: [
        new window.docx.TextRun({
          text: `8. ${t('final_blessing')}`,
          size: 24
        })
      ],
      spacing: { after: 150 }
    })
  );
  
  // Hymns section
  if (hymns.length > 0) {
    children.push(
      new window.docx.Paragraph({
        children: [
          new window.docx.TextRun({
            text: t('selected_hymns'),
            bold: true,
            size: 32
          })
        ],
        spacing: { after: 200, before: 400 }
      })
    );
    
    hymns.forEach(hymn => {
      children.push(
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: hymn.title,
              bold: true,
              size: 28
            })
          ],
          spacing: { after: 100 }
        }),
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: hymn.description,
              size: 24
            })
          ],
          spacing: { after: 100 }
        })
      );
    });
  }
  
  // Readings section
  if (readings.length > 0) {
    children.push(
      new window.docx.Paragraph({
        children: [
          new window.docx.TextRun({
            text: t('selected_readings'),
            bold: true,
            size: 32
          })
        ],
        spacing: { after: 200, before: 400 }
      })
    );
    
    readings.forEach(reading => {
      children.push(
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: `${t(reading.type.toLowerCase().replace(' ', '_'))}: ${reading.title}`,
              bold: true,
              size: 28
            })
          ],
          spacing: { after: 100 }
        }),
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: reading.reference,
              size: 24
            })
          ],
          spacing: { after: 100 }
        })
      );
    });
  }
  
  // Create the document
  const doc = new window.docx.Document({
    sections: [{
      properties: {},
      children: children
    }]
  });
  
  // Generate and save the document
  window.docx.Packer.toBlob(doc).then(blob => {
    const fileName = `funeral_planning_booklet_${churchName.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    saveAs(blob, fileName);
  });
}
  
  // Load saved contact info
  loadContactInfo();
  
  // Add URL generation button
  const urlGenButton = $('<button class="bg-catholic-purple hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition-colors ml-2">' + t('generate_url') + '</button>');
  $('#toggle-contact-edit').after(urlGenButton);
  
  // Order of Service toggle functionality
  $('.service-type-btn').on('click', function() {
    const serviceType = $(this).data('service');
    
    // Update button styles
    $('.service-type-btn').removeClass('bg-catholic-blue text-white').addClass('bg-gray-200 text-gray-700');
    $(this).removeClass('bg-gray-200 text-gray-700').addClass('bg-catholic-blue text-white');
    
    // Hide all service details
    $('.service-details').addClass('hidden');
    
    // Show selected service details
    if (serviceType === 'funeral-mass') {
      $('#funeral-mass-details').removeClass('hidden');
    } else if (serviceType === 'funeral-service') {
      $('#funeral-service-details').removeClass('hidden');
    } else if (serviceType === 'vigil') {
      $('#vigil-details').removeClass('hidden');
    }
  });
  
  // Download button hover functionality
  $('.download-btn').each(function() {
    const $button = $(this);
    const $dropdown = $button.closest('.flex').find('.relative');
    
    $dropdown.on('mouseenter', function() {
      $(this).find('.absolute').removeClass('hidden');
    });
    
    $dropdown.on('mouseleave', function() {
      $(this).find('.absolute').addClass('hidden');
    });
  });
  
  // Update download button text when format changes
  $(document).on('click', '.download-btn', function() {
    const format = $(this).data('format');
    const $mainButton = $(this).closest('.flex').find('.download-btn').first();
    
    if (format === 'pdf') {
      $mainButton.html('Download <span class="font-bold">PDF</span>');
    } else if (format === 'docx') {
      $mainButton.html('Download <span class="font-bold">DOCX</span>');
    }
  });
  
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

  $('#download-pdf').on('click', generateFullPlanningBooklet);
  $('#download-docx').on('click', generateFullPlanningBookletDOCX);
  
  // Theme filter change
  $('#theme-filter').on('change', function() {
    const currentSelections = getSavedSelections();
    renderReadings($(this).val(), currentSelections);
    // Re-attach listeners after re-rendering
    attachReadingListeners();
    // Mark current selections as checked
    currentSelections.readings.forEach(reading => {
      const checkbox = $(`input[data-reading-id="${reading.id}"]`);
      if (checkbox.length) {
        checkbox.prop('checked', true);
      }
    });
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
