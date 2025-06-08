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

            // ************ CANVAS DIMENSIONS & SIGNATURE POSITIONING CHANGES START ************

            // Signature ki desired width, jo photo ki width ke barabar hogi
            const desiredSignatureWidth = photoImg.width;

            // Signature ka aspect ratio maintain karte hue uski height calculate karein
            const signatureAspectRatio = signatureImg.naturalWidth / signatureImg.naturalHeight;
            const calculatedSignatureHeight = desiredSignatureWidth / signatureAspectRatio;

            // Nayi canvas ki height = Photo ki height + Signature ki height
            const newCanvasHeight = photoImg.height + calculatedSignatureHeight;

            // Canvas dimensions ko update karein
            imageCanvas.width = photoImg.width;
            imageCanvas.height = newCanvasHeight;

            // Context ko clear karein (agar pehle koi drawing thi)
            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);


            // Photo ko canvas ke top par draw karein
            ctx.drawImage(photoImg, 0, 0);

            // Signature ko photo ke theek neeche draw karein
            // X-coordinate hamesha 0 hoga kyunki yeh photo ki poori width lega
            const signatureX = 0;
            // Y-coordinate photo ki height ke theek baad se shuru hoga
            const signatureY = photoImg.height;

            ctx.drawImage(signatureImg, signatureX, signatureY, desiredSignatureWidth, calculatedSignatureHeight);

            // ************ CANVAS DIMENSIONS & SIGNATURE POSITIONING CHANGES END ************


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
