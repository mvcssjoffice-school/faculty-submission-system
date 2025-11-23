document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('attendanceForm');
    const statusMessage = document.getElementById('statusMessage');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        statusMessage.className = 'status-message';
        statusMessage.innerHTML = '<p>⏳ Submitting attendance...</p>';
        statusMessage.style.display = 'block';

        try {
            const formData = new FormData();
            
            // Add action type
            formData.append('action', 'submitAttendance');
            
            // Add personal information
            formData.append('surname', document.getElementById('surname').value);
            formData.append('firstName', document.getElementById('firstName').value);
            formData.append('middleName', document.getElementById('middleName').value);
            formData.append('timestamp', new Date().toISOString());
            
            // Add reflection answers
            for (let i = 1; i <= 5; i++) {
                const answer = document.querySelector(`textarea[name="reflection${i}"]`).value;
                formData.append(`reflection${i}`, answer);
            }
            
            // Add anecdotal remarks
            formData.append('anecdotalRemarks', document.getElementById('anecdotalRemarks').value);

            // Add selfie photo
            const selfieInput = document.getElementById('selfie');
            if (selfieInput.files.length > 0) {
                await addPhotoToFormData(formData, selfieInput.files[0]);
            } else {
                throw new Error('Please upload a selfie');
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

    async function addPhotoToFormData(formData, file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64String = e.target.result.split(',')[1];
                formData.append('selfieData', base64String);
                formData.append('selfieFileName', file.name);
                formData.append('selfieType', file.type);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }
});