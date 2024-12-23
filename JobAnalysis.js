// Define the Job class
class Job {
    constructor({
        "Job No": jobNumber = "Unknown Job No",
        Title: jobTitle = "Unknown Title",
        "Job Page Link": jobLink = "No Link Provided",
        Posted: datePosted = "Unknown Time",
        Type: jobType = "Unknown Type",
        Level: jobLevel = "Unknown Level",
        "Estimated Time": estimatedTime = "Unknown Time",
        Skill: jobSkill = "Unknown Skill",
        Detail: jobDetails = "No Details Provided"
    }) {
        this.jobNumber = jobNumber;
        this.jobTitle = jobTitle;
        this.jobLink = jobLink;
        this.datePosted = datePosted;
        this.jobType = jobType;
        this.jobLevel = jobLevel;
        this.estimatedTime = estimatedTime;
        this.jobSkill = jobSkill;
        this.jobDetails = jobDetails;
    }

    generateDetailsHTML() {
        return `
            <strong>Job No:</strong> ${this.jobNumber}<br>
            <strong>Title:</strong> ${this.jobTitle}<br>
            <strong>Posted:</strong> ${this.datePosted}<br>
            <strong>Type:</strong> ${this.jobType}<br>
            <strong>Level:</strong> ${this.jobLevel}<br>
            <strong>Estimated Time:</strong> ${this.estimatedTime}<br>
            <strong>Skill:</strong> ${this.jobSkill}<br>
            <strong>Details:</strong> ${this.jobDetails}<br>
            <strong>Link:</strong> <a href="${this.jobLink}" target="_blank">View Job</a><br>
        `;
    }
}

// Initialize global variables
let allJobs = [];
let visibleJobs = [];

// DOM references
const fileInput = document.getElementById("file-input");
const jobList = document.getElementById("job-list");
const filterType = document.getElementById("filter-type");
const filterLevel = document.getElementById("filter-level");
const filterSkill = document.getElementById("filter-skill");
const sortOptions = document.getElementById("sort-options");
const applyFiltersBtn = document.getElementById("apply-filters");

// File Upload Handler
fileInput.addEventListener("change", handleFileUpload);

function handleFileUpload() {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsedData = JSON.parse(reader.result);
            validateAndProcessData(parsedData);
        } catch (error) {
            displayError("Invalid JSON file. Please upload a properly formatted file.");
            console.error("Error reading JSON:", error);
        }
    };
    reader.readAsText(file);
}

function validateAndProcessData(data) {
    if (!Array.isArray(data)) {
        displayError("Invalid JSON structure. Expected an array of jobs.");
        return;
    }
    allJobs = data.map((job) => new Job(job));
    visibleJobs = [...allJobs];
    renderJobs(visibleJobs);
    populateFilterOptions();
}

// Display jobs in the job list
function renderJobs(jobsToRender) {
    if (jobsToRender.length === 0) {
        jobList.innerHTML = "<p>No jobs found matching the current criteria.</p>";
        return;
    }
    jobList.innerHTML = jobsToRender
        .map(
            (job) => `
        <div class="job">
            <h3>${job.jobTitle}</h3>
            <p><strong>Posted:</strong> ${job.datePosted}</p>
            <p><em>${job.jobType}, ${job.jobLevel}, ${job.jobSkill}</em></p>
            <p>${job.jobDetails}</p>
            <a href="${job.jobLink}" target="_blank">View Job</a>
        </div>
    `
        )
        .join("");
}

// Populate filter dropdowns
function populateFilterOptions() {
    const jobTypes = extractUniqueValues(allJobs, "jobType");
    const jobLevels = extractUniqueValues(allJobs, "jobLevel");
    const jobSkills = extractUniqueValues(allJobs, "jobSkill");

    fillDropdown(filterType, jobTypes);
    fillDropdown(filterLevel, jobLevels);
    fillDropdown(filterSkill, jobSkills);
}

function extractUniqueValues(jobs, key) {
    return Array.from(new Set(jobs.map((job) => job[key]))).sort();
}

function fillDropdown(dropdown, options) {
    dropdown.innerHTML = `<option value="">All</option>`;
    options.forEach((option) => {
        const newOption = document.createElement("option");
        newOption.value = option;
        newOption.textContent = option;
        dropdown.appendChild(newOption);
    });
}

// Filter and Sort Jobs
applyFiltersBtn.addEventListener("click", applyFiltersAndSorting);

function applyFiltersAndSorting() {
    const selectedType = filterType.value;
    const selectedLevel = filterLevel.value;
    const selectedSkill = filterSkill.value;

    let filteredJobs = [...allJobs];

    if (selectedType) filteredJobs = filteredJobs.filter((job) => job.jobType === selectedType);
    if (selectedLevel) filteredJobs = filteredJobs.filter((job) => job.jobLevel === selectedLevel);
    if (selectedSkill) filteredJobs = filteredJobs.filter((job) => job.jobSkill === selectedSkill);

    const sortBy = sortOptions.value;
    filteredJobs = sortJobs(filteredJobs, sortBy);

    renderJobs(filteredJobs);
}

function sortJobs(jobs, sortBy) {
    switch (sortBy) {
        case "title-asc":
            return jobs.sort((a, b) => a.jobTitle.localeCompare(b.jobTitle));
        case "title-desc":
            return jobs.sort((a, b) => b.jobTitle.localeCompare(a.jobTitle));
        case "posted-new":
            return jobs.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
        case "posted-old":
            return jobs.sort((a, b) => new Date(a.datePosted) - new Date(b.datePosted));
        default:
            return jobs;
    }
}

// Utility Functions
function displayError(message) {
    jobList.innerHTML = `<p class="error">${message}</p>`;
}

// Initial empty state message
jobList.innerHTML = "<p>No jobs to display. Upload a JSON file to get started!</p>";
