document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('submissionForm');
    const statusMessage = document.getElementById('statusMessage');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        statusMessage.className = 'status-message';
        statusMessage.innerHTML = '<p>⏳ Uploading files and submitting data...</p>';
        statusMessage.style.display = 'block';

        try {
            // Collect form data
            const formData = new FormData();
            
            // Add text fields
            formData.append('action', 'submitDocuments');
            formData.append('fullName', document.getElementById('fullName').value);
            formData.append('gradeLevel', document.getElementById('gradeLevel').value);
            formData.append('schoolLevel', document.getElementById('schoolLevel').value);
            formData.append('remarks', document.getElementById('remarks').value);
            formData.append('timestamp', new Date().toISOString());

            // Add files with type indicators
            const fileInputs = [
                { id: 'dailyLessonPlan', type: 'Daily_LessonPlan' },
                { id: 'weeklyLessonPlan', type: 'Weekly_LessonPlan' },
                { id: 'quarterlyLessonPlan', type: 'Quarterly_LessonPlan' },
                { id: 'gradingSheets', type: 'GradingSheet' }
            ];

            let hasFiles = false;
            for (const input of fileInputs) {
                const fileInput = document.getElementById(input.id);
                if (fileInput.files.length > 0) {
                    hasFiles = true;
                    if (input.id === 'gradingSheets') {
                        // Handle multiple files
                        for (let i = 0; i < fileInput.files.length; i++) {
                            await addFileToFormData(formData, fileInput.files[i], input.type, i);
                        }
                    } else {
                        await addFileToFormData(formData, fileInput.files[0], input.type);
                    }
                }
            }

            if (!hasFiles) {
                throw new Error('Please upload at least one file');
            }

            // Send to Google Apps Script
            const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                statusMessage.className = 'status-message success';
                statusMessage.innerHTML = '<p>✅ ' + result.message + '</p>';
                form.reset();
                setTimeout(() => {
                    statusMessage.style.display = 'none';
                }, 5000);
            } else {
                throw new Error(result.message || 'Submission failed');
            }

        } catch (error) {
            statusMessage.className = 'status-message error';
            statusMessage.innerHTML = '<p>❌ Error: ' + error.message + '</p>';
        }
    });

    async function addFileToFormData(formData, file, type, index = 0) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64String = e.target.result.split(',')[1];
                formData.append(`file_${type}_${index}`, base64String);
                formData.append(`fileName_${type}_${index}`, file.name);
                formData.append(`fileType_${type}_${index}`, file.type);
                formData.append(`fileCategory_${type}_${index}`, type);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }
});