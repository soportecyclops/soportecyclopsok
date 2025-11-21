// Projects Module - Manejo de proyectos
if (typeof window.Projects === 'undefined') {
    window.Projects = {
        projects: {
            cyclobot: {
                title: "CycloBot",
                subtitle: "Asistente Inteligente con IA", 
                icon: "🤖",
                status: "En Desarrollo",
                description: "Asistente inteligente avanzado con capacidades de IA para automatización de tareas y soporte al cliente 24/7.",
                features: [
                    "Chatbot conversacional con NLP",
                    "Integración multi-plataforma", 
                    "Automatización de procesos",
                    "Análisis predictivo",
                    "Soporte multilingüe"
                ],
                techStack: ["Python", "TensorFlow", "React", "Node.js", "MongoDB"],
                demoUrl: "https://soportecyclops.github.io/CycloBot/",
                githubUrl: "#"
            },
            fileserver: {
                title: "File Server Personal",
                subtitle: "Gestión Segura de Archivos",
                icon: "📁", 
                status: "Próximamente",
                description: "Servidor de archivos personalizado con gestión avanzada y sincronización en la nube.",
                features: [
                    "Almacenamiento seguro en la nube",
                    "Compartición con permisos granulares", 
                    "Sincronización automática",
                    "Backup y recuperación",
                    "Interfaz web intuitiva"
                ],
                techStack: ["Node.js", "Express", "React", "PostgreSQL", "AWS S3"],
                demoUrl: "#",
                githubUrl: "#"
            },
            original: {
                title: "Sitio Web Original", 
                subtitle: "Versión Base de Soporte Cyclops",
                icon: "🌐",
                status: "Completado", 
                description: "Versión original del sitio web que sirvió como base para esta nueva versión mejorada.",
                features: [
                    "Diseño web responsive",
                    "Información de servicios",
                    "Optimización SEO", 
                    "Interfaz intuitiva",
                    "Compatibilidad multi-navegador"
                ],
                techStack: ["HTML5", "CSS3", "JavaScript"],
                demoUrl: "https://soportecyclops.github.io/soportecyclopsoficial/", 
                githubUrl: "#"
            }
        },

        init: function() {
            console.log('🚀 Inicializando Projects module');
            this.bindProjectEvents();
        },

        bindProjectEvents: function() {
            document.addEventListener('click', (e) => {
                const projectCard = e.target.closest('.project-card');
                if (projectCard) {
                    const projectId = this.getProjectIdFromCard(projectCard);
                    if (projectId) {
                        this.openProject(projectId);
                    }
                }
            });
        },

        getProjectIdFromCard: function(card) {
            // Buscar el título del proyecto para identificar cuál es
            const titleElement = card.querySelector('.project-title');
            if (titleElement) {
                const title = titleElement.textContent.toLowerCase();
                if (title.includes('cyclobot')) return 'cyclobot';
                if (title.includes('file server')) return 'fileserver'; 
                if (title.includes('original')) return 'original';
            }
            return null;
        },

        openProject: function(projectId) {
            const project = this.projects[projectId];
            if (!project) {
                console.error('Proyecto no encontrado:', projectId);
                return;
            }

            this.showProjectModal(project);
        },

        showProjectModal: function(project) {
            // Crear modal dinámicamente si no existe
            let modal = document.getElementById('projectModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'projectModal';
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content" style="max-width: 800px;">
                        <div class="modal-header">
                            <h3 id="projectModalTitle">${project.title}</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div id="projectModalBody"></div>
                    </div>
                `;
                document.body.appendChild(modal);

                // Bind close event
                modal.querySelector('.modal-close').onclick = () => {
                    window.UI.hideModal(modal);
                };
            }

            // Actualizar contenido
            document.getElementById('projectModalTitle').textContent = project.title;
            document.getElementById('projectModalBody').innerHTML = this.generateProjectHTML(project);

            // Mostrar modal
            window.UI.showModal(modal);
        },

        generateProjectHTML: function(project) {
            return `
                <div class="project-detail">
                    <div class="project-header" style="
                        background: linear-gradient(135deg, #2563eb, #7c3aed);
                        padding: 2rem;
                        color: white;
                        text-align: center;
                    ">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">${project.icon}</div>
                        <h2 style="margin: 0 0 0.5rem 0;">${project.title}</h2>
                        <p style="margin: 0; opacity: 0.9;">${project.subtitle}</p>
                        <span style="
                            display: inline-block;
                            background: #06d6a0;
                            color: white;
                            padding: 0.5rem 1rem;
                            border-radius: 20px;
                            font-size: 0.8rem;
                            font-weight: 600;
                            margin-top: 1rem;
                        ">${project.status}</span>
                    </div>

                    <div style="padding: 2rem;">
                        <div style="margin-bottom: 2rem;">
                            <h4 style="color: #1e293b; margin-bottom: 1rem;">📋 Descripción</h4>
                            <p style="color: #64748b; line-height: 1.6;">${project.description}</p>
                        </div>

                        <div style="margin-bottom: 2rem;">
                            <h4 style="color: #1e293b; margin-bottom: 1rem;">✨ Características</h4>
                            <ul style="color: #64748b; line-height: 1.6; padding-left: 1.5rem;">
                                ${project.features.map(feat => `<li>${feat}</li>`).join('')}
                            </ul>
                        </div>

                        <div style="margin-bottom: 2rem;">
                            <h4 style="color: #1e293b; margin-bottom: 1rem;">🛠 Tecnologías</h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                ${project.techStack.map(tech => `
                                    <span style="
                                        background: #f1f5f9;
                                        color: #2563eb;
                                        padding: 0.5rem 1rem;
                                        border-radius: 15px;
                                        font-size: 0.8rem;
                                        font-weight: 600;
                                        border: 1px solid #e2e8f0;
                                    ">${tech}</span>
                                `).join('')}
                            </div>
                        </div>

                        <div style="display: flex; gap: 1rem;">
                            ${project.demoUrl !== '#' ? `
                                <a href="${project.demoUrl}" target="_blank" style="
                                    background: #2563eb;
                                    color: white;
                                    padding: 0.75rem 1.5rem;
                                    border-radius: 8px;
                                    text-decoration: none;
                                    font-weight: 600;
                                ">Ver Demo</a>
                            ` : `
                                <button disabled style="
                                    background: #94a3b8;
                                    color: white;
                                    padding: 0.75rem 1.5rem;
                                    border-radius: 8px;
                                    border: none;
                                    font-weight: 600;
                                    cursor: not-allowed;
                                ">Próximamente</button>
                            `}
                            
                            ${project.githubUrl !== '#' ? `
                                <a href="${project.githubUrl}" target="_blank" style="
                                    background: transparent;
                                    color: #2563eb;
                                    padding: 0.75rem 1.5rem;
                                    border-radius: 8px;
                                    text-decoration: none;
                                    font-weight: 600;
                                    border: 2px solid #2563eb;
                                ">Código Fuente</a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
    };

    console.log('✅ Projects module cargado y disponible globalmente');
}
