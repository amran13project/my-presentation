// ==========================================
// PRESENTATION CLOUD WORKSPACE
// Full script.js
// ==========================================

// ===============================
// SUPABASE
// ===============================

const SUPABASE_URL = "https://fmqhmubzqkyrtduzvkkf.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_PgfVAhoqgdYJssbfspW7Ig_MlVYzUw2";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ===============================
// DEFAULT PRESENTATION
// ===============================

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


// ===============================
// VARIABLES
// ===============================

let slides = [];
let currentSlide = 0;
let currentPresentationId = null;

let autoSaveTimer = null;

let isEditMode = true;


// ===============================
// DOM ELEMENTS
// ===============================

const editor = document.getElementById("editor");
const slideContainer = document.getElementById("slideContainer");

const slideThumbnails =
  document.getElementById("slideThumbnails");

const slideNumber =
  document.getElementById("slideNumber");

const slideCounter =
  document.getElementById("slideCounter");

const saveStatus =
  document.getElementById("saveStatus");

const previousBtn =
  document.getElementById("previousBtn");

const nextBtn =
  document.getElementById("nextBtn");

const stopBtn =
  document.getElementById("stopBtn");

const saveBtn =
  document.getElementById("saveBtn");

const editBtn =
  document.getElementById("editBtn");

const addImageBtn =
  document.getElementById("addImageBtn");

const addSlideBtn =
  document.getElementById("addSlideBtn");

const newSlideSmallBtn =
  document.getElementById("newSlideSmallBtn");

const deleteSlideBtn =
  document.getElementById("deleteSlideBtn");

const presentBtn =
  document.getElementById("presentBtn");

const imageInput =
  document.getElementById("imageInput");

const savedPresentations =
  document.getElementById("savedPresentations");

const refreshCloudBtn =
  document.getElementById("refreshCloudBtn");


// ===============================
// STATUS
// ===============================

function setStatus(message) {
  if (saveStatus) {
    saveStatus.textContent = message;
  }
}


// ===============================
// LOCAL STORAGE
// ===============================

function saveLocalSlides() {
  localStorage.setItem(
    "myPresentationSlides",
    JSON.stringify(slides)
  );
}

function loadLocalSlides() {
  const saved =
    localStorage.getItem("myPresentationSlides");

  if (saved) {
    try {
      slides = JSON.parse(saved);

      if (!Array.isArray(slides) || slides.length === 0) {
        slides = structuredClone(defaultSlides);
      }
    } catch (error) {
      slides = structuredClone(defaultSlides);
    }
  } else {
    slides = structuredClone(defaultSlides);
  }
}


// ===============================
// HTML ESCAPE
// ===============================

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text || "";

  return div.innerHTML;
}


// ===============================
// RENDER SLIDES
// ===============================

function renderSlides() {
  if (!slideContainer) return;

  slideContainer.innerHTML = "";

  slides.forEach((slide, index) => {

    const slideElement =
      document.createElement("div");

    slideElement.className =
      "slide" +
      (index === currentSlide ? " active" : "");

    slideElement.dataset.index = index;


    // TITLE
    const title =
      document.createElement("div");

    title.className = "slide-title";

    title.contentEditable =
      isEditMode ? "true" : "false";

    title.spellcheck = true;

    title.textContent =
      slide.title || `Slide ${index + 1}`;


    // CONTENT
    const content =
      document.createElement("div");

    content.className = "slide-text";

    content.contentEditable =
      isEditMode ? "true" : "false";

    content.spellcheck = true;

    content.innerHTML =
      slide.content || "Add your content here.";


    // TITLE CHANGE
    title.addEventListener("input", () => {

      slides[index].title =
        title.textContent.trim();

      saveLocalSlides();

      renderThumbnails();

      scheduleAutoSave();
    });


    // CONTENT CHANGE
    content.addEventListener("input", () => {

      slides[index].content =
        content.innerHTML;

      saveLocalSlides();

      scheduleAutoSave();
    });


    slideElement.appendChild(title);
    slideElement.appendChild(content);

    slideContainer.appendChild(slideElement);
  });


  updateSlideUI();
}


// ===============================
// THUMBNAILS
// ===============================

function renderThumbnails() {

  if (!slideThumbnails) return;

  slideThumbnails.innerHTML = "";

  slides.forEach((slide, index) => {

    const thumbnail =
      document.createElement("div");

    thumbnail.className =
      "slide-thumbnail" +
      (index === currentSlide ? " active" : "");


    const number =
      document.createElement("div");

    number.className =
      "thumbnail-number";

    number.textContent =
      index + 1;


    const title =
      document.createElement("div");

    title.className =
      "thumbnail-title";

    title.textContent =
      slide.title || `Slide ${index + 1}`;


    thumbnail.appendChild(number);
    thumbnail.appendChild(title);


    thumbnail.addEventListener("click", () => {

      showSlide(index);
    });


    slideThumbnails.appendChild(thumbnail);
  });
}


// ===============================
// UPDATE UI
// ===============================

function updateSlideUI() {

  if (slideNumber) {
    slideNumber.textContent =
      `Slide ${currentSlide + 1}`;
  }


  if (slideCounter) {
    slideCounter.textContent =
      `${currentSlide + 1} / ${slides.length}`;
  }


  if (previousBtn) {
    previousBtn.disabled =
      currentSlide <= 0;
  }


  if (nextBtn) {
    nextBtn.disabled =
      currentSlide >= slides.length - 1;
  }


  document
    .querySelectorAll(".slide")
    .forEach((slide, index) => {

      slide.classList.toggle(
        "active",
        index === currentSlide
      );
    });


  document
    .querySelectorAll(".slide-thumbnail")
    .forEach((thumbnail, index) => {

      thumbnail.classList.toggle(
        "active",
        index === currentSlide
      );
    });
}


// ===============================
// SHOW SLIDE
// ===============================

function showSlide(index) {

  if (index < 0) {
    index = 0;
  }

  if (index >= slides.length) {
    index = slides.length - 1;
  }

  currentSlide = index;

  updateSlideUI();
}


// ===============================
// NEXT
// ===============================

function nextSlide() {

  if (currentSlide < slides.length - 1) {

    currentSlide++;

    updateSlideUI();
  }
}


// ===============================
// PREVIOUS
// ===============================

function previousSlide() {

  if (currentSlide > 0) {

    currentSlide--;

    updateSlideUI();
  }
}


// ===============================
// EDIT MODE
// ===============================

function setEditMode(enabled) {

  isEditMode = enabled;


  document
    .querySelectorAll(".slide-title, .slide-text")
    .forEach(element => {

      element.contentEditable =
        enabled ? "true" : "false";
    });


  if (editBtn) {

    if (enabled) {

      editBtn.textContent =
        "🔒 Lock";

    } else {

      editBtn.textContent =
        "✏️ Edit";
    }
  }


  if (enabled) {

    setStatus("✏️ Edit mode aktif");

  } else {

    setStatus("🔒 Editing dikunci");
  }
}


// ===============================
// EDIT BUTTON
// ===============================

if (editBtn) {

  editBtn.addEventListener("click", () => {

    setEditMode(!isEditMode);
  });
}


// ===============================
// ADD SLIDE
// ===============================

function addSlide() {

  const newSlide = {

    title:
      `New Slide ${slides.length + 1}`,

    content:
      "Add your content here."
  };


  slides.push(newSlide);

  currentSlide =
    slides.length - 1;


  saveLocalSlides();

  renderSlides();

  renderThumbnails();

  setStatus("➕ Slide ditambah");

  scheduleAutoSave();
}


// TOP ADD SLIDE
if (addSlideBtn) {

  addSlideBtn.addEventListener(
    "click",
    addSlide
  );
}


// SIDEBAR ADD SLIDE
if (newSlideSmallBtn) {

  newSlideSmallBtn.addEventListener(
    "click",
    addSlide
  );
}


// ===============================
// DELETE SLIDE
// ===============================

function deleteCurrentSlide() {

  if (slides.length <= 1) {

    alert(
      "Presentation mesti mempunyai sekurang-kurangnya 1 slide."
    );

    return;
  }


  const confirmDelete =
    confirm(
      `Delete Slide ${currentSlide + 1}?`
    );


  if (!confirmDelete) return;


  slides.splice(currentSlide, 1);


  if (currentSlide >= slides.length) {

    currentSlide =
      slides.length - 1;
  }


  saveLocalSlides();

  renderSlides();

  renderThumbnails();

  setStatus("🗑️ Slide deleted");

  scheduleAutoSave();
}


if (deleteSlideBtn) {

  deleteSlideBtn.addEventListener(
    "click",
    deleteCurrentSlide
  );
}


// ===============================
// SAVE PRESENTATION
// ===============================

async function savePresentation() {

  if (!supabaseClient) {

    setStatus("❌ Supabase tidak tersedia");

    return;
  }


  try {

    setStatus("💾 Saving...");


    const title =
      slides[0]?.title?.trim() ||
      "Untitled Presentation";


    const content =
      JSON.stringify(slides);


    // UPDATE EXISTING
    if (currentPresentationId) {

      const { error } =
        await supabaseClient
          .from("works")
          .update({

            title: title,

            content: content

          })
          .eq(
            "id",
            currentPresentationId
          );


      if (error) {
        throw error;
      }


      setStatus(
        "☁️ Saved to Cloud ✓"
      );

    }

    // INSERT NEW
    else {

      const { data, error } =
        await supabaseClient
          .from("works")
          .insert([{

            title: title,

            content: content

          }])
          .select()
          .single();


      if (error) {
        throw error;
      }


      if (data) {

        currentPresentationId =
          data.id;
      }


      setStatus(
        "☁️ New presentation saved ✓"
      );
    }


    loadCloudPresentations();

  } catch (error) {

    console.error(
      "SAVE ERROR:",
      error
    );


    setStatus(
      "❌ Save gagal"
    );


    alert(
      "Gagal save ke Cloud:\n\n" +
      error.message
    );
  }
}


// SAVE BUTTON
if (saveBtn) {

  saveBtn.addEventListener(
    "click",
    savePresentation
  );
}


// ===============================
// IMAGE UPLOAD
// ===============================

if (addImageBtn) {

  addImageBtn.addEventListener(
    "click",
    () => {

      if (imageInput) {

        imageInput.click();
      }
    }
  );
}


if (imageInput) {

  imageInput.addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];


      if (!file) return;


      if (!file.type.startsWith("image/")) {

        alert(
          "Sila pilih fail gambar."
        );

        return;
      }


      const reader =
        new FileReader();


      reader.onload = function () {

        const imageHTML = `
          <br>
          <img
            src="${reader.result}"
            style="
              max-width:100%;
              max-height:320px;
              border-radius:12px;
              display:block;
              margin:15px auto;
            "
          >
          <br>
        `;


        slides[currentSlide].content =
          (slides[currentSlide].content || "") +
          imageHTML;


        saveLocalSlides();

        renderSlides();

        renderThumbnails();

        setStatus(
          "🖼️ Image ditambah"
        );

        scheduleAutoSave();
      };


      reader.readAsDataURL(file);


      imageInput.value = "";
    }
  );
}


// ===============================
// AUTO SAVE
// ===============================

function scheduleAutoSave() {

  clearTimeout(autoSaveTimer);


  autoSaveTimer =
    setTimeout(async () => {

      if (currentPresentationId) {

        await savePresentation();
      }

    }, 2000);
}


// ===============================
// PRESENTATION MODE
// ===============================

function startPresentation() {

  document.body.classList.add(
    "presentation-mode"
  );


  showSlide(currentSlide);


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


// PRESENT BUTTON
if (presentBtn) {

  presentBtn.addEventListener(
    "click",
    startPresentation
  );
}


// STOP BUTTON
if (stopBtn) {

  stopBtn.addEventListener(
    "click",
    stopPresentation
  );
}


// ===============================
// NAVIGATION BUTTONS
// ===============================

if (previousBtn) {

  previousBtn.addEventListener(
    "click",
    previousSlide
  );
}


if (nextBtn) {

  nextBtn.addEventListener(
    "click",
    nextSlide
  );
}


// ===============================
// KEYBOARD
// ===============================

document.addEventListener(
  "keydown",
  event => {

    if (
      event.target &&
      (
        event.target.isContentEditable ||
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      )
    ) {

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


// ===============================
// CLOUD LOAD
// ===============================

async function loadCloudPresentations() {

  if (!savedPresentations) return;


  savedPresentations.innerHTML =
    `
      <div class="cloud-loading">
        ☁️ Loading presentations...
      </div>
    `;


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
            ascending: false
          }
        );


    if (error) {
      throw error;
    }


    if (!data || data.length === 0) {

      savedPresentations.innerHTML =
        `
          <div class="empty-cloud">
            <div style="font-size:40px;">☁️</div>
            <h3>No presentations</h3>
            <p>Save your first presentation to Cloud.</p>
          </div>
        `;

      return;
    }


    savedPresentations.innerHTML = "";


    data.forEach(
      presentation => {

        const card =
          document.createElement("div");

        card.className =
          "cloud-card";


        const title =
          document.createElement("h3");

        title.textContent =
          presentation.title ||
          "Untitled Presentation";


        const date =
          document.createElement("small");

        date.textContent =
          formatDate(
            presentation.created_at
          );


        const buttons =
          document.createElement("div");

        buttons.className =
          "cloud-card-buttons";


        // OPEN
        const openButton =
          document.createElement("button");

        openButton.className =
          "open-cloud-btn";

        openButton.textContent =
          "📂 Open";


        openButton.addEventListener(
          "click",
          () => {

            loadCloudPresentation(
              presentation
            );
          }
        );


        // EDIT
        const editCloudButton =
          document.createElement("button");

        editCloudButton.className =
          "edit-cloud-btn";

        editCloudButton.textContent =
          "✏️ Edit";


        editCloudButton.addEventListener(
          "click",
          () => {

            editCloudPresentation(
              presentation
            );
          }
        );


        // DELETE
        const deleteButton =
          document.createElement("button");

        deleteButton.className =
          "delete-cloud-btn";

        deleteButton.textContent =
          "🗑️ Delete";


        deleteButton.addEventListener(
          "click",
          () => {

            deleteCloudPresentation(
              presentation.id
            );
          }
        );


        buttons.appendChild(
          openButton
        );

        buttons.appendChild(
          editCloudButton
        );

        buttons.appendChild(
          deleteButton
        );


        card.appendChild(title);

        card.appendChild(date);

        card.appendChild(buttons);


        savedPresentations.appendChild(
          card
        );
      }
    );

  } catch (error) {

    console.error(
      "CLOUD LOAD ERROR:",
      error
    );


    savedPresentations.innerHTML =
      `
        <div class="cloud-error">
          ❌ Gagal load Cloud
          <br>
          <small>${escapeHTML(error.message)}</small>
        </div>
      `;
  }
}


// ===============================
// OPEN CLOUD PRESENTATION
// ===============================

function loadCloudPresentation(
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
      Array.isArray(parsed) &&
      parsed.length > 0
    ) {

      slides = parsed;

    } else {

      slides = [{
        title:
          presentation.title ||
          "Untitled Presentation",

        content:
          "No content"
      }];
    }


    currentSlide = 0;


    saveLocalSlides();

    renderSlides();

    renderThumbnails();

    setEditMode(false);


    setStatus(
      "📂 Presentation opened"
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch (error) {

    console.error(
      "OPEN ERROR:",
      error
    );


    alert(
      "Gagal buka presentation:\n\n" +
      error.message
    );
  }
}


// ===============================
// EDIT CLOUD PRESENTATION
// ===============================

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
      Array.isArray(parsed) &&
      parsed.length > 0
    ) {

      slides = parsed;

    } else {

      slides = [{
        title:
          presentation.title ||
          "Untitled Presentation",

        content:
          "Start editing..."
      }];
    }


    currentSlide = 0;


    saveLocalSlides();

    renderSlides();

    renderThumbnails();


    // IMPORTANT:
    // EDIT MODE ON
    setEditMode(true);


    setStatus(
      "✏️ Edit mode aktif"
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch (error) {

    console.error(
      "EDIT ERROR:",
      error
    );


    alert(
      "Gagal edit presentation:\n\n" +
      error.message
    );
  }
}


// ===============================
// DELETE CLOUD PRESENTATION
// ===============================

async function deleteCloudPresentation(
  id
) {

  const confirmed =
    confirm(
      "Delete this presentation from Cloud?"
    );


  if (!confirmed) return;


  try {

    setStatus(
      "🗑️ Deleting..."
    );


    const { error } =
      await supabaseClient
        .from("works")
        .delete()
        .eq("id", id);


    if (error) {
      throw error;
    }


    if (
      currentPresentationId === id
    ) {

      currentPresentationId =
        null;
    }


    setStatus(
      "🗑️ Presentation deleted"
    );


    await loadCloudPresentations();

  } catch (error) {

    console.error(
      "DELETE ERROR:",
      error
    );


    alert(
      "Delete gagal:\n\n" +
      error.message
    );
  }
}


// ===============================
// REFRESH CLOUD
// ===============================

if (refreshCloudBtn) {

  refreshCloudBtn.addEventListener(
    "click",
    async () => {

      setStatus(
        "🔄 Refreshing Cloud..."
      );


      await loadCloudPresentations();


      setStatus(
        "☁️ Cloud refreshed"
      );
    }
  );
}


// ===============================
// DATE FORMAT
// ===============================

function formatDate(dateString) {

  if (!dateString) {
    return "";
  }


  const date =
    new Date(dateString);


  return date.toLocaleString(
    "ms-MY",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",

      hour: "2-digit",
      minute: "2-digit"
    }
  );
}


// ===============================
// INITIALIZE
// ===============================

function initialize() {

  loadLocalSlides();

  currentSlide = 0;

  renderSlides();

  renderThumbnails();

  setEditMode(true);

  loadCloudPresentations();

  setStatus(
    "Ready ✓"
  );
}


// ===============================
// START APP
// ===============================

initialize();