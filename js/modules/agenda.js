class AgendaModule {
    constructor() {
        this.events = [];
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        console.log('📅 AgendaModule inicializado');
        this.loadEvents();
        this.initialized = true;
        return this;
    }

    loadEvents() {
        try {
            const storedEvents = localStorage.getItem('cyclops_agenda');
            if (storedEvents) {
                this.events = JSON.parse(storedEvents);
                console.log(`📅 ${this.events.length} eventos cargados`);
            }
        } catch (error) {
            console.warn('Error cargando eventos:', error);
            this.events = [];
        }
    }

    saveEvents() {
        try {
            localStorage.setItem('cyclops_agenda', JSON.stringify(this.events));
        } catch (error) {
            console.error('Error guardando eventos:', error);
        }
    }

    addEvent(eventData) {
        const newEvent = {
            id: 'event_' + Date.now(),
            title: eventData.title || 'Nuevo evento',
            description: eventData.description || '',
            date: eventData.date || new Date().toISOString().split('T')[0],
            time: eventData.time || '09:00',
            duration: eventData.duration || 60,
            priority: eventData.priority || 'medium',
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.events.push(newEvent);
        this.saveEvents();
        
        console.log('✅ Evento agregado:', newEvent);
        return newEvent;
    }

    getEvents(date = null) {
        if (date) {
            return this.events.filter(event => event.date === date);
        }
        return this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    updateEvent(eventId, updates) {
        const eventIndex = this.events.findIndex(event => event.id === eventId);
        
        if (eventIndex !== -1) {
            this.events[eventIndex] = {
                ...this.events[eventIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            this.saveEvents();
            return this.events[eventIndex];
        }
        
        return null;
    }

    deleteEvent(eventId) {
        const eventIndex = this.events.findIndex(event => event.id === eventId);
        
        if (eventIndex !== -1) {
            const deletedEvent = this.events.splice(eventIndex, 1)[0];
            this.saveEvents();
            console.log('🗑️ Evento eliminado:', deletedEvent);
            return deletedEvent;
        }
        
        return null;
    }

    getUpcomingEvents(days = 7) {
        const today = new Date().toISOString().split('T')[0];
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        const futureDateStr = futureDate.toISOString().split('T')[0];

        return this.events.filter(event => 
            event.date >= today && event.date <= futureDateStr && !event.completed
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Métodos para estadísticas
    getStats() {
        const total = this.events.length;
        const completed = this.events.filter(e => e.completed).length;
        const upcoming = this.getUpcomingEvents(30).length;
        const overdue = this.events.filter(e => 
            !e.completed && new Date(e.date) < new Date().setHours(0, 0, 0, 0)
        ).length;

        return {
            total,
            completed,
            upcoming,
            overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }
}

// Global registration
window.AgendaModule = AgendaModule;
console.log('✅ Agenda module loaded');
