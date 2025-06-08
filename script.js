document.addEventListener('DOMContentLoaded', () => {
    const photoUpload = document.getElementById('photoUpload');
    const signatureUpload = document.getElementById('signatureUpload');
    const photoFileNameDisplay = document.getElementById('photoFileName'); // Get span for photo file name
    const signatureFileNameDisplay = document.getElementById('signatureFileName'); // Get span for signature file name
    const processAndDownloadBtn = document.getElementById('processAndDownload');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');

    let photoFile = null;
    let signatureFile = null;
    let originalPhotoName = '';

    // Define border and separator properties
    const borderWidth = 3; // 3px black border (UPDATED)
    const borderColor = '#000'; // Black border color (UPDATED)
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

    // Event listener for photo upload
    photoUpload.addEventListener('change', (event) => {
        photoFile = event.target.files[0];
        if (photoFile) {
            originalPhotoName = photoFile.name.split('.').slice(0, -1).join('.');
            updateFileNameDisplay(photoUpload, photoFileNameDisplay, 'passport_photo.jpg'); // Update display
        } else {
            photoFileNameDisplay.textContent = 'passport_photo.jpg'; // Reset if no file chosen
        }
    });

    // Event listener for signature upload
    signatureUpload.addEventListener('change', (event) => {
        signatureFile = event.target.files[0];
        if (signatureFile) {
            updateFileNameDisplay(signatureUpload, signatureFileNameDisplay, '2025-06-05_10-48.png'); // Update display
        } else {
            signatureFileNameDisplay.textContent = '2025-06-05_10-48.png'; // Reset if no file chosen
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
            // Canvas width: photo width + left border + right border
            const newCanvasWidth = photoImg.width + (2 * borderWidth);
            // Canvas height: top border + photo height + separator height + signature height + bottom border
            const newCanvasHeight = borderWidth + photoImg.height + separatorHeight + calculatedSignatureHeight + borderWidth;


            // Set canvas dimensions
            imageCanvas.width = newCanvasWidth;
            imageCanvas.height = newCanvasHeight;

            // Clear canvas before drawing
            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

            // 1. Draw the main outer black border around the entire combined image
            ctx.strokeStyle = borderColor; // Set border color to black
            ctx.lineWidth = borderWidth; // Set border width to 3px
            ctx.strokeRect(0, 0, newCanvasWidth, newCanvasHeight); // Draw the border

            // 2. Draw the photo image
            // Photo is drawn *inside* the outer border.
            // X-coordinate: starts after the left border
            // Y-coordinate: starts after the top border
            ctx.drawImage(photoImg, borderWidth, borderWidth);

            // 3. Draw the separator line between the photo and signature
            ctx.beginPath();
            ctx.strokeStyle = separatorColor;
            ctx.lineWidth = separatorHeight;

            // Calculate the Y-coordinate for the separator line
            // It's after the top border and the photo's height
            const separatorY = borderWidth + photoImg.height;

            // Draw the line from left border to right border
            ctx.moveTo(borderWidth, separatorY);
            ctx.lineTo(newCanvasWidth - borderWidth, separatorY);
            ctx.stroke();

            // 4. Draw the signature image
            // Signature is drawn *inside* the outer border, *after* the separator line.
            // X-coordinate: starts after the left border
            // Y-coordinate: starts after top border + photo height + separator height
            const signatureX = borderWidth;
            const signatureY = borderWidth + photoImg.height + separatorHeight;
            ctx.drawImage(signatureImg, signatureX, signatureY, desiredSignatureWidth, calculatedSignatureHeight);

            // Generate new file name: (Original Photo Name) + "vacancyhai-online.jpg"
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
