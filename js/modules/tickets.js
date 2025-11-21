import { Helpers } from '../utils/helpers.js';
import { apiClient } from '../utils/api.js';
import { CONFIG, MESSAGES } from '../utils/constants.js';

// Módulo de gestión de tickets
export class TicketsModule {
    constructor() {
        this.tickets = [];
        this.currentTicket = null;
        this.filters = {
            status: 'all',
            urgency: 'all',
            dateRange: 'all'
        };
        this.init();
    }

    init() {
        console.log('🎫 Inicializando módulo de tickets...');
        this.setupEventListeners();
        this.loadTickets();
    }

    setupEventListeners() {
        // Los event listeners específicos se configurarán
        // cuando se cargue la interfaz de tickets
    }

    async loadTickets(filters = {}) {
        const authModule = window.cyclops.app.getModule('auth');
        
        if (!authModule.isLoggedIn()) {
            return;
        }

        try {
            const result = await apiClient.getTickets(filters);
            this.tickets = result.data || [];
            this.renderTickets();
        } catch (error) {
            Helpers.handleError(error, 'load-tickets');
        }
    }

    renderTickets() {
        const container = document.getElementById('ticketsContainer');
        if (!container) return;

        if (this.tickets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-ticket-alt"></i>
                    <h3>No hay tickets</h3>
                    <p>No se encontraron tickets de soporte.</p>
                    <button class="btn btn-primary" onclick="window.cyclops.app.getModule('ui').openModal('supportModal')">
                        Crear primer ticket
                    </button>
                </div>
            `;
            return;
        }

        const ticketsHtml = this.tickets.map(ticket => `
            <div class="ticket-card" data-ticket-id="${ticket.id}">
                <div class="ticket-header">
                    <div class="ticket-title">
                        <h4>${Helpers.escapeHtml(ticket.title)}</h4>
                        <span class="ticket-badge ticket-urgency-${ticket.urgency}">
                            ${this.getUrgencyLabel(ticket.urgency)}
                        </span>
                    </div>
                    <div class="ticket-actions">
                        <button class="btn btn-sm btn-outline" onclick="window.cyclops.app.getModule('tickets').viewTicket('${ticket.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="window.cyclops.app.getModule('tickets').editTicket('${ticket.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
                <div class="ticket-body">
                    <p>${Helpers.truncateText(ticket.description, 150)}</p>
                </div>
                <div class="ticket-footer">
                    <div class="ticket-meta">
                        <span class="ticket-status ticket-status-${ticket.status}">
                            ${this.getStatusLabel(ticket.status)}
                        </span>
                        <span class="ticket-date">
                            <i class="fas fa-clock"></i>
                            ${Helpers.getRelativeTime(ticket.createdAt)}
                        </span>
                    </div>
                    <div class="ticket-type">
                        <i class="fas ${this.getTypeIcon(ticket.type)}"></i>
                        ${this.getTypeLabel(ticket.type)}
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = ticketsHtml;
    }

    async createTicket(ticketData) {
        try {
            const result = await apiClient.createTicket(ticketData);
            
            if (result.success) {
                Helpers.showNotification(MESSAGES.SUCCESS.TICKET_CREATED, 'success');
                this.tickets.unshift(result.data);
                this.renderTickets();
                return result.data;
            }
        } catch (error) {
            Helpers.handleError(error, 'create-ticket');
            throw error;
        }
    }

    async updateTicket(ticketId, ticketData) {
        try {
            const result = await apiClient.updateTicket(ticketId, ticketData);
            
            if (result.success) {
                Helpers.showNotification('Ticket actualizado correctamente', 'success');
                
                // Actualizar en la lista
                const index = this.tickets.findIndex(t => t.id === ticketId);
                if (index !== -1) {
                    this.tickets[index] = { ...this.tickets[index], ...ticketData };
                    this.renderTickets();
                }
                
                return result.data;
            }
        } catch (error) {
            Helpers.handleError(error, 'update-ticket');
            throw error;
        }
    }

    async deleteTicket(ticketId) {
        const uiModule = window.cyclops.app.getModule('ui');
        
        uiModule.createConfirmModal(
            'Eliminar Ticket',
            '¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.',
            async () => {
                try {
                    await apiClient.deleteTicket(ticketId);
                    Helpers.showNotification('Ticket eliminado correctamente', 'success');
                    
                    // Remover de la lista
                    this.tickets = this.tickets.filter(t => t.id !== ticketId);
                    this.renderTickets();
                } catch (error) {
                    Helpers.handleError(error, 'delete-ticket');
                }
            }
        );
    }

    viewTicket(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        this.currentTicket = ticket;
        this.openTicketModal('view');
    }

    editTicket(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        this.currentTicket = ticket;
        this.openTicketModal('edit');
    }

    openTicketModal(mode = 'view') {
        const modalId = 'ticketModal_' + Helpers.generateId();
        const ticket = this.currentTicket;
        
        const modalHtml = `
            <div id="${modalId}" class="modal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h3>${mode === 'edit' ? 'Editar Ticket' : 'Detalles del Ticket'}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="ticketForm" data-mode="${mode}">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Título</label>
                                    <input type="text" name="title" class="form-input" value="${Helpers.escapeHtml(ticket.title)}" ${mode === 'view' ? 'readonly' : ''}>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Tipo</label>
                                    <select name="type" class="form-select" ${mode === 'view' ? 'disabled' : ''}>
                                        <option value="technical" ${ticket.type === 'technical' ? 'selected' : ''}>Técnico</option>
                                        <option value="network" ${ticket.type === 'network' ? 'selected' : ''}>Redes</option>
                                        <option value="software" ${ticket.type === 'software' ? 'selected' : ''}>Software</option>
                                        <option value="hardware" ${ticket.type === 'hardware' ? 'selected' : ''}>Hardware</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Urgencia</label>
                                    <select name="urgency" class="form-select" ${mode === 'view' ? 'disabled' : ''}>
                                        <option value="low" ${ticket.urgency === 'low' ? 'selected' : ''}>Baja</option>
                                        <option value="medium" ${ticket.urgency === 'medium' ? 'selected' : ''}>Media</option>
                                        <option value="high" ${ticket.urgency === 'high' ? 'selected' : ''}>Alta</option>
                                        <option value="critical" ${ticket.urgency === 'critical' ? 'selected' : ''}>Crítica</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Estado</label>
                                    <select name="status" class="form-select" ${mode === 'view' ? 'disabled' : ''}>
                                        <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Abierto</option>
                                        <option value="in-progress" ${ticket.status === 'in-progress' ? 'selected' : ''}>En Progreso</option>
                                        <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resuelto</option>
                                        <option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>Cerrado</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Descripción</label>
                                <textarea name="description" class="form-textarea" rows="6" ${mode === 'view' ? 'readonly' : ''}>${Helpers.escapeHtml(ticket.description)}</textarea>
                            </div>
                            ${mode === 'view' ? `
                                <div class="ticket-timeline">
                                    <h4>Historial</h4>
                                    <div class="timeline">
                                        ${this.generateTimelineHtml(ticket)}
                                    </div>
                                </div>
                            ` : ''}
                        </form>
                    </div>
                    <div class="modal-footer">
                        ${mode === 'edit' ? `
                            <button class="btn btn-outline" onclick="window.cyclops.app.getModule('ui').closeModal()">Cancelar</button>
                            <button class="btn btn-primary" onclick="window.cyclops.app.getModule('tickets').saveTicket('${ticket.id}')">Guardar</button>
                        ` : `
                            <button class="btn btn-outline" onclick="window.cyclops.app.getModule('tickets').editTicket('${ticket.id}')">Editar</button>
                            <button class="btn btn-primary" onclick="window.cyclops.app.getModule('ui').closeModal()">Cerrar</button>
                        `}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalsContainer').insertAdjacentHTML('beforeend', modalHtml);
        window.cyclops.app.getModule('ui').openModal(modalId);
    }

    async saveTicket(ticketId) {
        const form = document.getElementById('ticketForm');
        if (!form) return;

        const formData = new FormData(form);
        const ticketData = Helpers.serializeForm(formData);

        try {
            await this.updateTicket(ticketId, ticketData);
            window.cyclops.app.getModule('ui').closeModal();
        } catch (error) {
            console.error('Error saving ticket:', error);
        }
    }

    generateTimelineHtml(ticket) {
        if (!ticket.timeline || ticket.timeline.length === 0) {
            return '<p>No hay historial disponible.</p>';
        }

        return ticket.timeline.map(event => `
            <div class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-title">${event.action}</div>
                    <div class="timeline-date">${Helpers.formatDateTime(event.timestamp)}</div>
                    ${event.description ? `<div class="timeline-description">${event.description}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    // ===== UTILIDADES =====
    
    getStatusLabel(status) {
        const labels = {
            'open': 'Abierto',
            'in-progress': 'En Progreso',
            'resolved': 'Resuelto',
            'closed': 'Cerrado'
        };
        return labels[status] || status;
    }

    getUrgencyLabel(urgency) {
        const labels = {
            'low': 'Baja',
            'medium': 'Media',
            'high': 'Alta',
            'critical': 'Crítica'
        };
        return labels[urgency] || urgency;
    }

    getTypeLabel(type) {
        const labels = {
            'technical': 'Técnico',
            'network': 'Redes',
            'software': 'Software',
            'hardware': 'Hardware'
        };
        return labels[type] || type;
    }

    getTypeIcon(type) {
        const icons = {
            'technical': 'fa-tools',
            'network': 'fa-network-wired',
            'software': 'fa-desktop',
            'hardware': 'fa-microchip'
        };
        return icons[type] || 'fa-ticket-alt';
    }

    // ===== FILTROS Y BÚSQUEDA =====
    
    applyFilters(filters) {
        this.filters = { ...this.filters, ...filters };
        this.loadTickets(this.filters);
    }

    searchTickets(query) {
        if (!query) {
            this.renderTickets();
            return;
        }

        const filteredTickets = this.tickets.filter(ticket => 
            ticket.title.toLowerCase().includes(query.toLowerCase()) ||
            ticket.description.toLowerCase().includes(query.toLowerCase())
        );

        this.renderFilteredTickets(filteredTickets);
    }

    renderFilteredTickets(filteredTickets) {
        const container = document.getElementById('ticketsContainer');
        if (!container) return;

        if (filteredTickets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron tickets</h3>
                    <p>No hay tickets que coincidan con tu búsqueda.</p>
                </div>
            `;
            return;
        }

        // Reutilizar la lógica de renderizado con los tickets filtrados
        const originalTickets = this.tickets;
        this.tickets = filteredTickets;
        this.renderTickets();
        this.tickets = originalTickets;
    }

    // ===== ESTADÍSTICAS =====
    
    getStats() {
        const stats = {
            total: this.tickets.length,
            open: this.tickets.filter(t => t.status === 'open').length,
            inProgress: this.tickets.filter(t => t.status === 'in-progress').length,
            resolved: this.tickets.filter(t => t.status === 'resolved').length,
            closed: this.tickets.filter(t => t.status === 'closed').length
        };

        return stats;
    }

    // ===== MÉTODOS PARA OTROS MÓDULOS =====
    
    getTicketById(ticketId) {
        return this.tickets.find(t => t.id === ticketId);
    }

    getTicketsByStatus(status) {
        return this.tickets.filter(t => t.status === status);
    }

    getTicketsByUrgency(urgency) {
        return this.tickets.filter(t => t.urgency === urgency);
    }
}