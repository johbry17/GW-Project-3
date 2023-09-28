    let imagesLoaded = false;

    function toggleImages() {
        const imageContainer = document.getElementById("imageContainer");
        const imageSources = [
            "../static/images/Dali_Atomicus.jpg"
        ];

        imageContainer.innerHTML = imagesLoaded ? "" : imageSources.map(src => `<img src="${src}" alt="Image">`).join("");
        imagesLoaded = !imagesLoaded;
    }

    const loadImagesButton = document.getElementById("loadImagesButton");
    loadImagesButton.addEventListener("click", toggleImages);
