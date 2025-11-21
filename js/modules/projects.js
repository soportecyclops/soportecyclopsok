class Projects {
    constructor() {
        this.projects = {
            cyclobot: {
                title: "CycloBot",
                subtitle: "Asistente Inteligente con IA",
                icon: "🤖",
                status: "En Desarrollo",
                description: "CycloBot es un asistente inteligente avanzado que utiliza tecnologías de IA para automatizar tareas, proporcionar soporte al cliente 24/7 y optimizar procesos empresariales.",
                features: [
                    "Chatbot conversacional con NLP",
                    "Integración con múltiples plataformas",
                    "Automatización de procesos empresariales",
                    "Análisis predictivo y reportes automáticos",
                    "Soporte multilingüe"
                ],
                techStack: ["Python", "TensorFlow", "React", "Node.js", "MongoDB", "Docker"],
                demoUrl: "https://soportecyclops.github.io/CycloBot/",
                githubUrl: "#",
                images: []
            },
            fileserver: {
                title: "File Server Personal",
                subtitle: "Gestión Segura de Archivos en la Nube",
                icon: "📁",
                status: "Próximamente",
                description: "Servidor de archivos personalizado diseñado para empresas que necesitan una solución segura y escalable para la gestión, compartición y sincronización de archivos.",
                features: [
                    "Almacenamiento en la nube seguro",
                    "Compartición de archivos con permisos granulares",
                    "Sincronización automática entre dispositivos",
                    "Backup automático y recuperación",
                    "Interfaz web intuitiva y responsive"
                ],
                techStack: ["Node.js", "Express", "React", "PostgreSQL", "AWS S3", "Redis"],
                demoUrl: "#",
                githubUrl: "#",
                images: []
            },
            original: {
                title: "Sitio Web Original",
                subtitle: "Versión Base de Soporte Cyclops",
                icon: "🌐",
                status: "Completado",
                description: "La versión original del sitio web de Soporte Cyclops que sirvió como base para el desarrollo de esta nueva versión mejorada con arquitectura moderna y diseño avanzado.",
                features: [
                    "Diseño web responsive",
                    "Información de servicios y contacto",
                    "Optimización para motores de búsqueda",
                    "Interfaz de usuario intuitiva",
                    "Compatibilidad multi-navegador"
                ],
                techStack: ["HTML5", "CSS3", "JavaScript", "GitHub Pages"],
                demoUrl: "https://soportecyclops.github.io/soportecyclopsoficial/",
                githubUrl: "#",
                images: []
            }
        };
    }

    openProject(projectId) {
        const project = this.projects[projectId];
        if (!project) return;

        const modal = document.getElementById('projectModal');
        const title = document.getElementById('projectModalTitle');
        const body = document.getElementById('projectModalBody');

        title.textContent = project.title;
        body.innerHTML = this.generateProjectHTML(project);

        UI.showModal(modal);
    }

    generateProjectHTML(project) {
        return `
            <div class="project-detail-header">
                <div class="project-detail-icon">${project.icon}</div>
                <h2 class="project-detail-title">${project.title}</h2>
                <p class="project-detail-subtitle">${project.subtitle}</p>
                <div class="project-badge" style="margin: 20px auto 0; display: inline-block;">
                    ${project.status}
                </div>
            </div>
            
            <div class="project-detail-content">
                <div class="project-detail-section">
                    <h4>📋 Descripción del Proyecto</h4>
                    <p>${project.description}</p>
                </div>

                <div class="project-detail-section">
                    <h4>✨ Características Principales</h4>
                    <ul style="color: var(--text-secondary); line-height: 1.7; padding-left: 20px;">
                        ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>

                <div class="project-detail-section">
                    <h4>🛠 Stack Tecnológico</h4>
                    <div class="project-tech-stack">
                        ${project.techStack.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
                    </div>
                </div>

                <div class="project-detail-section">
                    <h4>🔗 Enlaces del Proyecto</h4>
                    <div class="project-links">
                        ${project.demoUrl !== '#' ? 
                            `<a href="${project.demoUrl}" target="_blank" class="project-link-primary">
                                Ver Demo en Vivo
                            </a>` : 
                            '<button class="project-link-primary disabled" disabled>Demo Próximamente</button>'
                        }
                        ${project.githubUrl !== '#' ? 
                            `<a href="${project.githubUrl}" target="_blank" class="project-link-secondary">
                                Código Fuente
                            </a>` : 
                            '<button class="project-link-secondary disabled" disabled>Privado</button>'
                        }
                    </div>
                </div>

                <div class="project-detail-section">
                    <h4>📊 Estado Actual</h4>
                    <p>El proyecto se encuentra <strong>${project.status.toLowerCase()}</strong>. 
                    ${project.status === 'En Desarrollo' ? 
                        'Estamos trabajando activamente en nuevas funcionalidades y mejoras.' :
                        project.status === 'Próximamente' ?
                        'Estamos en fase de planificación y desarrollo inicial.' :
                        'El proyecto ha sido completado y está en fase de mantenimiento.'
                    }</p>
                </div>
            </div>
        `;
    }

    init() {
        // Add click listeners to project cards
        document.addEventListener('click', (e) => {
            const projectCard = e.target.closest('.project-card');
            if (projectCard) {
                const projectId = projectCard.onclick.toString().match(/openProject\('(.+)'\)/)[1];
                this.openProject(projectId);
            }
        });

        console.log('Projects module initialized');
    }
}

// Global registration
window.Projects = Projects;
