// js/modules/agenda.js - VERSIÓN CORREGIDA (NO MODULAR)
class AgendaModule {
    constructor() {
        this.isInitialized = false;
        this.events = [];
        console.log('📅 Agenda Module creado');
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('📅 Inicializando módulo de Agenda...');
        
        try {
            this.loadEvents();
            this.setupEventListeners();
            this.renderCalendar();
            
            this.isInitialized = true;
            console.log('✅ Agenda Module inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Agenda Module:', error);
            throw error;
        }
    }

    loadEvents() {
        // Cargar eventos del localStorage
        try {
            const storedEvents = localStorage.getItem('cyclops_events');
            if (storedEvents) {
                this.events = JSON.parse(storedEvents);
                console.log(`📂 ${this.events.length} eventos cargados`);
            }
        } catch (error) {
            console.warn('Error cargando eventos:', error);
            this.events = [];
        }
    }

    setupEventListeners() {
        // Botón para nuevo evento
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('new-event-btn')) {
                this.showNewEventForm();
            }
            
            if (e.target.classList.contains('calendar-day')) {
                const date = e.target.dataset.date;
                this.showDayEvents(date);
            }
        });

        // Navegación del calendario
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('prev-month')) {
                this.previousMonth();
            }
            
            if (e.target.classList.contains('next-month')) {
                this.nextMonth();
            }
            
            if (e.target.classList.contains('today-btn')) {
                this.goToToday();
            }
        });
    }

    renderCalendar() {
        const calendarContainer = document.getElementById('calendar');
        if (!calendarContainer) return;

        const today = new Date();
        this.currentMonth = this.currentMonth || new Date(today.getFullYear(), today.getMonth(), 1);

        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const calendarHTML = `
            <div class="calendar-header">
                <button class="prev-month btn btn-secondary">‹</button>
                <h3>${monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}</h3>
                <button class="next-month btn btn-secondary">›</button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-weekdays">
                    <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
                </div>
                <div class="calendar-days">
                    ${this.generateCalendarDays()}
                </div>
            </div>
            <div class="calendar-actions">
                <button class="today-btn btn btn-primary">Hoy</button>
                <button class="new-event-btn btn btn-success">Nuevo Evento</button>
            </div>
        `;

        calendarContainer.innerHTML = calendarHTML;
    }

    generateCalendarDays() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        let daysHTML = '';

        // Días del mes anterior
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            daysHTML += `<div class="calendar-day other-month" data-date="${year}-${month}-${day}">${day}</div>`;
        }

        // Días del mes actual
        const today = new Date();
        const isToday = (day) => {
            return day === today.getDate() && 
                   month === today.getMonth() && 
                   year === today.getFullYear();
        };

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${month + 1}-${day}`;
            const dayEvents = this.getEventsForDate(dateStr);
            const hasEvents = dayEvents.length > 0;
            const todayClass = isToday(day) ? 'today' : '';
            const eventsBadge = hasEvents ? `<span class="events-badge">${dayEvents.length}</span>` : '';

            daysHTML += `
                <div class="calendar-day ${todayClass} ${hasEvents ? 'has-events' : ''}" data-date="${dateStr}">
                    ${day}
                    ${eventsBadge}
                </div>
            `;
        }

        // Días del próximo mes
        const totalCells = 42; // 6 semanas
        const remainingCells = totalCells - (startingDay + totalDays);
        for (let day = 1; day <= remainingCells; day++) {
            daysHTML += `<div class="calendar-day other-month" data-date="${year}-${month + 2}-${day}">${day}</div>`;
        }

        return daysHTML;
    }

    getEventsForDate(dateStr) {
        return this.events.filter(event => {
            const eventDate = new Date(event.startTime).toISOString().split('T')[0];
            return eventDate === dateStr;
        });
    }

    previousMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
        this.renderCalendar();
    }

    goToToday() {
        this.currentMonth = new Date();
        this.currentMonth.setDate(1);
        this.renderCalendar();
    }

    async createEvent(eventData) {
        const helpers = window.CyclopsApp?.getModule('helpers');
        
        try {
            const newEvent = {
                id: helpers ? helpers.generateId('event_') : 'event_' + Date.now(),
                ...eventData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.events.push(newEvent);
            this.saveEvents();
            
            console.log('✅ Evento creado:', newEvent);
            
            // Re-renderizar calendario
            this.renderCalendar();
            
            return newEvent;

        } catch (error) {
            console.error('❌ Error creando evento:', error);
            throw error;
        }
    }

    getEvent(id) {
        return this.events.find(event => event.id === id);
    }

    updateEvent(id, updates) {
        const eventIndex = this.events.findIndex(event => event.id === id);
        
        if (eventIndex !== -1) {
            this.events[eventIndex] = {
                ...this.events[eventIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            this.saveEvents();
            this.renderCalendar();
            return this.events[eventIndex];
        }
        
        return null;
    }

    deleteEvent(id) {
        const eventIndex = this.events.findIndex(event => event.id === id);
        
        if (eventIndex !== -1) {
            this.events.splice(eventIndex, 1);
            this.saveEvents();
            this.renderCalendar();
            return true;
        }
        
        return false;
    }

    getEvents(filter = {}) {
        let filteredEvents = [...this.events];

        if (filter.date) {
            filteredEvents = filteredEvents.filter(event => {
                const eventDate = new Date(event.startTime).toISOString().split('T')[0];
                return eventDate === filter.date;
            });
        }

        if (filter.type) {
            filteredEvents = filteredEvents.filter(event => event.type === filter.type);
        }

        return filteredEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    }

    saveEvents() {
        try {
            localStorage.setItem('cyclops_events', JSON.stringify(this.events));
        } catch (error) {
            console.error('Error guardando eventos:', error);
        }
    }

    showNewEventForm() {
        const ui = window.CyclopsApp?.getModule('ui');
        if (ui) {
            ui.showModal('eventModal');
        }
    }

    showDayEvents(dateStr) {
        const events = this.getEventsForDate(dateStr);
        const helpers = window.CyclopsApp?.getModule('helpers');
        const formattedDate = helpers ? helpers.formatDate(dateStr) : new Date(dateStr).toLocaleDateString();

        const modalId = 'dayEventsModal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div class="day-events">
                        <h2>Eventos del ${formattedDate}</h2>
                        <div id="dayEventsList"></div>
                        <div class="day-events-actions">
                            <button class="new-event-btn btn btn-success">Nuevo Evento</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const eventsList = modal.querySelector('#dayEventsList');
        
        if (events.length === 0) {
            eventsList.innerHTML = '<p class="no-events">No hay eventos programados para este día.</p>';
        } else {
            eventsList.innerHTML = events.map(event => this.generateEventHTML(event)).join('');
        }

        window.CyclopsApp?.getModule('ui')?.showModal(modalId);
    }

    generateEventHTML(event) {
        const helpers = window.CyclopsApp?.getModule('helpers');
        const startTime = new Date(event.startTime).toLocaleTimeString('es-AR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const endTime = new Date(event.endTime).toLocaleTimeString('es-AR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        return `
            <div class="event-item" data-event-id="${event.id}">
                <div class="event-time">${startTime} - ${endTime}</div>
                <div class="event-details">
                    <h4>${helpers ? helpers.sanitizeHTML(event.title) : event.title}</h4>
                    ${event.description ? `<p>${helpers ? helpers.sanitizeHTML(event.description) : event.description}</p>` : ''}
                    ${event.location ? `<div class="event-location">📍 ${event.location}</div>` : ''}
                    <div class="event-type type-${event.type}">${this.getTypeText(event.type)}</div>
                </div>
                <div class="event-actions">
                    <button class="btn btn-sm btn-outline" onclick="CyclopsApp.getModule('agenda').editEvent('${event.id}')">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="CyclopsApp.getModule('agenda').deleteEvent('${event.id}')">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    getTypeText(type) {
        const typeMap = {
            'meeting': 'Reunión',
            'support': 'Soporte',
            'maintenance': 'Mantenimiento',
            'installation': 'Instalación',
            'training': 'Capacitación',
            'other': 'Otro'
        };
        return typeMap[type] || type;
    }

    editEvent(eventId) {
        const event = this.getEvent(eventId);
        if (!event) return;

        // Aquí se implementaría el formulario de edición
        console.log('Editando evento:', event);
        window.CyclopsApp?.getModule('helpers')?.showNotification('Funcionalidad de edición en desarrollo', 'info');
    }

    // Métodos para estadísticas
    getStats() {
        const today = new Date().toISOString().split('T')[0];
        const upcomingEvents = this.events.filter(event => 
            new Date(event.startTime).toISOString().split('T')[0] >= today
        ).length;

        return {
            total: this.events.length,
            upcoming: upcomingEvents,
            today: this.getEventsForDate(today).length
        };
    }
}
