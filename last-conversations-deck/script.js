document.addEventListener('DOMContentLoaded', () => {
    // Note: The jsPDF and docx libraries are loaded on-demand in the functions that use them.
    let currentLanguage = 'en';
    let translations = {}; // Store the entire language file content

    // --- 1. LANGUAGE AND CONTENT LOADING ---
    const loadLanguage = async (lang) => {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) {
                console.error(`Could not load language file: ${lang}.json`);
                return; // Do not proceed if language file is missing
            }
            translations = await response.json();

            // Populate all text content
            document.querySelectorAll('[data-i18n-key]').forEach(element => {
                const key = element.getAttribute('data-i18n-key');
                if (translations[key]) {
                    element.textContent = translations[key];
                }
            });

            // Populate resources list
            const resourcesList = document.getElementById('resources-list');
            resourcesList.innerHTML = ''; // Clear existing list
            translations.resources.forEach(resource => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${resource.url}" target="_blank">${resource.title}</a> - ${resource.desc}`;
                resourcesList.appendChild(li);
            });

            document.documentElement.lang = lang;
            currentLanguage = lang;

        } catch (error) {
            console.error('Error loading or parsing language file:', error);
        }
    };

    // --- 2. DOCUMENT GENERATION FUNCTIONS ---

    const drawIcon = (doc, category, x, y) => {
        doc.setLineWidth(0.5);
        doc.setDrawColor(100, 100, 100);

        switch (category) {
            case 'Medical Wishes': // Simple cross
                doc.line(x, y - 2, x, y + 2);
                doc.line(x - 2, y, x + 2, y);
                break;
            case 'Personal & Spiritual': // Simple heart
                doc.path([
                    { op: 'm', c: [x, y] },
                    { op: 'c', c: [x + 1, y - 1.5, x + 2.5, y - 1, x + 2.5, y + 0.5] },
                    { op: 'c', c: [x + 2.5, y + 2, x, y + 3.5, x, y + 3.5] },
                    { op: 'c', c: [x, y + 3.5, x - 2.5, y + 2, x - 2.5, y + 0.5] },
                    { op: 'c', c: [x - 2.5, y - 1, x - 1, y - 1.5, x, y] },
                ]).fill();
                break;
            case 'Funeral & Remembrance': // Simple dove/bird
                doc.path([
                    { op: 'm', c: [x - 3, y] },
                    { op: 'c', c: [x - 1, y - 3, x + 2, y - 2, x + 3, y + 1] },
                ]).stroke();
                 doc.path([
                    { op: 'm', c: [x - 3, y] },
                    { op: 'c', c: [x - 1, y + 1, x + 1, y + 2, x + 2, y + 1] },
                ]).stroke();
                break;
            case 'Practical Matters': // Simple document
                doc.rect(x - 2, y - 3, 4, 5);
                doc.line(x - 2, y - 1, x + 2, y - 1);
                doc.line(x - 2, y + 1, x + 2, y + 1);
                break;
        }
    };

    // A. Generate PDF (Table Format)
    const generateTablePdf = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const cardData = translations.cards || [];
        const body = cardData.map(card => [card.category, card.text]);

        doc.autoTable({
            head: [['Category', 'Topic / Question']],
            body: body,
            styles: { fontSize: 12, cellPadding: 3 },
            headStyles: { fontSize: 14, fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 45 },
                1: { cellWidth: 'auto' }
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 1) {
                    const card = cardData[data.row.index];
                    drawIcon(doc, card.category, data.cell.x + 5, data.cell.y + 6);
                    // Adjust text position to make space for the icon
                    data.cell.textPos.x = data.cell.x + 10;
                }
            },
            didDrawPage: (data) => {
                // Add header and footer to each page
                doc.setFontSize(20);
                doc.text(translations.siteTitle, data.settings.margin.left, 15);
                doc.setFontSize(10);
                doc.text(`Page ${doc.internal.getNumberOfPages()}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
            },
            margin: { top: 25 }
        });

        doc.save(`conversation-deck-table-${currentLanguage}.pdf`);
    };

    // B. Generate PDF (Printable Cards Format)
    const generateCardsPdf = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const cardData = translations.cards || [];

        const cardWidth = 85;
        const cardHeight = 55;
        const marginX = 20;
        const marginY = 20;
        let cursorX = marginX;
        let cursorY = marginY;

        cardData.forEach((card, index) => {
            if (index > 0 && index % 6 === 0) { // Add new page after 6 cards
                doc.addPage();
                cursorX = marginX;
                cursorY = marginY;
            }

            // Draw card border
            doc.setDrawColor(200, 200, 200); // Light grey for cut lines
            doc.rect(cursorX, cursorY, cardWidth, cardHeight);

            // Draw icon
            drawIcon(doc, card.category, cursorX + (cardWidth / 2), cursorY + 10);

            // Add text
            doc.setFontSize(12);
            const textLines = doc.splitTextToSize(card.text, cardWidth - 20);
            doc.text(textLines, cursorX + 10, cursorY + 22, { align: 'center' });

            // Add category footnote
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            doc.text(card.category, cursorX + 5, cursorY + cardHeight - 5);
            doc.setTextColor(0, 0, 0);

            // Move cursor for next card
            cursorX += cardWidth + 5;
            if (cursorX >= (marginX + cardWidth * 2)) {
                cursorX = marginX;
                cursorY += cardHeight + 5;
            }
        });

        doc.save(`conversation-deck-cards-${currentLanguage}.pdf`);
    };

    // C. Generate DOCX
    const generateDocx = () => {
        const { Document, Packer, Paragraph, HeadingLevel } = window.docx;
        const cardData = translations.cards || [];
        const groupedData = cardData.reduce((acc, card) => {
            (acc[card.category] = acc[card.category] || []).push(card.text);
            return acc;
        }, {});

        const children = [];
        children.push(new Paragraph({ text: translations.siteTitle, heading: HeadingLevel.TITLE }));

        for (const category in groupedData) {
            children.push(new Paragraph({ text: category, heading: HeadingLevel.HEADING_1, spacing: { before: 240 } }));
            groupedData[category].forEach(text => {
                children.push(new Paragraph({ text: text, bullet: { level: 0 } }));
            });
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: children,
            }],
        });

        Packer.toBlob(doc).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `conversation-deck-${currentLanguage}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    };

    // --- 3. EVENT LISTENERS ---
    document.getElementById('generate-table-pdf').addEventListener('click', generateTablePdf);
    document.getElementById('generate-cards-pdf').addEventListener('click', generateCardsPdf);
    document.getElementById('generate-docx').addEventListener('click', generateDocx);

    document.getElementById('lang-select').addEventListener('change', (event) => {
        loadLanguage(event.target.value);
    });

    document.querySelector('.card-stack-container').addEventListener('click', () => {
        const container = document.querySelector('.card-stack-container');
        const topCard = container.querySelector('.card:last-of-type');

        if (topCard) {
            topCard.classList.add('flipped');

            setTimeout(() => {
                topCard.classList.remove('flipped');
                container.prepend(topCard);
            }, 500); // Match timeout to CSS transition duration
        }
    });

    // --- INITIAL LOAD ---
    loadLanguage(currentLanguage);
});
