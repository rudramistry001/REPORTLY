document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const generateBtn = document.getElementById('generate-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const reportContainer = document.getElementById('report-container');
    const onboardingOverlay = document.getElementById('onboarding-overlay');
    const loadingOverlay = document.getElementById('loading-overlay');
    const showOnboardingBtn = document.getElementById('show-onboarding');
    const startAppBtn = document.getElementById('start-app');
    const prevStepBtn = document.getElementById('prev-step');
    const nextStepBtn = document.getElementById('next-step');
    const themeSwitch = document.getElementById('theme-switch');
    const themeLabel = document.getElementById('theme-label');
    const topicsInput = document.getElementById('topics');
    const topicsDescriptionContainer = document.getElementById('topics-description-container');
    const nextToStep2Btn = document.getElementById('next-to-step2');
    const backToStep1Btn = document.getElementById('back-to-step1');
    const stepTabs = document.querySelectorAll('.step-tab');
    const stepContainers = document.querySelectorAll('.step-content-container');
    const tabProgress = document.querySelector('.tab-progress');
    const contentLength = document.getElementById('content-length');
    const previewContent = document.getElementById('preview-content');
    const previewPlaceholder = document.querySelector('.preview-placeholder');

    // Styling elements
    const fontFamily = document.getElementById('font-family');
    const headingSize = document.getElementById('heading-size');
    const bodySize = document.getElementById('body-size');
    const lineHeight = document.getElementById('line-height');
    const headingColor = document.getElementById('heading-color');
    const bodyColor = document.getElementById('body-color');
    const accentColor = document.getElementById('accent-color');
    const backgroundColor = document.getElementById('background-color');
    const alignmentBtns = document.querySelectorAll('.alignment-btn');
    const textAlignment = document.getElementById('text-alignment');
    const marginSize = document.getElementById('margin-size');
    const stylingPreview = document.getElementById('styling-preview');
    const previewHeading = document.querySelector('.preview-heading');
    const previewText = document.querySelectorAll('.preview-text');
    const previewList = document.querySelector('.preview-list');
    
    // New styling elements
    const paragraphSpacing = document.getElementById('paragraph-spacing');
    const textIndent = document.getElementById('text-indent');
    const headingStyle = document.getElementById('heading-style');
    const listStyle = document.getElementById('list-style');
    const addSectionBorders = document.getElementById('add-section-borders');
    const addSectionBackground = document.getElementById('add-section-background');

    // Define API URLs
    const API_URL = 'http://localhost:8000/generate-details';
    const FALLBACK_API_URL = 'http://localhost:8000/manual-generate';

    // Initialize color pickers
    if (typeof $.fn.spectrum !== 'undefined') {
        $('.color-picker').spectrum({
            type: 'component',
            showInput: true,
            showInitial: true,
            showAlpha: false,
            allowEmpty: false,
            preferredFormat: 'hex'
        });

        $('.color-picker').on('change.spectrum', updateStylePreview);
    }

    // Event Listeners
    generateBtn.addEventListener('click', generateReport);
    regenerateBtn.addEventListener('click', generateReport);
    downloadBtn.addEventListener('click', downloadReport);
    downloadPdfBtn.addEventListener('click', downloadPDF);
    showOnboardingBtn.addEventListener('click', () => showOnboarding(true));
    startAppBtn.addEventListener('click', () => showOnboarding(false));
    prevStepBtn.addEventListener('click', goToPrevStep);
    nextStepBtn.addEventListener('click', goToNextStep);
    themeSwitch.addEventListener('change', toggleTheme);
    topicsInput.addEventListener('change', generateTopicDescriptionFields);
    topicsInput.addEventListener('keyup', generateTopicDescriptionFields);
    nextToStep2Btn.addEventListener('click', () => goToFormStep(2));
    backToStep1Btn.addEventListener('click', () => goToFormStep(1));

    // Project details live preview update
    document.getElementById('project-title').addEventListener('input', updateContentPreview);
    document.getElementById('project-brief').addEventListener('input', updateContentPreview);
    contentLength.addEventListener('change', updateContentPreview);

    // Styling event listeners
    fontFamily.addEventListener('change', updateStylePreview);
    headingSize.addEventListener('change', updateStylePreview);
    bodySize.addEventListener('change', updateStylePreview);
    lineHeight.addEventListener('change', updateStylePreview);
    marginSize.addEventListener('change', updateStylePreview);
    
    // New styling event listeners
    paragraphSpacing.addEventListener('change', updateStylePreview);
    textIndent.addEventListener('change', updateStylePreview);
    headingStyle.addEventListener('change', updateStylePreview);
    listStyle.addEventListener('change', updateStylePreview);
    addSectionBorders.addEventListener('change', updateStylePreview);
    addSectionBackground.addEventListener('change', updateStylePreview);

    // Alignment buttons
    alignmentBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            alignmentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            textAlignment.value = btn.getAttribute('data-align');
            updateStylePreview();
        });
    });

    // Step tabs
    stepTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const step = parseInt(tab.getAttribute('data-tab'));
            goToFormStep(step);
        });
    });

    // Onboarding step indicators
    document.querySelectorAll('.step-indicator').forEach(indicator => {
        indicator.addEventListener('click', () => {
            const step = parseInt(indicator.getAttribute('data-step'));
            goToStep(step);
        });
    });

    // Check if it's the user's first visit
    if (!localStorage.getItem('reportly_visited')) {
        showOnboarding(true);
        localStorage.setItem('reportly_visited', 'true');
    } else {
        showOnboarding(false);
    }

    // Check for saved theme preference
    if (localStorage.getItem('reportly_theme') === 'dark') {
        document.body.classList.add('dark-theme');
        themeSwitch.checked = true;
        themeLabel.textContent = 'Light Mode';
    }

    // Initialize style preview
    updateStylePreview();

    // Onboarding Functions
    function showOnboarding(show) {
        if (show) {
            onboardingOverlay.style.display = 'flex';
            goToStep(1); // Reset to first step
        } else {
            onboardingOverlay.style.opacity = '0';
            setTimeout(() => {
                onboardingOverlay.style.display = 'none';
                onboardingOverlay.style.opacity = '1';
            }, 300);
        }
    }

    function goToStep(step) {
        // Hide all steps and deactivate indicators
        document.querySelectorAll('.onboarding-step').forEach(s => {
            s.classList.remove('active');
        });
        document.querySelectorAll('.step-indicator').forEach(i => {
            i.classList.remove('active');
        });

        // Show the selected step and activate its indicator
        document.querySelector(`.onboarding-step[data-step="${step}"]`).classList.add('active');
        document.querySelector(`.step-indicator[data-step="${step}"]`).classList.add('active');

        // Update buttons
        prevStepBtn.disabled = step === 1;
        
        if (step === 3) {
            nextStepBtn.style.display = 'none';
            startAppBtn.style.display = 'block';
        } else {
            nextStepBtn.style.display = 'flex';
            startAppBtn.style.display = 'none';
        }
    }

    function goToNextStep() {
        const currentStep = document.querySelector('.onboarding-step.active');
        const currentStepNum = parseInt(currentStep.getAttribute('data-step'));
        goToStep(currentStepNum + 1);
    }

    function goToPrevStep() {
        const currentStep = document.querySelector('.onboarding-step.active');
        const currentStepNum = parseInt(currentStep.getAttribute('data-step'));
        goToStep(currentStepNum - 1);
    }

    // Form Step Functions
    function goToFormStep(step) {
        // Basic validation for step 1
        if (step > 1) {
            const projectTitle = document.getElementById('project-title').value;
            const projectBrief = document.getElementById('project-brief').value;
            const topics = topicsInput.value;
            
            if (!projectTitle || !projectBrief || !topics) {
                alert('Please fill in all required fields before proceeding.');
                return;
            }
            
            // Update preview
            updateContentPreview();
        }
        
        // Update tabs
        stepTabs.forEach(tab => {
            const tabStep = parseInt(tab.getAttribute('data-tab'));
            if (tabStep === step) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update content containers
        stepContainers.forEach(container => {
            container.classList.remove('active');
        });
        document.getElementById(`step${step}-content`).classList.add('active');
        
        // Update progress bar
        tabProgress.style.width = step === 1 ? '33%' : '100%';
    }

    // Theme Toggle Function
    function toggleTheme() {
        if (themeSwitch.checked) {
            document.body.classList.add('dark-theme');
            themeLabel.textContent = 'Light Mode';
            localStorage.setItem('reportly_theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            themeLabel.textContent = 'Dark Mode';
            localStorage.setItem('reportly_theme', 'light');
        }
        updateStylePreview();
    }

    // Dynamic Topic Description Fields Generation
    function generateTopicDescriptionFields() {
        // Get topics
        const topics = topicsInput.value.split(',').map(topic => topic.trim()).filter(topic => topic !== '');
        
        // Clear existing fields
        topicsDescriptionContainer.innerHTML = '';
        
        // Create fields for each topic
        topics.forEach(topic => {
            if (topic) {
                const topicField = document.createElement('div');
                topicField.className = 'topic-description-item';
                topicField.innerHTML = `
                    <div class="topic-description-header">${topic}</div>
                    <div class="form-group">
                        <textarea class="topic-description" data-topic="${topic}" placeholder="Describe this topic in more detail..."></textarea>
                    </div>
                `;
                topicsDescriptionContainer.appendChild(topicField);
            }
        });
    }

    // Update Content Preview
    function updateContentPreview() {
        const projectTitle = document.getElementById('project-title').value;
        const projectBrief = document.getElementById('project-brief').value;
        const topics = topicsInput.value.split(',').map(topic => topic.trim()).filter(topic => topic !== '');
        
        if (projectTitle && projectBrief && topics.length > 0) {
            previewContent.style.display = 'block';
            previewPlaceholder.style.display = 'none';
            
            previewContent.innerHTML = `
                <h1>${projectTitle}</h1>
                <div class="preview-section">
                    <h2>Brief</h2>
                    <p>${projectBrief}</p>
                </div>
                <div class="preview-section">
                    <h2>Topics</h2>
                    <ul>
                        ${topics.map(topic => `<li>${topic}</li>`).join('')}
                    </ul>
                </div>
                <div class="preview-section">
                    <h2>Content Length</h2>
                    <p>${contentLength.value}</p>
                </div>
            `;
        } else {
            previewContent.style.display = 'none';
            previewPlaceholder.style.display = 'flex';
        }
    }

    // Update Style Preview
    function updateStylePreview() {
        // Apply font family
        stylingPreview.style.fontFamily = fontFamily.value;
        
        // Apply sizes
        previewHeading.style.fontSize = headingSize.value;
        previewText.forEach(p => {
            p.style.fontSize = bodySize.value;
        });
        previewList.style.fontSize = bodySize.value;
        
        // Apply line height
        stylingPreview.style.lineHeight = lineHeight.value;
        
        // Apply colors
        previewHeading.style.color = headingColor.value || '#4a6bff';
        previewText.forEach(p => {
            p.style.color = bodyColor.value || '#333333';
        });
        previewList.style.color = bodyColor.value || '#333333';
        stylingPreview.style.backgroundColor = backgroundColor.value || '#ffffff';
        
        // Apply alignment
        stylingPreview.style.textAlign = textAlignment.value;
        
        // Apply margins
        let marginValue;
        switch (marginSize.value) {
            case 'narrow':
                marginValue = '10px';
                break;
            case 'wide':
                marginValue = '40px';
                break;
            case 'extra-wide':
                marginValue = '60px';
                break;
            default:
                marginValue = '20px';
        }
        stylingPreview.querySelector('.card-body').style.padding = marginValue;
        
        // Apply paragraph spacing
        previewText.forEach(p => {
            p.style.marginBottom = paragraphSpacing.value;
        });
        
        // Apply text indent
        previewText.forEach(p => {
            p.style.textIndent = textIndent.value;
        });
        
        // Apply heading style
        switch (headingStyle.value) {
            case 'uppercase':
                previewHeading.style.textTransform = 'uppercase';
                previewHeading.style.textDecoration = 'none';
                break;
            case 'capitalize':
                previewHeading.style.textTransform = 'capitalize';
                previewHeading.style.textDecoration = 'none';
                break;
            case 'underlined':
                previewHeading.style.textTransform = 'none';
                previewHeading.style.textDecoration = 'underline';
                previewHeading.style.textDecorationColor = accentColor.value || '#ff5e62';
                break;
            default:
                previewHeading.style.textTransform = 'none';
                previewHeading.style.textDecoration = 'none';
        }
        
        // Apply list style
        previewList.style.listStyleType = listStyle.value;
        
        // Apply section borders if checked
        if (addSectionBorders.checked) {
            stylingPreview.querySelector('.card-body').style.borderBottom = `1px solid ${accentColor.value || '#ff5e62'}`;
        } else {
            stylingPreview.querySelector('.card-body').style.borderBottom = 'none';
        }
        
        // Apply section background if checked
        if (addSectionBackground.checked) {
            stylingPreview.querySelector('.card-body').style.backgroundColor = 'rgba(0,0,0,0.03)';
        } else {
            stylingPreview.querySelector('.card-body').style.backgroundColor = 'transparent';
        }
        
        // Update live preview in the report container if it exists
        updateReportLivePreview();
    }
    
    // Function to update live preview in the report container
    function updateReportLivePreview() {
        const reportContent = document.querySelector('#report-container .report-content');
        if (reportContent) {
            // Apply all styling to the report content in real-time
            reportContent.style.fontFamily = fontFamily.value;
            reportContent.style.lineHeight = lineHeight.value;
            reportContent.style.textAlign = textAlignment.value;
            reportContent.style.color = bodyColor.value || '#333333';
            reportContent.style.backgroundColor = backgroundColor.value || '#ffffff';
            
            // Apply margins
            let marginValue;
            switch (marginSize.value) {
                case 'narrow':
                    marginValue = '10px';
                    break;
                case 'wide':
                    marginValue = '40px';
                    break;
                case 'extra-wide':
                    marginValue = '60px';
                    break;
                default:
                    marginValue = '20px';
            }
            reportContent.style.padding = marginValue;
            
            // Apply styles to headings
            const headings = reportContent.querySelectorAll('h1, h2');
            headings.forEach(heading => {
                heading.style.fontSize = headingSize.value;
                heading.style.color = headingColor.value || '#4a6bff';
                
                // Apply heading style
                switch (headingStyle.value) {
                    case 'uppercase':
                        heading.style.textTransform = 'uppercase';
                        heading.style.textDecoration = 'none';
                        break;
                    case 'capitalize':
                        heading.style.textTransform = 'capitalize';
                        heading.style.textDecoration = 'none';
                        break;
                    case 'underlined':
                        heading.style.textTransform = 'none';
                        heading.style.textDecoration = 'underline';
                        heading.style.textDecorationColor = accentColor.value || '#ff5e62';
                        break;
                    default:
                        heading.style.textTransform = 'none';
                        heading.style.textDecoration = 'none';
                }
            });
            
            // Apply styles to paragraphs
            const paragraphs = reportContent.querySelectorAll('p');
            paragraphs.forEach(p => {
                p.style.fontSize = bodySize.value;
                p.style.color = bodyColor.value || '#333333';
                p.style.marginBottom = paragraphSpacing.value;
                p.style.textIndent = textIndent.value;
            });
            
            // Apply styles to lists
            const lists = reportContent.querySelectorAll('ul, ol');
            lists.forEach(list => {
                list.style.fontSize = bodySize.value;
                list.style.color = bodyColor.value || '#333333';
                list.style.listStyleType = listStyle.value;
            });
            
            // Apply section styles
            const sections = reportContent.querySelectorAll('.report-section');
            sections.forEach(section => {
                if (addSectionBorders.checked) {
                    section.style.borderBottom = `1px solid ${accentColor.value || '#ff5e62'}`;
                    section.style.paddingBottom = '20px';
                    section.style.marginBottom = '20px';
                } else {
                    section.style.borderBottom = 'none';
                }
                
                if (addSectionBackground.checked) {
                    section.style.backgroundColor = 'rgba(0,0,0,0.03)';
                    section.style.padding = '15px';
                    section.style.borderRadius = '5px';
                } else {
                    section.style.backgroundColor = 'transparent';
                    section.style.padding = '0';
                }
            });
        }
    }

    // Generate Report Function
    async function generateReport() {
        const projectTitle = document.getElementById('project-title').value;
        const projectBrief = document.getElementById('project-brief').value;
        const topics = topicsInput.value.split(',').map(topic => topic.trim()).filter(topic => topic !== '');
        const selectedContentLength = contentLength.value;

        if (!projectTitle || !projectBrief || topics.length === 0) {
            alert('Please fill in all required fields');
            return;
        }

        // Collect topic descriptions
        const topicDescriptions = {};
        document.querySelectorAll('.topic-description').forEach(desc => {
            const topic = desc.getAttribute('data-topic');
            topicDescriptions[topic] = desc.value.trim();
        });

        // Show loading overlay
        loadingOverlay.style.display = 'flex';

        try {
            // Prepare request data
            const requestData = {
                brief: projectBrief,
                topics: topics,
                topic_descriptions: topicDescriptions,
                content_length: selectedContentLength
            };

            // Try to get AI-generated content from the API
            const aiContent = await fetchAIContent(requestData);
            
            // Clear previous report
            reportContainer.innerHTML = '';

            // Create report structure
            const report = document.createElement('div');
            report.className = 'report-content';
            report.id = 'report-pdf-content';

            // Apply base styling to report
            report.style.fontFamily = fontFamily.value;
            report.style.lineHeight = lineHeight.value;
            report.style.textAlign = textAlignment.value;
            report.style.color = bodyColor.value || '#333333';
            report.style.backgroundColor = backgroundColor.value || '#ffffff';
            
            // Add padding based on margin setting
            let marginValue;
            switch (marginSize.value) {
                case 'narrow':
                    marginValue = '10px';
                    break;
                case 'wide':
                    marginValue = '40px';
                    break;
                case 'extra-wide':
                    marginValue = '60px';
                    break;
                default:
                    marginValue = '20px';
            }
            report.style.padding = marginValue;

            // Add title
            const title = document.createElement('h1');
            title.textContent = projectTitle;
            title.style.fontSize = headingSize.value;
            title.style.color = headingColor.value || '#4a6bff';
            
            // Apply heading style to title
            switch (headingStyle.value) {
                case 'uppercase':
                    title.style.textTransform = 'uppercase';
                    break;
                case 'capitalize':
                    title.style.textTransform = 'capitalize';
                    break;
                case 'underlined':
                    title.style.textDecoration = 'underline';
                    title.style.textDecorationColor = accentColor.value || '#ff5e62';
                    break;
            }
            
            report.appendChild(title);

            // Add brief
            const brief = document.createElement('div');
            brief.className = 'report-section';
            
            // Create brief heading with styling
            const briefHeading = document.createElement('h2');
            briefHeading.textContent = 'Project Brief';
            briefHeading.style.fontSize = headingSize.value;
            briefHeading.style.color = headingColor.value || '#4a6bff';
            
            // Apply heading style to brief heading
            switch (headingStyle.value) {
                case 'uppercase':
                    briefHeading.style.textTransform = 'uppercase';
                    break;
                case 'capitalize':
                    briefHeading.style.textTransform = 'capitalize';
                    break;
                case 'underlined':
                    briefHeading.style.textDecoration = 'underline';
                    briefHeading.style.textDecorationColor = accentColor.value || '#ff5e62';
                    break;
            }
            
            brief.appendChild(briefHeading);
            
            // Create brief paragraph with styling
            const briefPara = document.createElement('p');
            briefPara.textContent = projectBrief;
            briefPara.style.fontSize = bodySize.value;
            briefPara.style.color = bodyColor.value || '#333333';
            briefPara.style.marginBottom = paragraphSpacing.value;
            briefPara.style.textIndent = textIndent.value;
            brief.appendChild(briefPara);
            
            // Apply section styling
            if (addSectionBorders.checked) {
                brief.style.borderBottom = `1px solid ${accentColor.value || '#ff5e62'}`;
                brief.style.paddingBottom = '20px';
                brief.style.marginBottom = '20px';
            }
            
            if (addSectionBackground.checked) {
                brief.style.backgroundColor = 'rgba(0,0,0,0.03)';
                brief.style.padding = '15px';
                brief.style.borderRadius = '5px';
                brief.style.marginBottom = '20px';
            }
            
            report.appendChild(brief);

            // Process AI response
            if (aiContent) {
                // Add content for each topic
                topics.forEach((topic, index) => {
                    const section = document.createElement('div');
                    section.className = 'report-section';
                    
                    // Add heading with styling
                    const topicHeader = document.createElement('h2');
                    topicHeader.textContent = `${index + 1}. ${topic}`;
                    topicHeader.style.fontSize = headingSize.value;
                    topicHeader.style.color = headingColor.value || '#4a6bff';
                    
                    // Apply heading style
                    switch (headingStyle.value) {
                        case 'uppercase':
                            topicHeader.style.textTransform = 'uppercase';
                            break;
                        case 'capitalize':
                            topicHeader.style.textTransform = 'capitalize';
                            break;
                        case 'underlined':
                            topicHeader.style.textDecoration = 'underline';
                            topicHeader.style.textDecorationColor = accentColor.value || '#ff5e62';
                            break;
                    }
                    
                    section.appendChild(topicHeader);
                    
                    // Add content if available in AI response
                    if (aiContent[topic]) {
                        const content = document.createElement('div');
                        content.innerHTML = aiContent[topic]; // Already HTML formatted with <p> tags
                        
                        // Apply styling to paragraphs
                        const paragraphs = content.querySelectorAll('p');
                        paragraphs.forEach(p => {
                            p.style.fontSize = bodySize.value;
                            p.style.color = bodyColor.value || '#333333';
                            p.style.marginBottom = paragraphSpacing.value;
                            p.style.textIndent = textIndent.value;
                        });
                        
                        // Apply styling to lists
                        const lists = content.querySelectorAll('ul, ol');
                        lists.forEach(list => {
                            list.style.fontSize = bodySize.value;
                            list.style.listStyleType = listStyle.value;
                        });
                        
                        section.appendChild(content);
                    } else {
                        // Fallback if topic not found in AI response
                        const fallbackContent = document.createElement('p');
                        fallbackContent.textContent = `Information about ${topic.toLowerCase()} will be detailed here.`;
                        fallbackContent.style.fontSize = bodySize.value;
                        fallbackContent.style.color = bodyColor.value || '#333333';
                        fallbackContent.style.marginBottom = paragraphSpacing.value;
                        fallbackContent.style.textIndent = textIndent.value;
                        section.appendChild(fallbackContent);
                    }
                    
                    // Apply section styling
                    if (addSectionBorders.checked) {
                        section.style.borderBottom = `1px solid ${accentColor.value || '#ff5e62'}`;
                        section.style.paddingBottom = '20px';
                        section.style.marginBottom = '20px';
                    }
                    
                    if (addSectionBackground.checked) {
                        section.style.backgroundColor = 'rgba(0,0,0,0.03)';
                        section.style.padding = '15px';
                        section.style.borderRadius = '5px';
                        section.style.marginBottom = '20px';
                    }
                    
                    report.appendChild(section);
                });
            } else {
                // Fallback to basic report generation
                generateBasicReport(report, topics, topicDescriptions);
            }

            // Add conclusion
            const conclusion = document.createElement('div');
            conclusion.className = 'report-section';
            
            // Create conclusion heading with styling
            const conclusionHeading = document.createElement('h2');
            conclusionHeading.textContent = 'Conclusion';
            conclusionHeading.style.fontSize = headingSize.value;
            conclusionHeading.style.color = headingColor.value || '#4a6bff';
            
            // Apply heading style
            switch (headingStyle.value) {
                case 'uppercase':
                    conclusionHeading.style.textTransform = 'uppercase';
                    break;
                case 'capitalize':
                    conclusionHeading.style.textTransform = 'capitalize';
                    break;
                case 'underlined':
                    conclusionHeading.style.textDecoration = 'underline';
                    conclusionHeading.style.textDecorationColor = accentColor.value || '#ff5e62';
                    break;
            }
            
            conclusion.appendChild(conclusionHeading);
            
            // Create conclusion paragraph with styling
            const conclusionPara = document.createElement('p');
            conclusionPara.textContent = 'This report summarizes the key findings and recommendations based on the project brief and analysis.';
            conclusionPara.style.fontSize = bodySize.value;
            conclusionPara.style.color = bodyColor.value || '#333333';
            conclusionPara.style.marginBottom = paragraphSpacing.value;
            conclusionPara.style.textIndent = textIndent.value;
            conclusion.appendChild(conclusionPara);
            
            // Apply section styling
            if (addSectionBorders.checked) {
                conclusion.style.borderBottom = `1px solid ${accentColor.value || '#ff5e62'}`;
                conclusion.style.paddingBottom = '20px';
                conclusion.style.marginBottom = '20px';
            }
            
            if (addSectionBackground.checked) {
                conclusion.style.backgroundColor = 'rgba(0,0,0,0.03)';
                conclusion.style.padding = '15px';
                conclusion.style.borderRadius = '5px';
            }
            
            report.appendChild(conclusion);

            // Add report to container
            reportContainer.appendChild(report);

            // Enable buttons
            downloadBtn.disabled = false;
            downloadPdfBtn.disabled = false;
            regenerateBtn.disabled = false;
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again later.');
            // Fallback to basic report in case of error
            generateBasicReport(reportContainer, topics, {});
        } finally {
            // Hide loading overlay
            loadingOverlay.style.display = 'none';
        }
    }

    // Function to fetch AI-generated content from the server
    async function fetchAIContent(requestData) {
        try {
            console.log('Sending API request with data:', requestData);
            
            // Ensure we have the required fields and they're not empty
            if (!requestData.brief || requestData.brief.trim() === '') {
                console.error('Error: Project brief is empty');
                alert('Error: Project brief cannot be empty');
                return null;
            }
            
            if (!requestData.topics || requestData.topics.length === 0) {
                console.error('Error: No topics provided');
                alert('Error: You must provide at least one topic');
                return null;
            }
            
            let response;
            let data;
            let error = null;
            
            // Try the primary endpoint first
            try {
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });
                
                if (!response.ok) {
                    error = `HTTP error with primary endpoint! status: ${response.status}`;
                    console.warn(error);
                    throw new Error(error);
                }
                
                data = await response.json();
                console.log('API response from primary endpoint:', data);
            } catch (primaryError) {
                console.warn('Primary endpoint failed, trying fallback endpoint:', primaryError);
                
                // Try fallback endpoint if primary fails
                try {
                    response = await fetch(FALLBACK_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestData)
                    });
                    
                    if (!response.ok) {
                        error = `HTTP error with fallback endpoint! status: ${response.status}`;
                        console.error(error);
                        throw new Error(error);
                    }
                    
                    data = await response.json();
                    console.log('API response from fallback endpoint:', data);
                } catch (fallbackError) {
                    console.error('Both endpoints failed:', fallbackError);
                    throw fallbackError; // Re-throw to be caught by outer try-catch
                }
            }
            
            // Process the AI response to structure it by topics
            if (data && data.response) {
                const responseText = data.response;
                const topics = requestData.topics;
                
                // Parse the response into topic sections
                const topicContent = {};
                
                // Simple parsing - find content between topic headers
                topics.forEach((topic, index) => {
                    // Make the regex more robust to handle various formatting
                    const topicRegex = new RegExp(`${index + 1}[.:]?\\s*${topic}.*?(?=(\\d+[.:]?\\s*.*?)|$)`, 'is');
                    const match = responseText.match(topicRegex);
                    
                    if (match) {
                        // Remove the topic header from the content
                        let content = match[0].replace(new RegExp(`${index + 1}[.:]?\\s*${topic}`, 'i'), '').trim();
                        
                        // Replace newlines with paragraph breaks for HTML
                        content = content.split('\n\n')
                            .filter(para => para.trim().length > 0)
                            .map(para => {
                                // Check if paragraph is a bullet list
                                if (para.includes('\n- ') || para.includes('\n* ')) {
                                    // Convert to HTML list
                                    const listItems = para.split(/\n[-*]\s+/)
                                        .filter(item => item.trim().length > 0)
                                        .map(item => `<li>${item.trim()}</li>`)
                                        .join('');
                                    return `<ul>${listItems}</ul>`;
                                } else if (para.match(/\n\d+\.\s+/)) {
                                    // Convert to numbered list
                                    const listItems = para.split(/\n\d+\.\s+/)
                                        .filter(item => item.trim().length > 0)
                                        .map(item => `<li>${item.trim()}</li>`)
                                        .join('');
                                    return `<ol>${listItems}</ol>`;
                                } else {
                                    return `<p>${para.trim()}</p>`;
                                }
                            })
                            .join('');
                            
                        topicContent[topic] = content;
                    } else {
                        console.warn(`Topic "${topic}" not found in response`);
                    }
                });
                
                return topicContent;
            }
            
            if (error) {
                alert(`Error: ${error}`);
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching AI content:', error);
            alert(`Error generating report: ${error.message}`);
            return null; // Return null to trigger fallback
        }
    }

    // Fallback function to generate a basic report without AI
    function generateBasicReport(container, topics, topicDescriptions) {
        topics.forEach((topic, index) => {
            const section = document.createElement('div');
            section.className = 'report-section';
            
            // Create heading with styling
            const topicHeader = document.createElement('h2');
            topicHeader.textContent = `${index + 1}. ${topic}`;
            topicHeader.style.fontSize = headingSize.value;
            topicHeader.style.color = headingColor.value || '#4a6bff';
            
            // Apply heading style
            switch (headingStyle.value) {
                case 'uppercase':
                    topicHeader.style.textTransform = 'uppercase';
                    break;
                case 'capitalize':
                    topicHeader.style.textTransform = 'capitalize';
                    break;
                case 'underlined':
                    topicHeader.style.textDecoration = 'underline';
                    topicHeader.style.textDecorationColor = accentColor.value || '#ff5e62';
                    break;
            }
            
            section.appendChild(topicHeader);

            // Add topic description if available
            if (topicDescriptions[topic]) {
                const description = document.createElement('p');
                description.textContent = topicDescriptions[topic];
                description.style.fontSize = bodySize.value;
                description.style.color = bodyColor.value || '#333333';
                description.style.marginBottom = paragraphSpacing.value;
                description.style.textIndent = textIndent.value;
                section.appendChild(description);
            }

            // Add content placeholder
            const content = document.createElement('p');
            content.textContent = `This section will contain detailed information about ${topic.toLowerCase()}.`;
            content.style.fontSize = bodySize.value;
            content.style.color = bodyColor.value || '#333333';
            content.style.marginBottom = paragraphSpacing.value;
            content.style.textIndent = textIndent.value;
            section.appendChild(content);
            
            // Apply section styling
            if (addSectionBorders && addSectionBorders.checked) {
                section.style.borderBottom = `1px solid ${accentColor.value || '#ff5e62'}`;
                section.style.paddingBottom = '20px';
                section.style.marginBottom = '20px';
            }
            
            if (addSectionBackground && addSectionBackground.checked) {
                section.style.backgroundColor = 'rgba(0,0,0,0.03)';
                section.style.padding = '15px';
                section.style.borderRadius = '5px';
                section.style.marginBottom = '20px';
            }

            container.appendChild(section);
        });
    }

    // Download HTML Report Function
    function downloadReport() {
        const reportContent = document.getElementById('report-pdf-content').outerHTML;
        const projectTitle = document.getElementById('project-title').value;
        
        // Create HTML document for download
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${projectTitle} - Report</title>
            <style>
                body {
                    font-family: ${fontFamily.value};
                    line-height: ${lineHeight.value};
                    color: ${bodyColor.value || '#333333'};
                    background-color: ${backgroundColor.value || '#ffffff'};
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    text-align: ${textAlignment.value};
                }
                h1, h2 {
                    color: ${headingColor.value || '#4a6bff'};
                    font-size: ${headingSize.value};
                }
                h1 {
                    margin-bottom: 30px;
                }
                p {
                    font-size: ${bodySize.value};
                    margin-bottom: ${paragraphSpacing.value};
                    text-indent: ${textIndent.value};
                }
                .report-section {
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    ${addSectionBorders && addSectionBorders.checked ? 
                      `border-bottom: 1px solid ${accentColor.value || '#ff5e62'};` : ''}
                    ${addSectionBackground && addSectionBackground.checked ? 
                      `background-color: rgba(0,0,0,0.03); padding: 15px; border-radius: 5px;` : ''}
                }
                ul, ol {
                    margin-left: 20px;
                    margin-bottom: 15px;
                    list-style-type: ${listStyle.value};
                }
                ${headingStyle.value === 'uppercase' ? 
                  'h1, h2 { text-transform: uppercase; }' : 
                  headingStyle.value === 'capitalize' ? 
                  'h1, h2 { text-transform: capitalize; }' : 
                  headingStyle.value === 'underlined' ? 
                  `h1, h2 { text-decoration: underline; text-decoration-color: ${accentColor.value || '#ff5e62'}; }` : ''}
                footer {
                    text-align: center;
                    margin-top: 50px;
                    color: #777;
                    font-size: 0.9em;
                }
            </style>
        </head>
        <body>
            <div class="report-content">
                ${reportContent}
            </div>
            <footer>
                <p>Generated with REPORTLY - Smart Report Generator</p>
            </footer>
        </body>
        </html>
        `;
        
        // Create a blob with the report content
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectTitle.replace(/\s+/g, '_')}_report.html`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Download PDF function
    function downloadPDF() {
        const element = document.getElementById('report-pdf-content');
        const projectTitle = document.getElementById('project-title').value;
        const filename = `${projectTitle.replace(/\s+/g, '_')}_report.pdf`;
        
        // Configure PDF options
        const options = {
            margin: [10, 10, 10, 10],
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Generate PDF
        html2pdf().set(options).from(element).save();
    }
}); 