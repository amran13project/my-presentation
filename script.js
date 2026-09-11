// ==========================================
// PRESENTATION CLOUD WORKSPACE
// FULL SCRIPT
// ==========================================


// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
  "https://fmqhmubzqkyrtduzvkkf.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_PgfVAhoqgdYJssbfspW7Ig_MlVYzUw2";

let supabaseClient = null;

if (window.supabase) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );
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

const editor =
  document.getElementById("editor");

const slideContainer =
  document.getElementById("slideContainer");

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

const refreshCloudBtn =
  document.getElementById("refreshCloudBtn");

const savedPresentations =
  document.getElementById("savedPresentations");


// ==========================================
// PRESENTATION BUTTONS
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

  const div =
    document.createElement("div");

  div.textContent =
    text ?? "";

  return div.innerHTML;

}


// ==========================================
// REMOVE HTML
// ==========================================

function stripHTML(html) {

  const div =
    document.createElement("div");

  div.innerHTML =
    html || "";

  return (
    div.textContent ||
    div.innerText ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();

}


// ==========================================
// LOCAL STORAGE
// ==========================================

function saveLocalSlides() {

  try {

    localStorage.setItem(
      "myPresentationSlides",
      JSON.stringify(slides)
    );

  } catch (error) {

    console.error(
      "Local save error:",
      error
    );

  }

}


function loadLocalSlides() {

  try {

    const saved =
      localStorage.getItem(
        "myPresentationSlides"
      );

    if (!saved) {

      slides =
        JSON.parse(
          JSON.stringify(
            defaultSlides
          )
        );

      return;
    }

    const parsed =
      JSON.parse(saved);

    if (
      !Array.isArray(parsed) ||
      parsed.length === 0
    ) {

      slides =
        JSON.parse(
          JSON.stringify(
            defaultSlides
          )
        );

      return;
    }

    slides = parsed;

  } catch (error) {

    console.error(
      "Load error:",
      error
    );

    slides =
      JSON.parse(
        JSON.stringify(
          defaultSlides
        )
      );

  }

}


// ==========================================
// RENDER SLIDES
// ==========================================

function renderSlides() {

  if (!slideContainer)
    return;

  slideContainer.innerHTML = "";

  slides.forEach(
    (slide, index) => {

      const slideElement =
        document.createElement("div");

      slideElement.className = "slide";

      if (
        index === currentSlide
      ) {

        slideElement.classList.add(
          "active"
        );

      }

      slideElement.dataset.index =
        index;


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
        `Slide ${index + 1}`;


      // CONTENT

      const text =
        document.createElement("div");

      text.className =
        "slide-text";

      text.contentEditable =
        isEditMode ? "true" : "false";

      text.innerHTML =
        slide.content || "";


      // TITLE EDIT

      title.addEventListener(
        "input",
        () => {

          slides[index].title =
            title.textContent;

          saveLocalSlides();

          renderThumbnails();

          scheduleAutoSave();

        }
      );


      // CONTENT EDIT

      text.addEventListener(
        "input",
        () => {

          slides[index].content =
            text.innerHTML;

          saveLocalSlides();

          renderThumbnails();

          scheduleAutoSave();

        }
      );


      content.appendChild(title);
      content.appendChild(text);

      slideElement.appendChild(content);

      slideContainer.appendChild(
        slideElement
      );

    }
  );


  renderThumbnails();

  updateSlideUI();

}


// ==========================================
// THUMBNAILS
// ==========================================

function renderThumbnails() {

  if (!slideThumbnails)
    return;

  slideThumbnails.innerHTML = "";

  slides.forEach(
    (slide, index) => {

      const thumbnail =
        document.createElement("div");

      thumbnail.className =
        "slide-thumbnail";


      if (
        index === currentSlide
      ) {

        thumbnail.classList.add(
          "active"
        );

      }


      thumbnail.innerHTML = `

        <div class="thumbnail-number">
          ${index + 1}
        </div>

        <div class="thumbnail-content">

          <div class="thumbnail-title">
            ${escapeHTML(
              slide.title ||
              `Slide ${index + 1}`
            )}
          </div>

          <div class="thumbnail-text">
            ${escapeHTML(
              stripHTML(
                slide.content
              ) ||
              "Empty slide"
            )}
          </div>

        </div>

      `;


      thumbnail.addEventListener(
        "click",
        () => {

          showSlide(index);

        }
      );


      slideThumbnails.appendChild(
        thumbnail
      );

    }
  );

}


// ==========================================
// UPDATE SLIDE UI
// ==========================================

function updateSlideUI() {

  const total =
    slides.length;

  const counter =
    `${currentSlide + 1} / ${total}`;


  if (slideNumber) {

    slideNumber.textContent =
      counter;

  }


  if (slideCounter) {

    slideCounter.textContent =
      counter;

  }


  // NORMAL BUTTONS

  if (previousBtn) {

    previousBtn.disabled =
      currentSlide === 0;

  }


  if (nextBtn) {

    nextBtn.disabled =
      currentSlide === total - 1;

  }


  // PRESENT BUTTONS

  if (presentationPrevBtn) {

    presentationPrevBtn.disabled =
      currentSlide === 0;

  }


  if (presentationNextBtn) {

    presentationNextBtn.disabled =
      currentSlide === total - 1;

  }


  // SLIDES

  document
    .querySelectorAll(".slide")
    .forEach(
      (slide, index) => {

        slide.classList.toggle(
          "active",
          index === currentSlide
        );

      }
    );


  // THUMBNAILS

  document
    .querySelectorAll(
      ".slide-thumbnail"
    )
    .forEach(
      (thumbnail, index) => {

        thumbnail.classList.toggle(
          "active",
          index === currentSlide
        );

      }
    );

}


// ==========================================
// SHOW SLIDE
// ==========================================

function showSlide(index) {

  if (
    slides.length === 0
  ) {

    return;

  }


  if (index < 0) {

    index = 0;

  }


  if (
    index >= slides.length
  ) {

    index =
      slides.length - 1;

  }


  currentSlide =
    index;

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

  if (
    currentSlide >
    0
  ) {

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
    .forEach(
      element => {

        element.contentEditable =
          enabled
            ? "true"
            : "false";

      }
    );


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
    () => {

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
      `Slide ${slides.length + 1}`,

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
    () => {

      if (
        slides.length <= 1
      ) {

        alert(
          "Mesti ada sekurang-kurangnya 1 slide."
        );

        return;

      }


      if (
        !confirm(
          `Padam Slide ${currentSlide + 1}?`
        )
      ) {

        return;

      }


      slides.splice(
        currentSlide,
        1
      );


      if (
        currentSlide >= slides.length
      ) {

        currentSlide =
          slides.length - 1;

      }


      saveLocalSlides();

      renderSlides();

      setStatus(
        "🗑️ Slide dipadam"
      );

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
    () => {

      imageInput.click();

    }
  );


  imageInput.addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];


      if (!file)
        return;


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "Sila pilih gambar."
        );

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        () => {

          slides[currentSlide].content += `

            <div style="
              text-align:center;
              margin:25px 0;
            ">

              <img
                src="${reader.result}"
                alt="Image"
                style="
                  max-width:100%;
                  max-height:330px;
                  border-radius:12px;
                "
              >

            </div>

          `;


          saveLocalSlides();

          renderSlides();

          setStatus(
            "🖼️ Image ditambah"
          );

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
      "⚠️ Supabase tidak tersedia"
    );

    return;

  }


  setStatus(
    "☁️ Saving..."
  );


  const data = {

    title:
      slides[0]?.title?.trim() ||
      "Untitled Presentation",

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
      "SAVE ERROR:",
      error
    );


    setStatus(
      "❌ Save gagal"
    );

  }

}


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
      () => {

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
      presentation => {

        const card =
          document.createElement(
            "div"
          );


        card.className =
          "cloud-presentation";


        card.innerHTML = `

          <div>

            <strong>
              ${escapeHTML(
                presentation.title ||
                "Untitled"
              )}
            </strong>

            <small>
              ${formatDate(
                presentation.created_at
              )}
            </small>

          </div>

          <div>

            <button class="open-cloud-btn">
              📂 Buka
            </button>

            <button class="edit-cloud-btn">
              ✏️ Edit
            </button>

            <button class="delete-cloud-btn">
              🗑️ Padam
            </button>

          </div>

        `;


        card
          .querySelector(
            ".open-cloud-btn"
          )
          .addEventListener(
            "click",
            () => {

              openCloudPresentation(
                presentation
              );

            }
          );


        card
          .querySelector(
            ".edit-cloud-btn"
          )
          .addEventListener(
            "click",
            () => {

              editCloudPresentation(
                presentation
              );

            }
          );


        card
          .querySelector(
            ".delete-cloud-btn"
          )
          .addEventListener(
            "click",
            () => {

              deleteCloudPresentation(
                presentation.id
              );

            }
          );


        savedPresentations.appendChild(
          card
        );

      }
    );

  } catch (error) {

    console.error(
      "CLOUD ERROR:",
      error
    );


    savedPresentations.innerHTML =
      "❌ Gagal load Cloud";

  }

}


// ==========================================
// OPEN CLOUD
// ==========================================

function openCloudPresentation(
  presentation
) {

  try {

    currentPresentationId =
      presentation.id;


    slides =
      JSON.parse(
        presentation.content
      );


    if (
      !Array.isArray(slides)
    ) {

      throw new Error(
        "Invalid presentation"
      );

    }


    currentSlide =
      0;


    saveLocalSlides();

    setEditMode(false);

    renderSlides();

    setStatus(
      "📂 Presentation dibuka"
    );

  } catch (error) {

    console.error(error);

    alert(
      "Gagal buka presentation."
    );

  }

}


// ==========================================
// EDIT CLOUD
// ==========================================

function editCloudPresentation(
  presentation
) {

  try {

    currentPresentationId =
      presentation.id;


    slides =
      JSON.parse(
        presentation.content
      );


    if (
      !Array.isArray(slides)
    ) {

      throw new Error(
        "Invalid presentation"
      );

    }


    currentSlide =
      0;


    saveLocalSlides();

    setEditMode(true);

    renderSlides();

    setStatus(
      "✏️ Presentation sedang diedit"
    );

  } catch (error) {

    console.error(error);

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

    console.error(error);

    alert(
      "Gagal padam presentation."
    );

  }

}


// ==========================================
// REFRESH
// ==========================================

if (refreshCloudBtn) {

  refreshCloudBtn.addEventListener(
    "click",
    () => {

      loadCloudPresentations();

    }
  );

}


// ==========================================
// NORMAL NAVIGATION
// ==========================================

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


// ==========================================
// PRESENT
// ==========================================

function startPresentation() {

  document.body.classList.add(
    "presentation-mode"
  );


  // Make sure arrows update immediately

  updateSlideUI();


  // Force visibility in case another style hides it

  if (presentationNavigation) {

    presentationNavigation.style.display =
      "flex";

  }


  setStatus(
    "▶ Presentation mode"
  );

}


// ==========================================
// STOP PRESENT
// ==========================================

function stopPresentation() {

  document.body.classList.remove(
    "presentation-mode"
  );


  if (presentationNavigation) {

    presentationNavigation.style.display =
      "none";

  }


  setStatus(
    "✕ Presentation stopped"
  );

}


if (presentBtn) {

  presentBtn.addEventListener(
    "click",
    startPresentation
  );

}


if (stopBtn) {

  stopBtn.addEventListener(
    "click",
    stopPresentation
  );

}


// ==========================================
// PRESENT LEFT ARROW
// ==========================================

if (presentationPrevBtn) {

  presentationPrevBtn.addEventListener(
    "click",
    event => {

      event.preventDefault();

      previousSlide();

    }
  );

}


// ==========================================
// PRESENT RIGHT ARROW
// ==========================================

if (presentationNextBtn) {

  presentationNextBtn.addEventListener(
    "click",
    event => {

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
  event => {

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

  if (!dateString)
    return "";


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
      day: "2-digit",

      month: "short",

      year: "numeric",

      hour: "2-digit",

      minute: "2-digit"
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

  loadCloudPresentations();

  setStatus(
    "Ready ✓"
  );

}


initialize();