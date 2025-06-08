document.addEventListener('DOMContentLoaded', () => {
    const photoUpload = document.getElementById('photoUpload');
    const signatureUpload = document.getElementById('signatureUpload');
    const processAndDownloadBtn = document.getElementById('processAndDownload');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');

    let photoFile = null;
    let signatureFile = null;
    let originalPhotoName = '';

    photoUpload.addEventListener('change', (event) => {
        photoFile = event.target.files[0];
        if (photoFile) {
            originalPhotoName = photoFile.name.split('.').slice(0, -1).join('.'); // Get name without extension
            // Optional: Display a preview of the photo
        }
    });

    signatureUpload.addEventListener('change', (event) => {
        signatureFile = event.target.files[0];
        // Optional: Display a preview of the signature
    });

    processAndDownloadBtn.addEventListener('click', async () => {
        if (!photoFile || !signatureFile) {
            alert('Please upload both photo and signature.');
            return;
        }

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
            const photoImg = await loadImage(photoFile);
            const signatureImg = await loadImage(signatureFile);

            // Set canvas dimensions to match the photo
            imageCanvas.width = photoImg.width;
            imageCanvas.height = photoImg.height;

            // Draw photo
            ctx.drawImage(photoImg, 0, 0);

            // ************ SIGNATURE POSITIONING LOGIC CHANGES START ************
            // Signature ki desired width, jo photo ki width ke barabar hogi
            const desiredSignatureWidth = photoImg.width;

            // Signature ka aspect ratio maintain karte hue uski height calculate karein
            // signatureImg.naturalWidth aur signatureImg.naturalHeight original dimensions dete hain
            const signatureAspectRatio = signatureImg.naturalWidth / signatureImg.naturalHeight;
            const calculatedSignatureHeight = desiredSignatureWidth / signatureAspectRatio;

            // Signature ko photo ke bottom par align karein
            // X-coordinate hamesha 0 hoga kyunki yeh photo ki poori width lega
            const signatureX = 0;
            // Y-coordinate bottom se calculate karein, jisse signature photo ke neeche fit ho
            const signatureY = photoImg.height - calculatedSignatureHeight;

            // Draw signature on the canvas with calculated dimensions and position
            ctx.drawImage(signatureImg, signatureX, signatureY, desiredSignatureWidth, calculatedSignatureHeight);
            // ************ SIGNATURE POSITIONING LOGIC CHANGES END ************

            // Generate new file name
            const newFileName = `${originalPhotoName}vacancyhai-online.jpg`;

            // Download the image
            const dataURL = imageCanvas.toDataURL('image/jpeg', 0.9); // 0.9 is JPEG quality
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = newFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error processing images:', error);
            alert('Failed to process images. Please try again.');
        }
    });
});
