// Parses HTML structure exported from AiS2 and returns parsed data array
export function parseAisHtml(htmlContent, multipliers) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // AiS2 renders each subject as a mat-card with Angular Material layout
    // Desktop view uses: div.col-5 (name), div.col-2 (credits), div.col-3 (grade)
    const cards = doc.querySelectorAll('mat-card');
    const importedSubjects = [];

    cards.forEach(card => {
        // Use the desktop row (d-md-flex) to extract structured data
        const desktopRow = card.querySelector('.row.d-md-flex');
        if (!desktopRow) return;

        // Subject Name:

        // Located in div.col-5 > div > b
        const nameCol = desktopRow.querySelector('.col-5');
        if (!nameCol) return;
        const nameEl = nameCol.querySelector('b');
        if (!nameEl) return;
        const name = nameEl.textContent.trim();

        // Credits:

        // Located in div.col-2, inside first span.badge > b, format: "5K"
        const creditsCol = desktopRow.querySelector('.col-2');
        if (!creditsCol) return;
        const creditBadge = creditsCol.querySelector('.badge b');
        if (!creditBadge) return;
        // Extract only the number from text like "5K"
        const creditsText = creditBadge.textContent.trim();
        const credits = parseInt(creditsText);

        // Grade:

        // Located in div.col-3 > div > div.text-wrap > b, format: "A - výborne"
        const gradeCol = desktopRow.querySelector('.col-3');
        let grade = 'FX'; // Default if no grade found
        if (gradeCol) {
            const gradeEl = gradeCol.querySelector('.text-wrap b');
            if (gradeEl) {
                // Grade letter is the direct text node before the span
                // <b>A<span> - výborne</span></b> -> extract "A"
                const gradeText = gradeEl.childNodes[0]?.textContent.trim().toUpperCase();
                if (gradeText && multipliers[gradeText]) {
                    grade = gradeText;
                }
            }
        }

        // Only push if required data is valid
        if (name && !isNaN(credits) && credits > 0) {
            importedSubjects.push({ name, credits, grade });
        }
    });

    return importedSubjects;
}