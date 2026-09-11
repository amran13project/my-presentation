```javascript
// ==========================================
// PRESENTATION CLOUD WORKSPACE
// STABLE FULL SCRIPT
// ==========================================


// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
  "https://fmqhmubzqkyrtduzvkkf.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_PgfVAhoqgdYJssbfspW7Ig_MlVYzUw2";

let supabaseClient = null;

if (
  window.supabase &&
  typeof window.supabase.createClient === "function"
) {
  try {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
  } catch (error) {
    console.error("Supabase error:", error);
  }
}


// ==========================================
// DEFAULT SLIDES
// ==========================================

const defaultSlides = [
  {
    title: "My Presentation",
    content: "Welcome to my presentation!"
  },
  {
    title: "Slide 2",
    content: "Add your content here."
  },
  {
    title: "Slide 3",
    content: "You can edit this slide."
  }
];


// ==========================================
// VARIABLES
// ==========================================

let slides = [];
let currentSlide = 0;
let currentPresentationId = null;
let isEditMode = true;
let autoSaveTimer = null;


// ==========================================
// ELEMENTS
// ==========================================

const editor = document.getElementById("editor");
const slideContainer = document.getElementById("slideContainer");
const slideThumbnails = document.getElementById("slideThumbnails");

const slideNumber = document.getElementById("slideNumber");
const slideCounter = document.getElementById("slideCounter");
const saveStatus = document.getElementById("saveStatus");

const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const stopBtn = document.getElementById("stopBtn");
const saveBtn = document.getElementById("saveBtn");
const editBtn = document.getElementById("editBtn");

const addImageBtn = document.getElementById("addImageBtn");
const addSlideBtn = document.getElementById("addSlideBtn");
const newSlideSmallBtn =
  document.getElementById("newSlideSmallBtn");

const deleteSlideBtn =
  document.getElementById("deleteSlideBtn");

const presentBtn =
  document.getElementById("presentBtn");

const imageInput =
  document.getElementById("imageInput");

const refreshCloudBtn =
  document.getElementById("refreshCloudBtn");

const savedPresentations =
  document.getElementById("savedPresentations");


// ==========================================
// PRESENTATION NAVIGATION
// ==========================================

const presentationNavigation =
  document.getElementById(
    "presentationNavigation"
  );

const presentationPrevBtn =
  document.getElementById(
    "presentationPrevBtn"
  );

const presentationNextBtn =
  document.getElementById(
    "presentationNextBtn"
  );


// ==========================================
// STATUS
// ==========================================

function setStatus(message) {
  if (saveStatus) {
    saveStatus.textContent = message;
  }
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text ?? "";

  return div.innerHTML;
}


// ==========================================
// REMOVE HTML
// ==========================================

function stripHTML(html) {
  const div = document.createElement("div");

  div.innerHTML = html || "";

  return (
    div.textContent ||
    div.innerText ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();
}


// ==========================================
// LOCAL SAVE
// ==========================================

function saveLocalSlides() {
  try {
    localStorage.setItem(
      "myPresentationSlides",
      JSON.stringify(slides)
    );
  } catch (error) {
    console.error("Local save error:", error);
  }
}


// ==========================================
// LOCAL LOAD
// ==========================================

function loadLocalSlides() {
  try {
    const saved =
      localStorage.getItem(
        "myPresentationSlides"
      );

    if (!saved) {
      slides = JSON.parse(
        JSON.stringify(defaultSlides)
      );

      return;
    }

    const parsed = JSON.parse(saved);

    if (
      !Array.isArray(parsed) ||
      parsed.length === 0
    ) {
      slides = JSON.parse(
        JSON.stringify(defaultSlides)
      );

      return;
    }

    slides = parsed;
  } catch (error) {
    console.error("Local load error:", error);

    slides = JSON.parse(
      JSON.stringify(defaultSlides)
    );
  }
}


// ==========================================
// RENDER SLIDES
// ==========================================

function renderSlides() {
  if (!slideContainer) {
    return;
  }

  slideContainer.innerHTML = "";

  slides.forEach(function (slide, index) {

    const slideElement =
      document.createElement("div");

    slideElement.className = "slide";

    if (index === currentSlide) {
      slideElement.classList.add("active");
    }


    const content =
      document.createElement("div");

    content.className =
      "slide-content";


    // TITLE

    const title =
      document.createElement("div");

    title.className =
      "slide-title";

    title.contentEditable =
      isEditMode ? "true" : "false";

    title.textContent =
      slide.title ||
      "Slide " + (index + 1);


    // CONTENT

    const text =
      document.createElement("div");

    text.className =
      "slide-text";

    text.contentEditable =
      isEditMode ? "true" : "false";

    text.innerHTML =
      slide.content || "";


    // TITLE INPUT

    title.addEventListener(
      "input",
      function () {

        slides[index].title =
          this.textContent;

        saveLocalSlides();

        renderThumbnails();

        scheduleAutoSave();
      }
    );


    // CONTENT INPUT

    text.addEventListener(
      "input",
      function () {

        slides[index].content =
          this.innerHTML;

        saveLocalSlides();

        renderThumbnails();

        scheduleAutoSave();
      }
    );


    content.appendChild(title);
    content.appendChild(text);

    slideElement.appendChild(content);

    slideContainer.appendChild(slideElement);
  });


  renderThumbnails();

  updateSlideUI();
}


// ==========================================
// THUMBNAILS
// ==========================================

function renderThumbnails() {
  if (!slideThumbnails) {
    return;
  }

  slideThumbnails.innerHTML = "";

  slides.forEach(function (slide, index) {

    const thumbnail =
      document.createElement("div");

    thumbnail.className =
      "slide-thumbnail";

    if (index === currentSlide) {
      thumbnail.classList.add("active");
    }


    const number =
      document.createElement("div");

    number.className =
      "thumbnail-number";

    number.textContent =
      index + 1;


    const content =
      document.createElement("div");

    content.className =
      "thumbnail-content";


    const title =
      document.createElement("div");

    title.className =
      "thumbnail-title";

    title.textContent =
      slide.title ||
      "Slide " + (index + 1);


    const text =
      document.createElement("div");

    text.className =
      "thumbnail-text";

    text.textContent =
      stripHTML(
        slide.content
      ) ||
      "Empty slide";


    content.appendChild(title);
    content.appendChild(text);

    thumbnail.appendChild(number);
    thumbnail.appendChild(content);


    thumbnail.addEventListener(
      "click",
      function () {

        showSlide(index);

      }
    );


    slideThumbnails.appendChild(
      thumbnail
    );
  });
}


// ==========================================
// UPDATE UI
// ==========================================

function updateSlideUI() {

  const total =
    slides.length;


  const counter =
    (currentSlide + 1) +
    " / " +
    total;


  if (slideNumber) {
    slideNumber.textContent =
      counter;
  }


  if (slideCounter) {
    slideCounter.textContent =
      counter;
  }


  if (previousBtn) {
    previousBtn.disabled =
      currentSlide <= 0;
  }


  if (nextBtn) {
    nextBtn.disabled =
      currentSlide >= total - 1;
  }


  if (presentationPrevBtn) {
    presentationPrevBtn.disabled =
      currentSlide <= 0;
  }


  if (presentationNextBtn) {
    presentationNextBtn.disabled =
      currentSlide >= total - 1;
  }


  document
    .querySelectorAll(".slide")
    .forEach(function (slide, index) {

      slide.classList.toggle(
        "active",
        index === currentSlide
      );

    });


  document
    .querySelectorAll(".slide-thumbnail")
    .forEach(function (thumbnail, index) {

      thumbnail.classList.toggle(
        "active",
        index === currentSlide
      );

    });
}


// ==========================================
// SHOW SLIDE
// ==========================================

function showSlide(index) {

  if (slides.length === 0) {
    return;
  }


  if (index < 0) {
    index = 0;
  }


  if (index >= slides.length) {
    index = slides.length - 1;
  }


  currentSlide = index;

  updateSlideUI();
}


// ==========================================
// NEXT
// ==========================================

function nextSlide() {

  if (
    currentSlide <
    slides.length - 1
  ) {
    currentSlide++;

    updateSlideUI();
  }
}


// ==========================================
// PREVIOUS
// ==========================================

function previousSlide() {

  if (currentSlide > 0) {
    currentSlide--;

    updateSlideUI();
  }
}


// ==========================================
// EDIT MODE
// ==========================================

function setEditMode(enabled) {

  isEditMode =
    enabled;


  document
    .querySelectorAll(
      ".slide-title, .slide-text"
    )
    .forEach(function (element) {

      element.contentEditable =
        enabled
          ? "true"
          : "false";
    });


  if (editBtn) {

    editBtn.textContent =
      enabled
        ? "🔒 Lock"
        : "✏️ Edit";
  }


  setStatus(
    enabled
      ? "✏️ Edit mode aktif"
      : "🔒 Editing locked"
  );
}


// ==========================================
// EDIT BUTTON
// ==========================================

if (editBtn) {

  editBtn.addEventListener(
    "click",
    function () {

      setEditMode(
        !isEditMode
      );

    }
  );

}


// ==========================================
// ADD SLIDE
// ==========================================

function addNewSlide() {

  slides.push({
    title:
      "Slide " + (slides.length + 1),

    content:
      "Add your content here."
  });


  currentSlide =
    slides.length - 1;


  saveLocalSlides();

  renderSlides();


  setStatus(
    "➕ Slide ditambah"
  );


  scheduleAutoSave();
}


if (addSlideBtn) {

  addSlideBtn.addEventListener(
    "click",
    addNewSlide
  );
}


if (newSlideSmallBtn) {

  newSlideSmallBtn.addEventListener(
    "click",
    addNewSlide
  );
}


// ==========================================
// DELETE SLIDE
// ==========================================

if (deleteSlideBtn) {

  deleteSlideBtn.addEventListener(
    "click",
    function () {

      if (slides.length <= 1) {

        alert(
          "Mesti ada sekurang-kurangnya 1 slide."
        );

        return;
      }


      const message =
        "Padam Slide " +
        (currentSlide + 1) +
        "?";


      if (!confirm(message)) {
        return;
      }


      slides.splice(
        currentSlide,
        1
      );


      if (
        currentSlide >=
        slides.length
      ) {

        currentSlide =
          slides.length - 1;
      }


      saveLocalSlides();

      renderSlides();


      setStatus(
        "🗑️ Slide dipadam"
      );


      scheduleAutoSave();
    }
  );
}


// ==========================================
// IMAGE
// ==========================================

if (
  addImageBtn &&
  imageInput
) {

  addImageBtn.addEventListener(
    "click",
    function () {

      imageInput.click();

    }
  );


  imageInput.addEventListener(
    "change",
    function (event) {

      const file =
        event.target.files[0];


      if (!file) {
        return;
      }


      if (
        !file.type.startsWith("image/")
      ) {

        alert(
          "Sila pilih fail gambar."
        );

        imageInput.value =
          "";

        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        function () {

          if (
            !slides[currentSlide]
          ) {
            return;
          }


          const imageHTML =
            '<div style="' +
            'text-align:center;' +
            'margin:25px 0;' +
            '">' +

            '<img ' +
            'src="' +
            reader.result +
            '" ' +
            'alt="Presentation image" ' +
            'style="' +
            'max-width:100%;' +
            'max-height:330px;' +
            'border-radius:12px;' +
            '">' +

            '</div>';


          slides[currentSlide].content +=
            imageHTML;


          saveLocalSlides();

          renderSlides();


          setStatus(
            "🖼️ Image ditambah"
          );


          scheduleAutoSave();
        };


      reader.readAsDataURL(
        file
      );


      imageInput.value =
        "";
    }
  );
}


// ==========================================
// SAVE PRESENTATION
// ==========================================

async function savePresentation() {

  saveLocalSlides();


  if (!supabaseClient) {

    setStatus(
      "💾 Saved locally"
    );

    return;
  }


  setStatus(
    "☁️ Saving..."
  );


  const title =
    slides[0] &&
    slides[0].title
      ? slides[0].title.trim()
      : "Untitled Presentation";


  const data = {

    title: title,

    content:
      JSON.stringify(slides)

  };


  try {

    let result;


    if (
      currentPresentationId
    ) {

      result =
        await supabaseClient
          .from("works")
          .update(data)
          .eq(
            "id",
            currentPresentationId
          )
          .select()
          .single();

    } else {

      result =
        await supabaseClient
          .from("works")
          .insert(data)
          .select()
          .single();
    }


    if (result.error) {

      throw result.error;

    }


    currentPresentationId =
      result.data.id;


    setStatus(
      "☁️✅ Saved to Cloud"
    );


    loadCloudPresentations();

  } catch (error) {

    console.error(
      "Save error:",
      error
    );


    setStatus(
      "⚠️ Local save"
    );

  }
}


// ==========================================
// SAVE BUTTON
// ==========================================

if (saveBtn) {

  saveBtn.addEventListener(
    "click",
    savePresentation
  );

}


// ==========================================
// AUTO SAVE
// ==========================================

function scheduleAutoSave() {

  clearTimeout(
    autoSaveTimer
  );


  autoSaveTimer =
    setTimeout(
      function () {

        if (
          currentPresentationId
        ) {

          savePresentation();
        }

      },
      2000
    );
}


// ==========================================
// CLOUD LIST
// ==========================================

async function loadCloudPresentations() {

  if (
    !supabaseClient ||
    !savedPresentations
  ) {
    return;
  }


  savedPresentations.innerHTML =
    "☁️ Loading...";


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("works")
        .select("*")
        .order(
          "created_at",
          {
            ascending:
              false
          }
        );


    if (error) {
      throw error;
    }


    if (
      !data ||
      data.length === 0
    ) {

      savedPresentations.innerHTML =
        "Belum ada presentation disimpan.";

      return;
    }


    savedPresentations.innerHTML =
      "";


    data.forEach(
      function (presentation) {

        const card =
          document.createElement(
            "div"
          );


        card.className =
          "cloud-presentation";


        const top =
          document.createElement(
            "div"
          );


        const title =
          document.createElement(
            "strong"
          );


        title.textContent =
          presentation.title ||
          "Untitled";


        const date =
          document.createElement(
            "small"
          );


        date.textContent =
          formatDate(
            presentation.created_at
          );


        top.appendChild(title);

        top.appendChild(date);


        const actions =
          document.createElement(
            "div"
          );


        // OPEN

        const openButton =
          document.createElement(
            "button"
          );

        openButton.className =
          "open-cloud-btn";

        openButton.textContent =
          "📂 Buka";


        openButton.addEventListener(
          "click",
          function () {

            openCloudPresentation(
              presentation
            );

          }
        );


        // EDIT

        const editButton =
          document.createElement(
            "button"
          );

        editButton.className =
          "edit-cloud-btn";

        editButton.textContent =
          "✏️ Edit";


        editButton.addEventListener(
          "click",
          function () {

            editCloudPresentation(
              presentation
            );

          }
        );


        // DELETE

        const deleteButton =
          document.createElement(
            "button"
          );

        deleteButton.className =
          "delete-cloud-btn";

        deleteButton.textContent =
          "🗑️ Padam";


        deleteButton.addEventListener(
          "click",
          function () {

            deleteCloudPresentation(
              presentation.id
            );

          }
        );


        actions.appendChild(
          openButton
        );

        actions.appendChild(
          editButton
        );

        actions.appendChild(
          deleteButton
        );


        card.appendChild(top);

        card.appendChild(actions);


        savedPresentations.appendChild(
          card
        );

      }
    );

  } catch (error) {

    console.error(
      "Cloud list error:",
      error
    );


    savedPresentations.innerHTML =
      "⚠️ Cloud gagal dimuat.";

  }
}


// ==========================================
// OPEN CLOUD PRESENTATION
// ==========================================

function openCloudPresentation(
  presentation
) {

  try {

    currentPresentationId =
      presentation.id;


    const parsed =
      JSON.parse(
        presentation.content
      );


    if (
      !Array.isArray(parsed)
    ) {

      throw new Error(
        "Invalid presentation"
      );

    }


    slides =
      parsed;


    currentSlide =
      0;


    saveLocalSlides();

    renderSlides();

    setEditMode(false);


    setStatus(
      "📂 Presentation dibuka"
    );

  } catch (error) {

    console.error(
      "Open error:",
      error
    );


    alert(
      "Gagal buka presentation."
    );

  }
}


// ==========================================
// EDIT CLOUD PRESENTATION
// ==========================================

function editCloudPresentation(
  presentation
) {

  try {

    currentPresentationId =
      presentation.id;


    const parsed =
      JSON.parse(
        presentation.content
      );


    if (
      !Array.isArray(parsed)
    ) {

      throw new Error(
        "Invalid presentation"
      );

    }


    slides =
      parsed;


    currentSlide =
      0;


    saveLocalSlides();

    renderSlides();

    setEditMode(true);


    setStatus(
      "✏️ Presentation sedang diedit"
    );


    if (editor) {

      editor.scrollIntoView({
        behavior:
          "smooth",

        block:
          "start"
      });

    }

  } catch (error) {

    console.error(
      "Edit error:",
      error
    );


    alert(
      "Gagal edit presentation."
    );

  }
}


// ==========================================
// DELETE CLOUD
// ==========================================

async function deleteCloudPresentation(
  id
) {

  if (
    !confirm(
      "Padam presentation ini dari Cloud?"
    )
  ) {

    return;

  }


  if (!supabaseClient) {

    return;

  }


  try {

    const {
      error
    } =
      await supabaseClient
        .from("works")
        .delete()
        .eq(
          "id",
          id
        );


    if (error) {

      throw error;

    }


    if (
      String(
        currentPresentationId
      ) ===
      String(id)
    ) {

      currentPresentationId =
        null;

    }


    setStatus(
      "🗑️ Presentation dipadam"
    );


    loadCloudPresentations();

  } catch (error) {

    console.error(
      "Delete cloud error:",
      error
    );


    alert(
      "Gagal padam presentation."
    );

  }
}


// ==========================================
// REFRESH CLOUD
// ==========================================

if (refreshCloudBtn) {

  refreshCloudBtn.addEventListener(
    "click",
    function () {

      loadCloudPresentations();

    }
  );

}


// ==========================================
// NORMAL ARROWS
// ==========================================

if (previousBtn) {

  previousBtn.addEventListener(
    "click",
    function () {

      previousSlide();

    }
  );

}


if (nextBtn) {

  nextBtn.addEventListener(
    "click",
    function () {

      nextSlide();

    }
  );

}


// ==========================================
// PRESENT MODE
// ==========================================

function startPresentation() {

  document.body.classList.add(
    "presentation-mode"
  );


  updateSlideUI();


  setStatus(
    "▶ Presentation mode"
  );

}


function stopPresentation() {

  document.body.classList.remove(
    "presentation-mode"
  );


  setStatus(
    "✕ Presentation stopped"
  );

}


if (presentBtn) {

  presentBtn.addEventListener(
    "click",
    function () {

      startPresentation();

    }
  );

}


if (stopBtn) {

  stopBtn.addEventListener(
    "click",
    function () {

      stopPresentation();

    }
  );

}


// ==========================================
// PRESENTATION LEFT
// ==========================================

if (presentationPrevBtn) {

  presentationPrevBtn.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      previousSlide();

    }
  );

}


// ==========================================
// PRESENTATION RIGHT
// ==========================================

if (presentationNextBtn) {

  presentationNextBtn.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      nextSlide();

    }
  );

}


// ==========================================
// KEYBOARD
// ==========================================

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key ===
      "Escape"
    ) {

      stopPresentation();

      return;

    }


    if (
      event.key ===
      "ArrowRight"
    ) {

      nextSlide();

    }


    if (
      event.key ===
      "ArrowLeft"
    ) {

      previousSlide();

    }

  }
);


// ==========================================
// DATE
// ==========================================

function formatDate(
  dateString
) {

  if (!dateString) {
    return "";
  }


  const date =
    new Date(
      dateString
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";
  }


  return date.toLocaleString(
    "ms-MY",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit"
    }
  );
}


// ==========================================
// INITIALIZE
// ==========================================

function initialize() {

  loadLocalSlides();

  currentSlide =
    0;

  renderSlides();

  setEditMode(true);


  if (supabaseClient) {

    loadCloudPresentations();

  } else {

    setStatus(
      "💾 Local mode"
    );

  }

}


// ==========================================
// START
// ==========================================

initialize();
```
