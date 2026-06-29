// Multipliers for grades
const multipliers = {
    'A': 1.0,
    'B': 1.5,
    'C': 2.0,
    'D': 2.5,
    'E': 3.0,
    'FX': 4.0
};

const tableBody = document.getElementById('tableBody');
const addBtn = document.getElementById('addBtn');
const calcBtn = document.getElementById('calcBtn');
const resultBox = document.getElementById('resultBox');
const resultValue = document.getElementById('resultValue');
const intrakValue = document.getElementById('intrakValue');

// Creates a new dynamic row in the table
function createRow(name = '', value = '', grade = 'A') {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
        <td><input type="text" placeholder="e.g., Mathematics" class="sub-name" value="${name}"></td>
        <td><input type="number" min="0" placeholder="e.g., 6" class="sub-value" value="${value}"></td>
        <td>
            <select class="sub-grade">
                <option value="A" ${grade === 'A' ? 'selected' : ''}>A (1.0)</option>
                <option value="B" ${grade === 'B' ? 'selected' : ''}>B (1.5)</option>
                <option value="C" ${grade === 'C' ? 'selected' : ''}>C (2.0)</option>
                <option value="D" ${grade === 'D' ? 'selected' : ''}>D (2.5)</option>
                <option value="E" ${grade === 'E' ? 'selected' : ''}>E (3.0)</option>
                <option value="FX" ${grade === 'FX' ? 'selected' : ''}>FX (4.0)</option>
            </select>
        </td>
        <td><button class="btn btn-delete" onclick="deleteRow(this)">×</button></td>
    `;

    tableBody.appendChild(tr);
    
    // Event to save after any change
    tr.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('input', saveToStorage);
    });
    
}

function saveToStorage() {
    const names = document.querySelectorAll('.sub-name');
    const values = document.querySelectorAll('.sub-value');
    const grades = document.querySelectorAll('.sub-grade');
    
    const subjectsData = [];

    for (let i = 0; i < names.length; i++) {
        subjectsData.push({
            name: names[i].value,
            value: values[i].value,
            grade: grades[i].value
        });
    }

    // Save array as JSON string
    localStorage.setItem('savedSubjects', JSON.stringify(subjectsData));
}

function loadFromStorage() {
    const savedData = localStorage.getItem('savedSubjects');
    
    if (savedData) {
        const subjectsData = JSON.parse(savedData);
        
        // If we have presaved data - load
        if (subjectsData.length > 0) {
            subjectsData.forEach(sub => {
                createRow(sub.name, sub.value, sub.grade);
            });

            calculateResult();
            return;
        }
    }
    
    // If we do not have data then by default create 3 emtpy rows
    for(let i = 0; i < 3; i++) {
        createRow();
    }
}

// Removes a specific row
function deleteRow(button) {
    const row = button.closest('tr');
    row.remove();
    saveToStorage();
}

function calculateIntrak(average_grade){
    if(average_grade > 3.0) return 0;
    if(average_grade < 1.0) return 0;

    return 700 * (3.00 - average_grade) / (3.00 - 1.00)
}

// Formula: average_grade / kredit_sum (Calculated credits sum / Original credits sum)
function calculateResult() {
    const values = document.querySelectorAll('.sub-value');
    const grades = document.querySelectorAll('.sub-grade');
    
    let kredit_sum = 0;
    let average_grade = 0;
    let hasData = false;

    for (let i = 0; i < values.length; i++) {
        const val = parseFloat(values[i].value);
        const grade = grades[i].value;

        if (!isNaN(val) && val >= 0) {
            hasData = true;
            kredit_sum += val;
            average_grade += val * multipliers[grade];
        }
    }

    if (!hasData || kredit_sum === 0) {
        alert("Please add subjects and enter valid credit values!");
        resultBox.classList.add('hidden');
        return;
    }

    const finalResult = average_grade / kredit_sum;
    const intrakPoints = calculateIntrak(finalResult);


    // Output rounded to 4 decimal places
    resultValue.textContent = finalResult.toFixed(4);
    intrakValue.textContent = intrakPoints.toFixed(4);
    resultBox.classList.remove('hidden');
}

// Event Listeners
addBtn.addEventListener('click', () => {
    createRow();
    saveToStorage();
});
calcBtn.addEventListener('click', calculateResult);

// Generate 3 initial rows on load
loadFromStorage();