document.addEventListener('DOMContentLoaded', () => {
    const photoUpload = document.getElementById('photoUpload');
    const signatureUpload = document.getElementById('signatureUpload');
    const processAndDownloadBtn = document.getElementById('processAndDownload');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');

    let photoFile = null;
    let signatureFile = null;
    let originalPhotoName = '';

    // Define border and separator properties
    const borderWidth = 2; // 2px border for the final output image
    const borderColor = '#333'; // Dark border color (e.g., almost black)
    const separatorHeight = 2; // 2px separator line thickness
    const separatorColor = '#ccc'; // Light gray separator color

    photoUpload.addEventListener('change', (event) => {
        photoFile = event.target.files[0];
        if (photoFile) {
            // Get original photo name without extension for renaming
            originalPhotoName = photoFile.name.split('.').slice(0, -1).join('.');
        }
    });

    signatureUpload.addEventListener('change', (event) => {
        signatureFile = event.target.files[0];
    });

    processAndDownloadBtn.addEventListener('click', async () => {
        if (!photoFile || !signatureFile) {
            alert('Please upload both photo and signature.');
            return;
        }

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

        try {
            // Load both photo and signature images
            const photoImg = await loadImage(photoFile);
            const signatureImg = await loadImage(signatureFile);

            // Calculate signature dimensions to maintain aspect ratio and match photo width
            const desiredSignatureWidth = photoImg.width;
            const signatureAspectRatio = signatureImg.naturalWidth / signatureImg.naturalHeight;
            const calculatedSignatureHeight = desiredSignatureWidth / signatureAspectRatio;

            // Calculate overall canvas dimensions including borders and separator
            // New canvas width: photo width + left border + right border
            const newCanvasWidth = photoImg.width + (2 * borderWidth);
            // New canvas height: top border + photo height + separator height + signature height + bottom border
            const newCanvasHeight = borderWidth + photoImg.height + separatorHeight + calculatedSignatureHeight + borderWidth;


            // Set canvas dimensions
            imageCanvas.width = newCanvasWidth;
            imageCanvas.height = newCanvasHeight;

            // Clear canvas before drawing
            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

            // 1. Draw the main outer border around the entire combined image
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            // The strokeRect draws the border *around* the specified rectangle.
            // So, to draw a border covering the full canvas, we use the canvas dimensions.
            ctx.strokeRect(0, 0, newCanvasWidth, newCanvasHeight);

            // 2. Draw the photo image
            // Photo is drawn *inside* the outer border.
            // X-coordinate: starts after the left border
            // Y-coordinate: starts after the top border
            ctx.drawImage(photoImg, borderWidth, borderWidth);

            // 3. Draw the separator line between the photo and signature
            ctx.beginPath(); // Start a new path for the line
            ctx.strokeStyle = separatorColor;
            ctx.lineWidth = separatorHeight; // Line thickness

            // Calculate the Y-coordinate for the separator line
            // It's after the top border and the photo's height
            const separatorY = borderWidth + photoImg.height;

            // Draw the line from left border to right border
            // X-start: after left border
            // Y-start: at separatorY
            // X-end: before right border (newCanvasWidth - borderWidth)
            // Y-end: at separatorY (horizontal line)
            ctx.moveTo(borderWidth, separatorY);
            ctx.lineTo(newCanvasWidth - borderWidth, separatorY);
            ctx.stroke(); // Execute the drawing of the line

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
            const dataURL = imageCanvas.toDataURL('image/jpeg', 0.9); // Convert canvas content to JPEG data URL (0.9 is quality)
            const a = document.createElement('a'); // Create a temporary anchor element
            a.href = dataURL; // Set its href to the data URL
            a.download = newFileName; // Set the download filename
            document.body.appendChild(a); // Append to body (required for Firefox)
            a.click(); // Programmatically click the anchor to trigger download
            document.body.removeChild(a); // Remove the temporary anchor

        } catch (error) {
            console.error('Error processing images:', error);
            alert('Failed to process images. Please ensure valid image files are uploaded.');
        }
    });
});
