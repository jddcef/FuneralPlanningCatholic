const watermarkSVG = '<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M40,0 L60,0 L60,40 L100,40 L100,60 L60,60 L60,100 L40,100 L40,60 L0,60 L0,40 L40,40 Z" fill="#EAEAEA"/></svg>';

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

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
      const checked = saved && saved.readingIds && saved.readingIds[type] === r.id;
      
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
  if (!sel) return { hymns: [], hymnIdxs: [], readings: {}, readingIds: {} };
  
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
    displayDefaultBooklet();
  });
}

function attachReadingListeners() {
  $(document).on('change', 'input[type="radio"][name^="reading-"]', function() {
    const selections = getSelections();
    saveSelections({
      hymns: selections.hymnIdxs,
      readings: selections.readingIds
    });
    displayDefaultBooklet();
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

      const title = t(`${type}_title`);
      const docContent = $('#document-content').html();

      if (format === 'pdf') {
        $('#generate-document-pdf').off('click').on('click', function() {
          generateDocumentPDF(title, docContent, type);
        });
        $('#generate-document-pdf').text('Generate PDF');
      } else if (format === 'docx') {
        $('#generate-document-pdf').off('click').on('click', function() {
          generateDocumentDOCX(type, title, docContent);
        });
        $('#generate-document-pdf').text('Generate DOCX');
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
}

// Generate beautiful PDF for specific documents with rich formatting
function generateDocumentPDF(title, content, type) {
  const doc = new window.jspdf.jsPDF();
  let y = 20;

  const _addPage = () => {
    doc.addPage();
    try {
      doc.addImage(watermarkSVG, 'SVG', 60, 100, 90, 90, 'watermark', 'NONE');
    } catch (e) {
      // Fallback to text watermark if SVG fails
      doc.saveGraphicsState();
      let watermarkText = t('catholic_funeral_planner');
      if (type === 'checklist') watermarkText = t('checklist_title');
      else if (type === 'program') watermarkText = t('program_title');
      else if (type === 'readings') watermarkText = t('readings_title');
      else if (type === 'vigil') watermarkText = t('vigil_title_download');
      doc.setFontSize(50);
      doc.setTextColor(235, 235, 235);
      doc.setFont('helvetica', 'bold');
      doc.text(watermarkText, 105, 160, { align: 'center', angle: -45 });
      doc.restoreGraphicsState();
    }
    return 20; // Return new y position
  };

  const _checkPageBreak = (currentY) => {
    if (currentY > 270) {
      return _addPage();
    }
    return currentY;
  };

  // Header with beautiful styling
  doc.setFillColor(30, 58, 138); // Catholic blue
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, 22, { align: "center" });

  // Reset text color for content
  doc.setTextColor(0, 0, 0);
  y = 45;

  // Add watermark to first page
  try {
    doc.addImage(watermarkSVG, 'SVG', 60, 100, 90, 90, 'watermark', 'NONE');
  } catch(e) { /* fallback handled in _addPage */ }


  // Convert HTML content to beautifully formatted text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  // Process headings and content with rich formatting
  const processContent = (element) => {
    if (!element) return;

    if (element.nodeType === Node.TEXT_NODE) {
      const lines = doc.splitTextToSize(element.textContent, 170);
      lines.forEach(line => {
        y = _checkPageBreak(y);
        doc.text(line, 20, y);
        y += 5;
      });
      return;
    }

    const tagName = element.tagName;
    if (tagName === 'H2') {
      y = _checkPageBreak(y);
      doc.setFillColor(124, 58, 237); // Catholic purple
      doc.rect(10, y - 5, 190, 10, 'F');
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(element.textContent, 105, y, { align: 'center', baseline: 'middle' });
      y += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    } else if (tagName === 'H3') {
      y = _checkPageBreak(y);
      doc.setFillColor(30, 58, 138); // Catholic blue
      doc.rect(15, y - 3, 180, 8, 'F');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(element.textContent, 20, y + 1, { baseline: 'middle' });
      y += 12;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    } else if (tagName === 'H4') {
      y = _checkPageBreak(y);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text(element.textContent, 20, y);
      y += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    } else if (tagName === 'UL') {
      y += 3;
      element.querySelectorAll('li').forEach((li) => {
        y = _checkPageBreak(y);
        doc.setFillColor(217, 119, 6); // Catholic gold
        doc.circle(22, y - 1, 1.5, 'F');
        doc.setTextColor(0, 0, 0);
        const lines = doc.splitTextToSize(li.textContent, 160);
        lines.forEach(line => {
          doc.text(line, 28, y);
          y += 6;
          y = _checkPageBreak(y);
        });
      });
      y += 3;
    } else if (tagName === 'P') {
      y = _checkPageBreak(y);
      const lines = doc.splitTextToSize(element.textContent, 170);
      lines.forEach(line => {
        doc.text(line, 20, y);
        y += 5;
        y = _checkPageBreak(y);
      });
      y += 3;
    } else {
      // Process child elements for other tags like DIV
      element.childNodes.forEach(child => {
        processContent(child);
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
    doc.text(`${t('page')} ${i} ${t('of')} ${pageCount}`, 105, 290, { align: "center" });

    // Add subtle footer watermark
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.text(t('catholic_funeral_planner'), 105, 295, { align: "center" });
  }

  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);

  // Show success message
  $('#document-modal').addClass('hidden');
  $('#pdf-status').text(t('pdf_generated')).fadeIn();
  setTimeout(() => {
    $('#pdf-status').fadeOut();
  }, 3000);
}

// Generate full planning booklet with cover page
function generateFullPlanningBooklet(outputType = 'save') {
  const { hymns, readings } = getSelections();
  const churchName = $('#church-name').val() || t('church_name');
  const coverImage = window.coverImageData;

  const doc = new window.jspdf.jsPDF();
  let y = 20;

  const _addPage = () => {
    doc.addPage();
    try {
      doc.addImage(watermarkSVG, 'SVG', 60, 100, 90, 90, 'watermark', 'NONE');
    } catch (e) {
      // Fallback to text watermark if SVG fails
      doc.saveGraphicsState();
      doc.setFontSize(50);
      doc.setTextColor(235, 235, 235);
      doc.setFont('helvetica', 'bold');
      doc.text(t('funeral_planning_booklet'), 105, 160, { align: 'center', angle: -45 });
      doc.restoreGraphicsState();
    }
    return 20; // Return new y position
  };

  const _checkPageBreak = (currentY) => {
    if (currentY > 270) {
      return _addPage();
    }
    return currentY;
  };

  // Beautiful cover page
  doc.setFillColor(30, 58, 138); // Catholic blue
  doc.rect(0, 0, 210, 297, 'F');

  // Add white overlay for content area
  doc.setFillColor(255, 255, 255);
  doc.rect(10, 10, 190, 277, 'F');

  // Add border
  doc.setDrawColor(217, 119, 6); // Catholic gold
  doc.setLineWidth(1.5);
  doc.rect(12, 12, 186, 273);

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
  y = 140;
  if (contactInfo.phone || contactInfo.email || contactInfo.address || contactInfo.hours) {
    doc.setFillColor(124, 58, 237); // Catholic purple
    doc.rect(20, y - 5, 170, 8, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(t('contact_information'), 105, y, { align: 'center' });
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
      const addressLines = doc.splitTextToSize(contactInfo.address, 160);
      doc.text(`📍 ${t('address')}:`, 25, y);
      addressLines.forEach(line => {
        doc.text(line, 35, y);
        y += 5;
      });
    }
    if (contactInfo.hours) {
      doc.text(`🕒 ${t('office_hours')}: ${contactInfo.hours}`, 25, y);
      y += 5;
    }
    y += 5;
  }

  // Date
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  const today = new Date().toLocaleDateString();
  doc.text(`${t('generated_on')}: ${today}`, 105, 250, { align: "center" });

  // Add new page for content
  y = _addPage();

  // Content header
  doc.setFillColor(124, 58, 237); // Catholic purple
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
    doc.rect(10, y - 8, 190, 10, 'F');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(t('contact_information'), 15, y);
    y += 12;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    if (contactInfo.phone) {
      y = _checkPageBreak(y); doc.text(`📞 ${t('phone_number')}: ${contactInfo.phone}`, 20, y); y += 6;
    }
    if (contactInfo.email) {
      y = _checkPageBreak(y); doc.text(`✉️ ${t('email_address')}: ${contactInfo.email}`, 20, y); y += 6;
    }
    if (contactInfo.address) {
      y = _checkPageBreak(y);
      const addressLines = doc.splitTextToSize(contactInfo.address, 170);
      doc.text(`📍 ${t('address')}:`, 20, y);
      addressLines.forEach(line => {
        doc.text(line, 30, y);
        y += 6;
        y = _checkPageBreak(y);
      });
    }
    if (contactInfo.hours) {
      y = _checkPageBreak(y); doc.text(`🕒 ${t('office_hours')}: ${contactInfo.hours}`, 20, y); y += 6;
    }
    y += 8;
  }

  // Order of Service Section
  y = _checkPageBreak(y);
  doc.setFillColor(124, 58, 237); // Catholic purple
  doc.rect(10, y - 8, 190, 10, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(t('order_of_service'), 15, y);
  y += 12;

  // Funeral Mass Order
  y = _checkPageBreak(y);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(t('funeral_mass_full_service'), 15, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const massOrder = [
    `1. ${t('reception_of_body')}`, `2. ${t('opening_prayer')}`, `3. ${t('liturgy_of_the_word')}`,
    `   • ${t('first_reading')}`, `   • ${t('responsorial_psalm')}`, `   • ${t('second_reading')}`,
    `   • ${t('gospel_acclamation')}`, `   • ${t('gospel_reading')}`, `   • ${t('homily')}`,
    `4. ${t('liturgy_of_the_eucharist')}`, `   • ${t('preparation_of_gifts')}`, `   • ${t('eucharistic_prayer')}`,
    `   • ${t('communion')}`, `5. ${t('final_commendation')}`, `6. ${t('procession_to_committal')}`
  ];
  massOrder.forEach(item => { y = _checkPageBreak(y); doc.text(item, item.startsWith(' ') ? 25 : 20, y); y += 5; });
  y += 8;

  // Funeral Service Order
  y = _checkPageBreak(y);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(t('funeral_service_without_eucharist'), 15, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const serviceOrder = [
    `1. ${t('reception_of_body')}`, `2. ${t('opening_prayer')}`, `3. ${t('liturgy_of_the_word')}`,
    `   • ${t('first_reading')}`, `   • ${t('responsorial_psalm')}`, `   • ${t('second_reading')}`,
    `   • ${t('gospel_acclamation')}`, `   • ${t('gospel_reading')}`, `   • ${t('homily')}`,
    `4. ${t('final_commendation')}`, `5. ${t('procession_to_committal')}`
  ];
  serviceOrder.forEach(item => { y = _checkPageBreak(y); doc.text(item, item.startsWith(' ') ? 25 : 20, y); y += 5; });
  y += 8;

  // Vigil Order
  y = _checkPageBreak(y);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(t('vigil_service_evening_before'), 15, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const vigilOrder = [
    `1. ${t('opening_prayer')}`, `2. ${t('scripture_reading')}`, `3. ${t('responsorial_psalm')}`,
    `4. ${t('gospel_reading')}`, `5. ${t('homily_or_reflection')}`, `6. ${t('intercessions')}`,
    `7. ${t('lords_prayer')}`, `8. ${t('final_blessing')}`
  ];
  vigilOrder.forEach(item => { y = _checkPageBreak(y); doc.text(item, 20, y); y += 5; });
  y += 8;

  // Hymns section
  y = _checkPageBreak(y);
  doc.setFillColor(124, 58, 237); // Catholic purple
  doc.rect(10, y - 8, 190, 10, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(t('selected_hymns'), 15, y);
  y += 12;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  if (hymns.length === 0) {
    y = _checkPageBreak(y);
    doc.text(t('no_hymns_selected'), 20, y);
    y += 7;
  } else {
    hymns.forEach((hymn, index) => {
      y = _checkPageBreak(y);
      doc.setFillColor(217, 119, 6); // Catholic gold
      doc.rect(15, y - 3, 180, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`${index + 1}. ${hymn.title}`, 20, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const hymnDescLines = doc.splitTextToSize(hymn.description, 170);
      hymnDescLines.forEach(line => {
        y = _checkPageBreak(y);
        doc.text(line, 25, y);
        y += 5;
      });

      doc.setTextColor(128, 128, 128);
      doc.setFontSize(10);
      y = _checkPageBreak(y);
      doc.text(`YouTube: ${hymn.youtube}`, 25, y);
      y += 8;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
    });
  }
  y += 8;

  // Readings section
  y = _checkPageBreak(y);
  doc.setFillColor(30, 58, 138); // Catholic blue
  doc.rect(10, y - 8, 190, 10, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(t('selected_readings'), 15, y);
  y += 12;

  const readingTypes = Object.keys(readings);
  if (readingTypes.length === 0) {
    y = _checkPageBreak(y);
    doc.text(t('no_readings_selected'), 20, y);
    y+= 7;
  } else {
    readingTypes.forEach(type => {
      const reading = readings[type];
      if (reading) {
        y = _checkPageBreak(y);
        doc.setFillColor(124, 58, 237); // Catholic purple
        doc.rect(15, y - 3, 180, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`${t(type.toLowerCase().replace(/\s/g, '_'))}: ${reading.title} (${reading.ref})`, 20, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const lines = doc.splitTextToSize(reading.text, 170);
        lines.forEach(line => {
          y = _checkPageBreak(y);
          doc.text(line, 20, y);
          y += 5;
        });
        y += 4;
      }
    });
  }

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

    // Footer watermark
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.text(t('catholic_funeral_planner'), 105, 295, { align: "center" });
  }

  if (outputType === 'save') {
    doc.save(`${churchName.replace(/\s+/g, '-')}-funeral-planning-booklet.pdf`);
    $('#pdf-status').text(t('full_planning_booklet_generated')).fadeIn();
    setTimeout(() => {
      $('#pdf-status').fadeOut();
    }, 3000);
  } else if (outputType === 'arraybuffer') {
    return doc.output('arraybuffer');
  } else {
    return doc.output('datauristring');
  }
}

async function displayDefaultBooklet() {
  const viewer = document.getElementById('pdf-viewer');
  if (!viewer || !window.pdfjsLib) {
    if (viewer) viewer.innerHTML = '<p>Preview is not available.</p>';
    return;
  }

  viewer.innerHTML = `<div class="text-center p-8"><p class="text-lg text-gray-600">${t('generating_preview')}...</p></div>`;

  try {
    const pdfOutput = generateFullPlanningBooklet('arraybuffer');
    const loadingTask = pdfjsLib.getDocument({ data: pdfOutput });
    const pdf = await loadingTask.promise;

    viewer.innerHTML = ''; // Clear loading message
    const scale = 1.2;

    // Render pages in spreads (2 pages side-by-side)
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.classList.add('shadow-xl', 'mb-4');

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      await page.render(renderContext).promise;

      viewer.appendChild(canvas);
    }
  } catch (error) {
    viewer.innerHTML = `<div class="text-center p-8"><p class="text-red-600">${t('preview_error')}</p></div>`;
  }
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
    displayDefaultBooklet();
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
        displayDefaultBooklet();
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Save church name to localStorage
  $('#church-name').on('input', function() {
    localStorage.setItem('church-name', $(this).val());
    displayDefaultBooklet();
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
    displayDefaultBooklet();
  });
}

// Generate DOCX for individual documents
function generateDocumentDOCX(type, title, content) {
  // Check if docx library is available
  if (!window.docx) {
    alert('DOCX generation is not available. Please try again in a few moments.');
    return;
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  const doc = new window.docx.Document({
    sections: [{
      properties: {},
      children: [
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: title,
              bold: true,
              size: 32
            })
          ],
          spacing: { after: 400 }
        }),
        new window.docx.Paragraph({
          children: [
            new window.docx.TextRun({
              text: tempDiv.textContent.replace(/<[^>]*>/g, ''), // Basic HTML tag removal
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
  const contactInfo = JSON.parse(localStorage.getItem('contact-info') || '{}');

  if (!window.docx) {
    alert(t('docx_generation_not_available'));
    return;
  }

  const { Paragraph, TextRun, HeadingLevel, AlignmentType, ShadingType, Packer } = window.docx;

  const CATHOLIC_BLUE = "1e3a8a";
  const CATHOLIC_PURPLE = "7c3aed";
  const CATHOLIC_GOLD = "d97706";
  const WHITE = "FFFFFF";
  const BLACK = "000000";
  const GREY = "808080";

  const docChildren = [];

  // Helper to create a shaded title paragraph
  const createSectionTitle = (text, color) => new Paragraph({
    children: [new TextRun({ text, bold: true, size: 32, color: WHITE })],
    shading: { type: ShadingType.CLEAR, fill: color },
    spacing: { before: 400, after: 200 },
  });

  // --- Cover Page ---
  docChildren.push(
    new Paragraph({ text: churchName, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
    new Paragraph({
      children: [new TextRun({ text: t('funeral_planning_booklet'), bold: true, size: 48, color: CATHOLIC_BLUE })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [new TextRun({ text: t('comprehensive_guide'), size: 28, italics: true, color: GREY })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 }
    })
  );

  if (contactInfo.phone || contactInfo.email || contactInfo.address || contactInfo.hours) {
    docChildren.push(createSectionTitle(t('contact_information'), CATHOLIC_PURPLE));
    if (contactInfo.phone) docChildren.push(new Paragraph({ text: `📞 ${t('phone_number')}: ${contactInfo.phone}` }));
    if (contactInfo.email) docChildren.push(new Paragraph({ text: `✉️ ${t('email_address')}: ${contactInfo.email}` }));
    if (contactInfo.address) docChildren.push(new Paragraph({ text: `📍 ${t('address')}: ${contactInfo.address}` }));
    if (contactInfo.hours) docChildren.push(new Paragraph({ text: `🕒 ${t('office_hours')}: ${contactInfo.hours}` }));
  }
  docChildren.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] })); // Page break

  // --- Order of Service ---
  docChildren.push(createSectionTitle(t('order_of_service'), CATHOLIC_PURPLE));
  const createServiceList = (title, items) => {
    docChildren.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
    items.forEach(item => {
      docChildren.push(new Paragraph({
        text: item.text,
        bullet: { level: item.level },
        style: "ListParagraph"
      }));
    });
  };

  createServiceList(t('funeral_mass_full_service'), [
    { text: t('reception_of_body'), level: 0 }, { text: t('opening_prayer'), level: 0 }, { text: t('liturgy_of_the_word'), level: 0 },
    { text: t('first_reading'), level: 1 }, { text: t('responsorial_psalm'), level: 1 }, { text: t('second_reading'), level: 1 },
    { text: t('gospel_acclamation'), level: 1 }, { text: t('gospel_reading'), level: 1 }, { text: t('homily'), level: 1 },
    { text: t('liturgy_of_the_eucharist'), level: 0 }, { text: t('preparation_of_gifts'), level: 1 }, { text: t('eucharistic_prayer'), level: 1 },
    { text: t('communion'), level: 1 }, { text: t('final_commendation'), level: 0 }, { text: t('procession_to_committal'), level: 0 }
  ]);

  createServiceList(t('funeral_service_without_eucharist'), [
     { text: t('reception_of_body'), level: 0 }, { text: t('opening_prayer'), level: 0 }, { text: t('liturgy_of_the_word'), level: 0 },
     { text: t('first_reading'), level: 1 }, { text: t('responsorial_psalm'), level: 1 }, { text: t('second_reading'), level: 1 },
     { text: t('gospel_acclamation'), level: 1 }, { text: t('gospel_reading'), level: 1 }, { text: t('homily'), level: 1 },
     { text: t('final_commendation'), level: 0 }, { text: t('procession_to_committal'), level: 0 }
  ]);
  
  createServiceList(t('vigil_service_evening_before'), [
      { text: t('opening_prayer'), level: 0 }, { text: t('scripture_reading'), level: 0 }, { text: t('responsorial_psalm'), level: 0 },
      { text: t('gospel_reading'), level: 0 }, { text: t('homily_or_reflection'), level: 0 }, { text: t('intercessions'), level: 0 },
      { text: t('lords_prayer'), level: 0 }, { text: t('final_blessing'), level: 0 }
  ]);

  // --- Hymns ---
  if (hymns.length > 0) {
    docChildren.push(createSectionTitle(t('selected_hymns'), CATHOLIC_GOLD));
    hymns.forEach(hymn => {
      docChildren.push(new Paragraph({ text: hymn.title, heading: HeadingLevel.HEADING_2, style: "ListParagraph" }));
      docChildren.push(new Paragraph({ text: hymn.description, style: "ListParagraph", indent: { left: 720 } }));
    });
  }

  // --- Readings ---
  const readingTypes = Object.keys(readings);
  if (readingTypes.length > 0) {
    docChildren.push(createSectionTitle(t('selected_readings'), CATHOLIC_BLUE));
    readingTypes.forEach(type => {
      const reading = readings[type];
      docChildren.push(new Paragraph({ text: `${t(type.toLowerCase().replace(/\s/g, '_'))}: ${reading.title} (${reading.ref})`, heading: HeadingLevel.HEADING_2 }));
      reading.text.split('\n').forEach(line => {
        docChildren.push(new Paragraph({ text: line, indent: { left: 720 } }));
      });
    });
  }

  const doc = new docx.Document({
    styles: {
        paragraphStyles: [{
            id: "ListParagraph",
            name: "List Paragraph",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: { size: 24 },
            paragraph: { spacing: { after: 100 } },
        }],
    },
    sections: [{
      properties: {},
      children: docChildren,
    }],
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `funeral-booklet-${churchName.replace(/\s+/g, '-')}.docx`);
    $('#pdf-status').text(t('docx_generated')).fadeIn();
    setTimeout(() => { $('#pdf-status').fadeOut(); }, 3000);
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

  $('#download-pdf').on('click', function() { generateFullPlanningBooklet('save'); });
  $('#download-docx').on('click', generateFullPlanningBookletDOCX);
  
  // Theme filter change
  $('#theme-filter').on('change', function() {
    const currentSelections = getSavedSelections();
    renderReadings($(this).val(), currentSelections);
    // Re-attach listeners after re-rendering
    attachReadingListeners();
    // Mark current selections as checked
    if (currentSelections && currentSelections.readings) {
      Object.values(currentSelections.readings).forEach(reading => {
        const checkbox = $(`input[value="${reading.id}"]`);
        if (checkbox.length) {
          checkbox.prop('checked', true);
        }
      });
    }
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

  // Load saved contact info
  loadContactInfo();

  // Add URL generation button
  const urlGenButton = $('<button class="bg-catholic-purple hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition-colors ml-2">' + t('generate_url') + '</button>');
  $('#toggle-contact-edit').after(urlGenButton);

  // Order of Service Carousel
  const services = ['funeral-mass', 'funeral-service', 'vigil'];
  let currentServiceIndex = 0;

  function showService(serviceType, index) {
    currentServiceIndex = index;
    // Update button styles
    $('.service-type-btn').removeClass('bg-catholic-blue text-white').addClass('bg-gray-200 text-gray-700');
    $(`.service-type-btn[data-service="${serviceType}"]`).removeClass('bg-gray-200 text-gray-700').addClass('bg-catholic-blue text-white');

    // Update dot styles
    $('.carousel-dot').removeClass('bg-catholic-blue').addClass('bg-gray-400 hover:bg-gray-500');
    $(`.carousel-dot[data-service="${serviceType}"]`).removeClass('bg-gray-400 hover:bg-gray-500').addClass('bg-catholic-blue');

    // Animate transition
    const detailsContainer = $('.service-details').parent();
    detailsContainer.css('opacity', 0.5);
    setTimeout(() => {
      $('.service-details').addClass('hidden');
      $(`#${serviceType}-details`).removeClass('hidden');
      detailsContainer.css('opacity', 1);
    }, 150);
  }

  // Button clicks
  $('.service-type-btn').on('click', function() {
    const serviceType = $(this).data('service');
    const serviceIndex = services.indexOf(serviceType);
    if (serviceIndex !== -1) {
      showService(serviceType, serviceIndex);
    }
  });

  // Dot clicks
  $('.carousel-dot').on('click', function() {
    const serviceType = $(this).data('service');
    const serviceIndex = services.indexOf(serviceType);
    if (serviceIndex !== -1) {
      showService(serviceType, serviceIndex);
    }
  });

  // Swipe Gestures
  const swipeArea = document.getElementById('order-of-service');
  let touchstartX = 0;
  let touchendX = 0;
  const swipeThreshold = 50; // Minimum distance for a swipe

  swipeArea.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
  }, { passive: true });

  swipeArea.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    const deltaX = touchendX - touchstartX;

    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX < 0) { // Swiped left
        currentServiceIndex = (currentServiceIndex + 1) % services.length;
      } else { // Swiped right
        currentServiceIndex = (currentServiceIndex - 1 + services.length) % services.length;
      }
      showService(services[currentServiceIndex], currentServiceIndex);
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

  displayDefaultBooklet();
});
