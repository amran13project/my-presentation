// =====================================
// PRESENTATION WEBSITE
// =====================================


// =====================================
// VARIABLES
// =====================================

let currentSlide = 0;


// =====================================
// ELEMENTS
// =====================================

const slides =
    document.querySelectorAll(".slide");

const slideNumber =
    document.getElementById("slideNumber");

const presentBtn =
    document.getElementById("presentBtn");

const previousBtn =
    document.getElementById("previousBtn");

const nextBtn =
    document.getElementById("nextBtn");

const stopBtn =
    document.getElementById("stopBtn");

const saveBtn =
    document.getElementById("saveBtn");

const addImageBtn =
    document.getElementById("addImageBtn");

const addSlideBtn =
    document.getElementById("addSlideBtn");

const deleteSlideBtn =
    document.getElementById("deleteSlideBtn");

const imageInput =
    document.getElementById("imageInput");

const saveStatus =
    document.getElementById("saveStatus");


// =====================================
// SHOW SLIDE
// =====================================

function showSlide(index) {

    const allSlides =
        document.querySelectorAll(".slide");


    if (allSlides.length === 0) {
        return;
    }


    if (index >= allSlides.length) {

        index = 0;

    }


    if (index < 0) {

        index = allSlides.length - 1;

    }


    allSlides.forEach(function(slide) {

        slide.classList.remove("active");

    });


    allSlides[index].classList.add("active");


    currentSlide = index;


    slideNumber.textContent =
        (currentSlide + 1) +
        " / " +
        allSlides.length;

}


// =====================================
// NEXT
// =====================================

function nextSlide() {

    showSlide(
        currentSlide + 1
    );

}


// =====================================
// PREVIOUS
// =====================================

function previousSlide() {

    showSlide(
        currentSlide - 1
    );

}


// =====================================
// START PRESENTATION
// =====================================

async function startPresentation() {

    document.body.classList.add(
        "presentation-mode"
    );


    try {

        if (
            !document.fullscreenElement &&
            document.documentElement.requestFullscreen
        ) {

            await document.documentElement.requestFullscreen();

        }

    }

    catch (error) {

        console.log(
            "Fullscreen tidak tersedia:",
            error
        );

    }

}


// =====================================
// STOP PRESENTATION
// =====================================

async function stopPresentation() {

    document.body.classList.remove(
        "presentation-mode"
    );


    try {

        if (document.fullscreenElement) {

            await document.exitFullscreen();

        }

    }

    catch (error) {

        console.log(
            "Gagal keluar fullscreen:",
            error
        );

    }


    document.body.classList.remove(
        "presentation-mode"
    );

}


// =====================================
// SAVE PRESENTATION
// =====================================

function savePresentation() {

    const allSlides =
        document.querySelectorAll(".slide");


    const presentationData = [];


    allSlides.forEach(function(slide) {

        presentationData.push(
            slide.innerHTML
        );

    });


    localStorage.setItem(
        "myPresentation",
        JSON.stringify(presentationData)
    );


    saveStatus.textContent =
        "✓ Presentation disimpan";


    setTimeout(function() {

        saveStatus.textContent =
            "Auto-save aktif";

    }, 2000);

}


// =====================================
// LOAD PRESENTATION
// =====================================

function loadPresentation() {

    const saved =
        localStorage.getItem(
            "myPresentation"
        );


    if (!saved) {

        saveStatus.textContent =
            "Belum ada presentation disimpan";

        return;

    }


    try {

        const presentationData =
            JSON.parse(saved);


        const container =
            document.getElementById(
                "slideContainer"
            );


        container.innerHTML = "";


        presentationData.forEach(
            function(slideHTML) {

                const section =
                    document.createElement(
                        "section"
                    );


                section.className =
                    "slide";


                section.innerHTML =
                    slideHTML;


                container.appendChild(
                    section
                );

            }
        );


        showSlide(0);


        saveStatus.textContent =
            "✓ Presentation dimuat";

    }

    catch (error) {

        console.log(
            "Gagal load presentation:",
            error
        );

    }

}


// =====================================
// AUTO SAVE
// =====================================

let autoSaveTimer;


document.addEventListener(
    "input",
    function(event) {

        if (
            event.target.matches(
                '[contenteditable="true"]'
            )
        ) {

            clearTimeout(
                autoSaveTimer
            );


            autoSaveTimer =
                setTimeout(
                    function() {

                        savePresentation();

                    },
                    1000
                );

        }

    }
);


// =====================================
// ADD IMAGE
// =====================================

addImageBtn.addEventListener(
    "click",
    function() {

        imageInput.click();

    }
);


// =====================================
// IMAGE SELECTED
// =====================================

imageInput.addEventListener(
    "change",
    function(event) {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        if (!file.type.startsWith("image/")) {

            alert(
                "Sila pilih fail gambar."
            );

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function(e) {

                addImageToSlide(
                    e.target.result
                );

            };


        reader.readAsDataURL(file);


        // Reset input
        imageInput.value = "";

    }
);


// =====================================
// ADD IMAGE TO CURRENT SLIDE
// =====================================

function addImageToSlide(imageData) {

    const allSlides =
        document.querySelectorAll(".slide");


    const slide =
        allSlides[currentSlide];


    if (!slide) {
        return;
    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "imageWrapper";


    const image =
        document.createElement(
            "img"
        );


    image.src =
        imageData;


    image.className =
        "slideImage";


    const removeButton =
        document.createElement(
            "button"
        );


    removeButton.className =
        "removeImageBtn";


    removeButton.textContent =
        "×";


    removeButton.title =
        "Buang gambar";


    removeButton.addEventListener(
        "click",
        function() {

            wrapper.remove();

            savePresentation();

        }
    );


    wrapper.appendChild(image);

    wrapper.appendChild(removeButton);


    const content =
        slide.querySelector(
            ".slideContent"
        );


    content.appendChild(
        wrapper
    );


    savePresentation();

}


// =====================================
// ADD NEW SLIDE
// =====================================

addSlideBtn.addEventListener(
    "click",
    function() {

        const container =
            document.getElementById(
                "slideContainer"
            );


        const newSlide =
            document.createElement(
                "section"
            );


        newSlide.className =
            "slide";


        newSlide.innerHTML = `

            <div class="slideContent">

                <h1
                    contenteditable="true"
                    spellcheck="false"
                >
                    Tajuk Baru
                </h1>

                <p
                    contenteditable="true"
                    spellcheck="false"
                >
                    Tulis isi presentation di sini...
                </p>

            </div>

        `;


        container.appendChild(
            newSlide
        );


        showSlide(
            container.children.length - 1
        );


        savePresentation();

    }
);


// =====================================
// DELETE CURRENT SLIDE
// =====================================

deleteSlideBtn.addEventListener(
    "click",
    function() {

        const allSlides =
            document.querySelectorAll(".slide");


        if (allSlides.length <= 1) {

            alert(
                "Mesti ada sekurang-kurangnya 1 slide."
            );

            return;

        }


        const confirmDelete =
            confirm(
                "Padam slide ini?"
            );


        if (!confirmDelete) {
            return;
        }


        allSlides[currentSlide].remove();


        const remainingSlides =
            document.querySelectorAll(
                ".slide"
            );


        if (
            currentSlide >=
            remainingSlides.length
        ) {

            currentSlide =
                remainingSlides.length - 1;

        }


        showSlide(
            currentSlide
        );


        savePresentation();

    }
);


// =====================================
// BUTTONS
// =====================================

presentBtn.addEventListener(
    "click",
    startPresentation
);


stopBtn.addEventListener(
    "click",
    stopPresentation
);


nextBtn.addEventListener(
    "click",
    nextSlide
);


previousBtn.addEventListener(
    "click",
    previousSlide
);


saveBtn.addEventListener(
    "click",
    savePresentation
);


// =====================================
// KEYBOARD
// =====================================

document.addEventListener(
    "keydown",
    function(event) {

        // Jangan tukar slide ketika
        // sedang menaip teks

        const editing =
            document.activeElement &&
            document.activeElement.isContentEditable;


        if (editing) {

            if (event.key === "Escape") {

                document.activeElement.blur();

            }

            return;

        }


        if (event.key === "ArrowRight") {

            nextSlide();

        }


        if (event.key === "ArrowLeft") {

            previousSlide();

        }


        if (event.key === "Escape") {

            stopPresentation();

        }

    }
);


// =====================================
// FULLSCREEN CHANGE
// =====================================

document.addEventListener(
    "fullscreenchange",
    function() {

        if (!document.fullscreenElement) {

            document.body.classList.remove(
                "presentation-mode"
            );

        }

    }
);


// =====================================
// INITIALIZE
// =====================================

loadPresentation();

showSlide(currentSlide);