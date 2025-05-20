// script.js
document.addEventListener('DOMContentLoaded', () => {
    const jobForm = document.getElementById('jobForm');
    const jobResultsDiv = document.getElementById('jobResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Check if Jobs data is loaded
    if (typeof Jobs === 'undefined') {
        console.error("Jobs data not found! Make sure jobs-data.js is loaded before script.js");
        jobResultsDiv.innerHTML = "<p class='no-results'>Error: Job data could not be loaded. Please contact support.</p>";
        return;
    }

    jobForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const userMAN = parseInt(document.getElementById('man').value) || 0;
        const userEND = parseInt(document.getElementById('end').value) || 0;
        const userINT = parseInt(document.getElementById('int').value) || 0;

        const availableJobs = findMatchingJobs(userMAN, userEND, userINT);
        displayJobs(availableJobs);
    });

    function findMatchingJobs(man, end, int) {
        const qualifiedCompanies = [];

        Jobs.forEach(company => {
            const qualifiedPositions = company.Positions.filter(position =>
                man >= position.minMAN &&
                end >= position.minEND &&
                int >= position.minINT
            );

            if (qualifiedPositions.length > 0) {
                qualifiedCompanies.push({
                    CompanyType: company.CompanyType,
                    Positions: qualifiedPositions
                });
            }
        });
        return qualifiedCompanies;
    }

    function displayJobs(jobsToDisplay) {
        jobResultsDiv.innerHTML = ''; // Clear previous results

        if (jobsToDisplay.length === 0) {
            resultsTitle.style.display = 'none';
            noResultsMessage.style.display = 'block';
            return;
        }

        resultsTitle.style.display = 'block';
        noResultsMessage.style.display = 'none';

        let animationDelay = 0;

        jobsToDisplay.forEach(company => {
            const companyCard = document.createElement('div');
            companyCard.classList.add('company-card');
            // Apply staggered animation delay
            companyCard.style.animationDelay = `${animationDelay}s`;
            animationDelay += 0.1; // Increment delay for next card

            const companyName = document.createElement('h3');
            companyName.textContent = company.CompanyType;
            companyCard.appendChild(companyName);

            const positionList = document.createElement('ul');
            company.Positions.forEach(position => {
                const listItem = document.createElement('li');
                listItem.textContent = position.roleName;
                positionList.appendChild(listItem);
            });
            companyCard.appendChild(positionList);
            jobResultsDiv.appendChild(companyCard);
        });
    }
});