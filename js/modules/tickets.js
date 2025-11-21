// js/modules/tickets.js - VERSIÓN CORREGIDA (NO MODULAR)
class TicketsModule {
    constructor() {
        this.isInitialized = false;
        this.tickets = [];
        console.log('🎫 Tickets Module creado');
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🎫 Inicializando módulo de Tickets...');
        
        try {
            this.loadTickets();
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Tickets Module inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Tickets Module:', error);
            throw error;
        }
    }

    loadTickets() {
        // Cargar tickets del localStorage
        try {
            const storedTickets = localStorage.getItem('cyclops_tickets');
            if (storedTickets) {
                this.tickets = JSON.parse(storedTickets);
                console.log(`📂 ${this.tickets.length} tickets cargados`);
            }
        } catch (error) {
            console.warn('Error cargando tickets:', error);
            this.tickets = [];
        }
    }

    setupEventListeners() {
        // Botón para crear nuevo ticket
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('new-ticket-btn')) {
                this.showNewTicketForm();
            }
            
            if (e.target.classList.contains('view-ticket-btn')) {
                const ticketId = e.target.dataset.ticketId;
                this.viewTicket(ticketId);
            }
        });
    }

    async createTicket(ticketData) {
        const helpers = window.CyclopsApp?.getModule('helpers');
        
        try {
            const newTicket = {
                id: helpers ? helpers.generateId('ticket_') : 'ticket_' + Date.now(),
                ...ticketData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'open',
                priority: ticketData.priority || 'medium',
                number: this.generateTicketNumber()
            };

            this.tickets.unshift(newTicket);
            this.saveTickets();
            
            console.log('✅ Ticket creado:', newTicket);
            return newTicket;

        } catch (error) {
            console.error('❌ Error creando ticket:', error);
            throw error;
        }
    }

    generateTicketNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const count = this.tickets.filter(t => 
            t.createdAt.startsWith(date.toISOString().split('T')[0])
        ).length + 1;
        
        return `TCK-${year}${month}${count.toString().padStart(3, '0')}`;
    }

    getTicket(id) {
        return this.tickets.find(ticket => ticket.id === id);
    }

    updateTicket(id, updates) {
        const ticketIndex = this.tickets.findIndex(ticket => ticket.id === id);
        
        if (ticketIndex !== -1) {
            this.tickets[ticketIndex] = {
                ...this.tickets[ticketIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            this.saveTickets();
            return this.tickets[ticketIndex];
        }
        
        return null;
    }

    getTickets(filter = {}) {
        let filteredTickets = [...this.tickets];

        if (filter.status) {
            filteredTickets = filteredTickets.filter(ticket => ticket.status === filter.status);
        }

        if (filter.priority) {
            filteredTickets = filteredTickets.filter(ticket => ticket.priority === filter.priority);
        }

        if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            filteredTickets = filteredTickets.filter(ticket => 
                ticket.title.toLowerCase().includes(searchTerm) ||
                ticket.description.toLowerCase().includes(searchTerm) ||
                ticket.number.toLowerCase().includes(searchTerm)
            );
        }

        return filteredTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    saveTickets() {
        try {
            localStorage.setItem('cyclops_tickets', JSON.stringify(this.tickets));
        } catch (error) {
            console.error('Error guardando tickets:', error);
        }
    }

    showNewTicketForm() {
        const ui = window.CyclopsApp?.getModule('ui');
        if (ui) {
            ui.showModal('ticketModal');
        }
    }

    viewTicket(ticketId) {
        const ticket = this.getTicket(ticketId);
        if (!ticket) {
            window.CyclopsApp?.getModule('helpers')?.showNotification('Ticket no encontrado', 'error');
            return;
        }

        this.displayTicketDetails(ticket);
    }

    displayTicketDetails(ticket) {
        // Crear modal de detalles del ticket
        const modalId = 'ticketDetailsModal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div class="ticket-details">
                        <h2>Detalles del Ticket</h2>
                        <div id="ticketDetailsContent"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const content = modal.querySelector('#ticketDetailsContent');
        content.innerHTML = this.generateTicketHTML(ticket);

        window.CyclopsApp?.getModule('ui')?.showModal(modalId);
    }

    generateTicketHTML(ticket) {
        const helpers = window.CyclopsApp?.getModule('helpers');
        const formattedDate = helpers ? helpers.formatDate(ticket.createdAt) : new Date(ticket.createdAt).toLocaleDateString();

        return `
            <div class="ticket-header">
                <div class="ticket-meta">
                    <span class="ticket-number">${ticket.number}</span>
                    <span class="ticket-status status-${ticket.status}">${this.getStatusText(ticket.status)}</span>
                    <span class="ticket-priority priority-${ticket.priority}">${this.getPriorityText(ticket.priority)}</span>
                </div>
                <div class="ticket-date">Creado: ${formattedDate}</div>
            </div>
            
            <div class="ticket-body">
                <h3>${helpers ? helpers.sanitizeHTML(ticket.title) : ticket.title}</h3>
                <div class="ticket-description">
                    <p>${helpers ? helpers.sanitizeHTML(ticket.description) : ticket.description}</p>
                </div>
                
                ${ticket.category ? `
                <div class="ticket-category">
                    <strong>Categoría:</strong> ${ticket.category}
                </div>
                ` : ''}
            </div>
            
            <div class="ticket-actions">
                <button class="btn btn-primary" onclick="CyclopsApp.getModule('tickets').updateTicketStatus('${ticket.id}', 'in_progress')">
                    Tomar Ticket
                </button>
                <button class="btn btn-secondary" onclick="CyclopsApp.getModule('tickets').updateTicketStatus('${ticket.id}', 'closed')">
                    Cerrar Ticket
                </button>
            </div>
        `;
    }

    getStatusText(status) {
        const statusMap = {
            'open': 'Abierto',
            'in_progress': 'En Progreso',
            'resolved': 'Resuelto',
            'closed': 'Cerrado'
        };
        return statusMap[status] || status;
    }

    getPriorityText(priority) {
        const priorityMap = {
            'low': 'Baja',
            'medium': 'Media',
            'high': 'Alta',
            'urgent': 'Urgente'
        };
        return priorityMap[priority] || priority;
    }

    updateTicketStatus(ticketId, newStatus) {
        const ticket = this.updateTicket(ticketId, { status: newStatus });
        if (ticket) {
            window.CyclopsApp?.getModule('helpers')?.showNotification(`Ticket ${this.getStatusText(newStatus)}`, 'success');
            this.displayTicketDetails(ticket);
        }
    }

    // Métodos para estadísticas
    getStats() {
        const total = this.tickets.length;
        const open = this.tickets.filter(t => t.status === 'open').length;
        const inProgress = this.tickets.filter(t => t.status === 'in_progress').length;
        const closed = this.tickets.filter(t => t.status === 'closed' || t.status === 'resolved').length;

        return {
            total,
            open,
            inProgress,
            closed,
            resolutionRate: total > 0 ? Math.round((closed / total) * 100) : 0
        };
    }
}
window.TicketsModule = TicketsModule;
