document.addEventListener('DOMContentLoaded', () => {
    const photoUpload = document.getElementById('photoUpload');
    const signatureUpload = document.getElementById('signatureUpload');
    const photoFileNameDisplay = document.getElementById('photoFileName');
    const signatureFileNameDisplay = document.getElementById('signatureFileName');
    const processAndDownloadBtn = document.getElementById('processAndDownload');
    const imageCanvas = document.getElementById('imageCanvas'); // Canvas still exists in JS
    const ctx = imageCanvas.getContext('2d');

    let photoFile = null;
    let signatureFile = null;
    let originalPhotoName = '';

    // Define border and separator properties
    const borderWidth = 3; // 3px black border
    const borderColor = '#000'; // Black border color
    const separatorHeight = 2; // 2px separator line thickness
    const separatorColor = '#ccc'; // Light gray separator color

    // Function to update file name display
    const updateFileNameDisplay = (inputElement, displayElement, defaultText) => {
        if (inputElement.files && inputElement.files.length > 0) {
            displayElement.textContent = inputElement.files[0].name;
        } else {
            displayElement.textContent = defaultText;
        }
    };

    // Initialize display with default placeholder texts
    photoFileNameDisplay.textContent = 'passport_photo.jpg';
    signatureFileNameDisplay.textContent = 'signature_photo.png';

    // Event listener for photo upload
    photoUpload.addEventListener('change', (event) => {
        photoFile = event.target.files[0];
        if (photoFile) {
            originalPhotoName = photoFile.name.split('.').slice(0, -1).join('.');
            updateFileNameDisplay(photoUpload, photoFileNameDisplay, 'passport_photo.jpg');
        } else {
            photoFileNameDisplay.textContent = 'passport_photo.jpg';
        }
    });

    // Event listener for signature upload
    signatureUpload.addEventListener('change', (event) => {
        signatureFile = event.target.files[0];
        if (signatureFile) {
            updateFileNameDisplay(signatureUpload, signatureFileNameDisplay, 'signature_photo.png');
        } else {
            signatureFileNameDisplay.textContent = 'signature_photo.png';
        }
    });

    // Helper function to load an image asynchronously
    const loadImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    processAndDownloadBtn.addEventListener('click', async () => {
        if (!photoFile || !signatureFile) {
            alert('Please upload both photo and signature.');
            return;
        }

        try {
            const photoImg = await loadImage(photoFile);
            const signatureImg = await loadImage(signatureFile);

            // Calculate signature dimensions to maintain aspect ratio and match photo width
            const desiredSignatureWidth = photoImg.width;
            const signatureAspectRatio = signatureImg.naturalWidth / signatureImg.naturalHeight;
            const calculatedSignatureHeight = desiredSignatureWidth / signatureAspectRatio;

            // Calculate overall canvas dimensions including borders and separator
            const newCanvasWidth = photoImg.width + (2 * borderWidth);
            const newCanvasHeight = borderWidth + photoImg.height + separatorHeight + calculatedSignatureHeight + borderWidth;

            // Set canvas dimensions
            imageCanvas.width = newCanvasWidth;
            imageCanvas.height = newCanvasHeight;

            // Clear canvas before drawing
            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

            // 1. Draw the main outer black border around the entire combined image
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            ctx.strokeRect(0, 0, newCanvasWidth, newCanvasHeight);

            // 2. Draw the photo image (inside the border)
            ctx.drawImage(photoImg, borderWidth, borderWidth);

            // 3. Draw the separator line between the photo and signature
            ctx.beginPath();
            ctx.strokeStyle = separatorColor;
            ctx.lineWidth = separatorHeight;
            const separatorY = borderWidth + photoImg.height;
            ctx.moveTo(borderWidth, separatorY);
            ctx.lineTo(newCanvasWidth - borderWidth, separatorY);
            ctx.stroke();

            // 4. Draw the signature image (inside the border, after separator)
            const signatureX = borderWidth;
            const signatureY = borderWidth + photoImg.height + separatorHeight;
            ctx.drawImage(signatureImg, signatureX, signatureY, desiredSignatureWidth, calculatedSignatureHeight);

            // Generate new file name
            const newFileName = `${originalPhotoName}vacancyhai-online.jpg`;

            // Download the combined image
            const dataURL = imageCanvas.toDataURL('image/jpeg', 0.9);
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = newFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error processing images:', error);
            alert('Failed to process images. Please ensure valid image files are uploaded.');
        }
    });
});
