import { Helpers } from '../utils/helpers.js';
import { apiClient } from '../utils/api.js';
import { CONFIG, MESSAGES } from '../utils/constants.js';

// Módulo de agenda y calendario
export class AgendaModule {
    constructor() {
        this.events = [];
        this.currentDate = new Date();
        this.selectedEvent = null;
        this.init();
    }

    init() {
        console.log('📅 Inicializando módulo de agenda...');
        this.loadEvents();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Los event listeners específicos se configurarán
        // cuando se cargue la interfaz de agenda
    }

    async loadEvents(date = null) {
        const authModule = window.cyclops.app.getModule('auth');
        
        if (!authModule.isLoggedIn()) {
            return;
        }

        try {
            const params = date ? { date: date.toISOString().split('T')[0] } : {};
            const result = await apiClient.get('/events', params);
            this.events = result.data || [];
            this.renderCalendar();
        } catch (error) {
            Helpers.handleError(error, 'load-events');
        }
    }

    renderCalendar() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;

        const month = this.currentDate.getMonth();
        const year = this.currentDate.getFullYear();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        const calendarHtml = `
            <div class="calendar-header">
                <button class="btn btn-outline btn-sm" onclick="window.cyclops.app.getModule('agenda').previousMonth()">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h3>${this.getMonthName(month)} ${year}</h3>
                <button class="btn btn-outline btn-sm" onclick="window.cyclops.app.getModule('agenda').nextMonth()">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-weekdays">
                    ${['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => 
                        `<div class="calendar-weekday">${day}</div>`
                    ).join('')}
                </div>
                <div class="calendar-days">
                    ${this.generateCalendarDays(firstDay, daysInMonth)}
                </div>
            </div>
        `;

        container.innerHTML = calendarHtml;
    }

    generateCalendarDays(firstDay, daysInMonth) {
        let html = '';
        const startingDay = firstDay.getDay();
        
        // Días vacíos al inicio
        for (let i = 0; i < startingDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const dayEvents = this.getEventsForDate(date);
            const isToday = this.isToday(date);
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}" 
                     onclick="window.cyclops.app.getModule('agenda').selectDate('${date.toISOString()}')">
                    <div class="day-number">${day}</div>
                    ${dayEvents.length > 0 ? `
                        <div class="day-events">
                            ${dayEvents.slice(0, 2).map(event => `
                                <div class="event-dot event-priority-${event.priority}"></div>
                            `).join('')}
                            ${dayEvents.length > 2 ? `<div class="event-more">+${dayEvents.length - 2}</div>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        return html;
    }

    getEventsForDate(date) {
        return this.events.filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate.toDateString() === date.toDateString();
        });
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getMonthName(month) {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[month];
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.loadEvents();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.loadEvents();
    }

    selectDate(dateString) {
        const date = new Date(dateString);
        const dayEvents = this.getEventsForDate(date);
        
        this.showDayEvents(date, dayEvents);
    }

    showDayEvents(date, events) {
        const modalId = 'dayEventsModal_' + Helpers.generateId();
        
        const eventsHtml = events.length > 0 ? events.map(event => `
            <div class="event-item" onclick="window.cyclops.app.getModule('agenda').viewEvent('${event.id}')">
                <div class="event-time">
                    ${Helpers.formatDateTime(event.startTime, 'es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div class="event-details">
                    <div class="event-title">${Helpers.escapeHtml(event.title)}</div>
                    <div class="event-description">${Helpers.truncateText(event.description, 100)}</div>
                </div>
                <div class="event-priority event-priority-${event.priority}"></div>
            </div>
        `).join('') : `
            <div class="empty-state">
                <i class="fas fa-calendar-day"></i>
                <p>No hay eventos programados para este día.</p>
            </div>
        `;

        const modalHtml = `
            <div id="${modalId}" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Eventos del ${Helpers.formatDate(date)}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="events-list">
                            ${eventsHtml}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="window.cyclops.app.getModule('agenda').createEvent('${date.toISOString()}')">
                            <i class="fas fa-plus"></i>
                            Nuevo Evento
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalsContainer').insertAdjacentHTML('beforeend', modalHtml);
        window.cyclops.app.getModule('ui').openModal(modalId);
    }

    async createEvent(defaultDate = null) {
        const modalId = 'createEventModal_' + Helpers.generateId();
        const defaultStart = defaultDate ? new Date(defaultDate) : new Date();
        defaultStart.setHours(9, 0, 0, 0); // 9:00 AM por defecto

        const modalHtml = `
            <div id="${modalId}" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Crear Nuevo Evento</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="eventForm">
                            <div class="form-group">
                                <label class="form-label">Título</label>
                                <input type="text" name="title" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Descripción</label>
                                <textarea name="description" class="form-textarea" rows="3"></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Fecha Inicio</label>
                                    <input type="datetime-local" name="startTime" class="form-input" required 
                                           value="${this.formatDateTimeLocal(defaultStart)}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Fecha Fin</label>
                                    <input type="datetime-local" name="endTime" class="form-input" required
                                           value="${this.formatDateTimeLocal(new Date(defaultStart.getTime() + 60 * 60 * 1000))}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Prioridad</label>
                                <select name="priority" class="form-select">
                                    <option value="low">Baja</option>
                                    <option value="medium" selected>Media</option>
                                    <option value="high">Alta</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tipo</label>
                                <select name="type" class="form-select">
                                    <option value="meeting">Reunión</option>
                                    <option value="support">Soporte</option>
                                    <option value="maintenance">Mantenimiento</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="window.cyclops.app.getModule('ui').closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="window.cyclops.app.getModule('agenda').saveEvent()">Guardar</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalsContainer').insertAdjacentHTML('beforeend', modalHtml);
        window.cyclops.app.getModule('ui').openModal(modalId);
    }

    async saveEvent() {
        const form = document.getElementById('eventForm');
        if (!form) return;

        const formData = new FormData(form);
        const eventData = Helpers.serializeForm(formData);

        try {
            const result = await apiClient.post('/events', eventData);
            
            if (result.success) {
                Helpers.showNotification('Evento creado correctamente', 'success');
                this.events.push(result.data);
                this.renderCalendar();
                window.cyclops.app.getModule('ui').closeModal();
            }
        } catch (error) {
            Helpers.handleError(error, 'create-event');
        }
    }

    async viewEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        this.selectedEvent = event;
        this.openEventModal('view');
    }

    openEventModal(mode = 'view') {
        const event = this.selectedEvent;
        const modalId = 'eventModal_' + Helpers.generateId();

        const modalHtml = `
            <div id="${modalId}" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${mode === 'edit' ? 'Editar Evento' : 'Detalles del Evento'}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="event-details">
                            <div class="detail-row">
                                <strong>Título:</strong>
                                <span>${Helpers.escapeHtml(event.title)}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Descripción:</strong>
                                <span>${Helpers.escapeHtml(event.description)}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Inicio:</strong>
                                <span>${Helpers.formatDateTime(event.startTime)}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Fin:</strong>
                                <span>${Helpers.formatDateTime(event.endTime)}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Prioridad:</strong>
                                <span class="event-priority-badge event-priority-${event.priority}">
                                    ${this.getPriorityLabel(event.priority)}
                                </span>
                            </div>
                            <div class="detail-row">
                                <strong>Tipo:</strong>
                                <span>${this.getTypeLabel(event.type)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        ${mode === 'view' ? `
                            <button class="btn btn-outline" onclick="window.cyclops.app.getModule('agenda').editEvent('${event.id}')">Editar</button>
                            <button class="btn btn-primary" onclick="window.cyclops.app.getModule('ui').closeModal()">Cerrar</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalsContainer').insertAdjacentHTML('beforeend', modalHtml);
        window.cyclops.app.getModule('ui').openModal(modalId);
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        this.selectedEvent = event;
        // Cerrar modal actual y abrir modal de edición
        window.cyclops.app.getModule('ui').closeModal();
        this.openEventModal('edit');
    }

    // ===== UTILIDADES =====
    
    formatDateTimeLocal(date) {
        return date.toISOString().slice(0, 16);
    }

    getPriorityLabel(priority) {
        const labels = {
            'low': 'Baja',
            'medium': 'Media',
            'high': 'Alta'
        };
        return labels[priority] || priority;
    }

    getTypeLabel(type) {
        const labels = {
            'meeting': 'Reunión',
            'support': 'Soporte',
            'maintenance': 'Mantenimiento',
            'other': 'Otro'
        };
        return labels[type] || type;
    }

    // ===== MÉTODOS PARA OTROS MÓDULOS =====
    
    getUpcomingEvents(limit = 5) {
        const now = new Date();
        return this.events
            .filter(event => new Date(event.startTime) > now)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .slice(0, limit);
    }

    getEventsForToday() {
        const today = new Date();
        return this.getEventsForDate(today);
    }

    hasEventsOnDate(date) {
        return this.getEventsForDate(date).length > 0;
    }
}