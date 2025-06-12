/**
 * This script contains all functionality for the portfolio.html page.
 * It handles project filtering and dynamic rendering of project cards.
 * It depends on 'portfolioDataScript.js' being loaded first.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if the required elements and data exist before proceeding
    const projectListContainer = document.getElementById('project-list-container');
    const skillFilter = document.getElementById('skill-filter');
    const typeFilter = document.getElementById('type-filter');

    if (!projectListContainer || !skillFilter || !typeFilter) {
        console.error("Portfolio filter or container elements not found. Aborting script.");
        return;
    }
    if (typeof projectsData === 'undefined' || projectsData.length === 0) {
        projectListContainer.innerHTML = '<p>Error: Project data could not be loaded.</p>';
        console.error("`projectsData` is not defined. Ensure portfolioDataScript.js is loaded first.");
        return;
    }

    // Map media types to their Font Awesome icon classes
    const iconMap = {
        github: "fab fa-github",
        youtube: "fab fa-youtube",
        steam: "fab fa-steam",
        website: "fas fa-globe",
        "itch-io": "fas fa-gamepad",
        "google-play": "fab fa-google-play",
        link: "fas fa-link"
    };

    /**
     * Renders a list of project objects into the DOM.
     * @param {Array} projectsToDisplay - An array of project objects.
     */
    function renderProjects(projectsToDisplay) {
        projectListContainer.innerHTML = ''; // Clear previous projects
        if (projectsToDisplay.length === 0) {
            projectListContainer.innerHTML = '<p>No projects match the current filters.</p>';
            return;
        }

        projectsToDisplay.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';

            const mediaHTML = project.media?.map(item => {
                const iconClass = iconMap[item.type] || iconMap.link;
                const title = item.title || `View on ${item.type}`;
                const desc = item.desc || item.url;
                return `
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="media-item">
                        <i class="${iconClass} fa-fw"></i>
                        <div class="media-item-info">
                            <span class="media-title">${title}</span>
                            <span class="media-description">${desc}</span>
                        </div>
                    </a>`;
            }).join('') || '';

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
                ${mediaHTML ? `<div class="project-media-list">${mediaHTML}</div>` : ''}
            `;
            projectListContainer.appendChild(card);
        });
    }

    /**
     * Populates the skill filter dropdown from the project data.
     */
    function populateSkillFilter() {
        const allSkills = new Set(projectsData.flatMap(p => p.skills));
        const sortedSkills = Array.from(allSkills).sort((a, b) => a.localeCompare(b));
        skillFilter.innerHTML += sortedSkills.map(skill => `<option value="${skill}">${skill}</option>`).join('');
    }

    /**
     * Filters the projects based on dropdown selections and triggers a re-render.
     */
    function filterAndRender() {
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
    populateSkillFilter();
    filterAndRender(); // Initial render

    // Add event listeners to the filter dropdowns
    skillFilter.addEventListener('change', filterAndRender);
    typeFilter.addEventListener('change', filterAndRender);
});