document.addEventListener('DOMContentLoaded', () => {
    // const projectsData = [ ... ]; // THIS BLOCK IS NOW REMOVED

    // This map links a "type" string from the data to a Font Awesome icon class.
    const iconMap = {
        github: "fab fa-github",
        youtube: "fab fa-youtube",
        steam: "fab fa-steam",
        website: "fas fa-globe",
        "itch-io": "fas fa-gamepad",
        "google-play": "fab fa-google-play",
        link: "fas fa-link" // A fallback icon
    };

    const projectListContainer = document.getElementById('project-list-container');
    const skillFilter = document.getElementById('skill-filter');
    const typeFilter = document.getElementById('type-filter');
    const currentYearSpan = document.getElementById('current-year');

    function renderProjects(projectsToDisplay) {
        projectListContainer.innerHTML = '';
        if (!projectsData || projectsData.length === 0) { // Check if projectsData is loaded
            projectListContainer.innerHTML = '<p>Project data not loaded or empty.</p>';
            return;
        }
        if (!projectsToDisplay || projectsToDisplay.length === 0) {
            projectListContainer.innerHTML = '<p>No projects match the current filters.</p>';
            return;
        }

        projectsToDisplay.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            
            const mediaHTML = project.media && project.media.length > 0
                ? `<div class="project-media-list">
                       ${project.media.map(item => {
                           const itemType = item.type || 'link'; 
                           const iconClass = iconMap[itemType] || iconMap.link; 
                           const title = item.title || `View on ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;
                           const desc = item.desc || item.url;
                           
                           return `
                            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="media-item">
                                <i class="${iconClass} fa-fw"></i>
                                <div class="media-item-info">
                                    <span class="media-title">${title}</span>
                                    <span class="media-description">${desc}</span>
                                </div>
                            </a>`;
                       }).join('')}
                   </div>`
                : '';

            card.innerHTML = `
                <h3>${project.title}</h3>
                <span class="project-date">${project.date}</span>
                <div class="project-categories">
                    ${project.categories.map(cat => `<span class="project-category-tag">${cat}</span>`).join('')}
                </div>
                <p class="project-description">${project.description}</p>
                <h4 class="project-skills-title">Skills & Technologies</h4>
                <ul class="project-skills-list">
                    ${project.skills.map(skill => `<li>${skill}</li>`).join('')}
                </ul>
                ${mediaHTML}
            `;
            projectListContainer.appendChild(card);
        });
    }

    function populateSkillFilter() {
        if (!projectsData || projectsData.length === 0) return; // Guard clause
        const allSkills = new Set();
        projectsData.forEach(p => p.skills.forEach(skill => allSkills.add(skill)));
        const sortedSkills = Array.from(allSkills).sort();
        skillFilter.innerHTML += sortedSkills.map(skill => `<option value="${skill}">${skill}</option>`).join('');
    }
    
    function filterAndRender() {
        if (!projectsData || projectsData.length === 0) return; // Guard clause
        const selectedSkill = skillFilter.value;
        const selectedType = typeFilter.value;

        const filteredProjects = projectsData.filter(project => {
            const skillMatch = selectedSkill === 'All' || project.skills.includes(selectedSkill);
            const typeMatch = selectedType === 'All' || project.categories.includes(selectedType);
            return skillMatch && typeMatch;
        });
        
        renderProjects(filteredProjects);
    }

    // --- INITIALIZATION ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Ensure projectsData is available before proceeding
    if (typeof projectsData !== 'undefined' && projectsData.length > 0) {
        populateSkillFilter();
        filterAndRender(); // Initial render of all projects
    } else {
        if (projectListContainer) { // Check if container exists before trying to set its innerHTML
             projectListContainer.innerHTML = '<p>Loading project data...</p>'; // Or some other appropriate message
        }
        console.error("projectsData is not defined or is empty. Make sure portfolioDataScript.js is loaded correctly and before portfolioScript.js.");
    }

    skillFilter.addEventListener('change', filterAndRender);
    typeFilter.addEventListener('change', filterAndRender);
});