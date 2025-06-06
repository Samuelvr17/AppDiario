class VintageDiary {
    constructor() {
        this.currentWeek = this.getWeekStart(new Date());
        this.entries = this.loadEntries();
        this.init();
    }

    init() {
        this.updateCurrentDate();
        this.renderWeek();
        this.bindEvents();
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    updateCurrentDate() {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = 
            new Date().toLocaleDateString('es-ES', options);
    }

    renderWeek() {
        const container = document.getElementById('daysContainer');
        const weekDisplay = document.getElementById('weekDisplay');
        
        container.innerHTML = '';
        
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        const weekStart = new Date(this.currentWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        weekDisplay.textContent = `${weekStart.getDate()} ${months[weekStart.getMonth()]} - ${weekEnd.getDate()} ${months[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

        for (let i = 0; i < 7; i++) {
            const date = new Date(this.currentWeek);
            date.setDate(date.getDate() + i);
            
            const dayColumn = this.createDayColumn(date, days[i]);
            container.appendChild(dayColumn);
        }
    }

    createDayColumn(date, dayName) {
        const column = document.createElement('div');
        column.className = 'day-column';
        
        const dateKey = this.getDateKey(date);
        const dayEntries = this.entries[dateKey] || [];
        
        column.innerHTML = `
            <div class="day-header">
                <div class="day-name">${dayName}</div>
                <div class="day-number">${date.getDate()}</div>
            </div>
            <div class="entries-container" data-date="${dateKey}">
                ${dayEntries.map(entry => this.createEntryHTML(entry)).join('')}
                <div class="add-entry-btn" onclick="diary.showEntryInput('${dateKey}')">
                    + Agregar entrada del día...
                </div>
            </div>
        `;
        
        return column;
    }

    createEntryHTML(entry) {
        return `
            <div class="entry-item ${entry.completed ? 'completed' : ''}" 
                    onclick="diary.toggleEntry('${entry.id}')">
                ${entry.text}
            </div>
        `;
    }

    showEntryInput(dateKey) {
        const container = document.querySelector(`[data-date="${dateKey}"]`);
        const addBtn = container.querySelector('.add-entry-btn');
        
        const inputHTML = `
            <textarea class="entry-input" placeholder="Escribe tu entrada del diario aquí..." 
                        onkeydown="if(event.key==='Enter' && event.ctrlKey) diary.saveEntry('${dateKey}', this.value)"></textarea>
            <div class="entry-buttons">
                <button class="btn-save" onclick="diary.saveEntry('${dateKey}', this.parentElement.previousElementSibling.value)">Guardar</button>
                <button class="btn-cancel" onclick="diary.cancelEntry('${dateKey}')">Cancelar</button>
            </div>
        `;
        
        addBtn.style.display = 'none';
        container.insertAdjacentHTML('beforeend', inputHTML);
        container.querySelector('.entry-input').focus();
    }

    saveEntry(dateKey, text) {
        if (!text.trim()) return;
        
        if (!this.entries[dateKey]) {
            this.entries[dateKey] = [];
        }
        
        const entry = {
            id: Date.now().toString(),
            text: text.trim(),
            completed: false,
            timestamp: new Date().toISOString()
        };
        
        this.entries[dateKey].push(entry);
        this.saveEntries();
        this.renderWeek();
    }

    cancelEntry(dateKey) {
        const container = document.querySelector(`[data-date="${dateKey}"]`);
        const input = container.querySelector('.entry-input');
        const buttons = container.querySelector('.entry-buttons');
        const addBtn = container.querySelector('.add-entry-btn');
        
        if (input) input.remove();
        if (buttons) buttons.remove();
        addBtn.style.display = 'block';
    }

    toggleEntry(entryId) {
        for (const dateKey in this.entries) {
            const entry = this.entries[dateKey].find(e => e.id === entryId);
            if (entry) {
                entry.completed = !entry.completed;
                break;
            }
        }
        this.saveEntries();
        this.renderWeek();
    }

    bindEvents() {
        document.getElementById('prevWeek').addEventListener('click', () => {
            this.currentWeek.setDate(this.currentWeek.getDate() - 7);
            this.renderWeek();
        });

        document.getElementById('nextWeek').addEventListener('click', () => {
            this.currentWeek.setDate(this.currentWeek.getDate() + 7);
            this.renderWeek();
        });
    }

    getDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    loadEntries() {
        try {
            return JSON.parse(localStorage.getItem('vintageDiaryEntries')) || {};
        } catch {
            return {};
        }
    }

    saveEntries() {
        localStorage.setItem('vintageDiaryEntries', JSON.stringify(this.entries));
    }
}

// Initialize the diary
const diary = new VintageDiary();
