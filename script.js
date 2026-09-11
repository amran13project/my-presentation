```javascript
// ==========================================
// PRESENTATION CLOUD WORKSPACE
// ==========================================


// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
  "https://fmqhmubzqkyrtduzvkkf.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_PgfVAhoqgdYJssbfspW7Ig_MlVYzUw2";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ==========================================
// DEFAULT SLIDES
// ==========================================

const defaultSlides = [

  {
    title:
      "My Presentation",

    content:
      "Welcome to my presentation!"
  },

  {
    title:
      "Slide 2",

    content:
      "Add your content here."
  },

  {
    title:
      "Slide 3",

    content:
      "You can edit this slide."
  }

];


// ==========================================
// VARIABLES
// ==========================================

let slides = [];

let currentSlide = 0;

let currentPresentationId = null;

let autoSaveTimer = null;

let isEditMode = true;


// ==========================================
// ELEMENTS
// ==========================================

const editor =
  document.getElementById(
    "editor"
  );

const slideContainer =
  document.getElementById(
    "slideContainer"
  );

const slideThumbnails =
  document.getElementById(
    "slideThumbnails"
  );

const slideNumber =
  document.getElementById(
    "slideNumber"
  );

const slideCounter =
  document.getElementById(
    "slideCounter"
  );

const saveStatus =
  document.getElementById(
    "saveStatus"
  );

const previousBtn =
  document.getElementById(
    "previousBtn"
  );

const nextBtn =
  document.getElementById(
    "nextBtn"
  );

const stopBtn =
  document.getElementById(
    "stopBtn"
  );

const saveBtn =
  document.getElementById(
    "saveBtn"
  );

const editBtn =
  document.getElementById(
    "editBtn"
  );

const addImageBtn =
  document.getElementById(
    "addImageBtn"
  );

const addSlideBtn =
  document.getElementById(
    "addSlideBtn"
  );

const newSlideSmallBtn =
  document.getElementById(
    "newSlideSmallBtn"
  );

const deleteSlideBtn =
  document.getElementById(
    "deleteSlideBtn"
  );

const presentBtn =
  document.getElementById(
    "presentBtn"
  );

const imageInput =
  document.getElementById(
    "imageInput"
  );

const savedPresentations =
  document.getElementById(
    "savedPresentations"
  );

const refreshCloudBtn =
  document.getElementById(
    "refreshCloudBtn"
  );


// PRESENTATION ARROWS

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

    saveStatus.textContent =
      message;

  }

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    text || "";

  return div.innerHTML;

}


// ==========================================
// STRIP HTML
// ==========================================

function stripHTML(html) {

  const div =
    document.createElement(
      "div"
    );

  div.innerHTML =
    html || "";

  return (
    div.textContent ||
    div.innerText ||
    ""
  )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


// ==========================================
// LOCAL SAVE
// ==========================================

function saveLocalSlides() {

  localStorage.setItem(
    "myPresentationSlides",
    JSON.stringify(slides)
  );

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


    if (saved) {

      slides =
        JSON.parse(
          saved
        );

      if (
        !Array.isArray(
          slides
        ) ||
        slides.length === 0
      ) {

        slides =
          JSON.parse(
            JSON.stringify(
              defaultSlides
            )
          );

      }

    } else {

      slides =
        JSON.parse(
          JSON.stringify(
            defaultSlides
          )
        );

    }

  } catch (error) {

    console.error(
      "Local load error:",
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


  slideContainer.innerHTML =
    "";


  slides.forEach(
    (slide, index) => {

      const slideElement =
        document.createElement(
          "div"
        );


      slideElement.className =
        "slide";


      if (
        index === currentSlide
      ) {

        slideElement.classList.add(
          "active"
        );

      }


      const content =
        document.createElement(
          "div"
        );


      content.className =
        "slide-content";


      const title =
        document.createElement(
          "div"
        );


      title.className =
        "slide-title";


      title.contentEditable =
        isEditMode
          ? "true"
          : "false";


      title.spellcheck =
        true;


      title.textContent =
        slide.title ||
        `Slide ${index + 1}`;


      const text =
        document.createElement(
          "div"
        );


      text.className =
        "slide-text";


      text.contentEditable =
        isEditMode
          ? "true"
          : "false";


      text.spellcheck =
        true;


      text.innerHTML =
        slide.content ||
        "Add your content here.";


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


      content.appendChild(
        title
      );


      content.appendChild(
        text
      );


      slideElement.appendChild(
        content
      );


      slideContainer.appendChild(
        slideElement
      );

    }
  );


  renderThumbnails();

  updateSlideUI();

}


// ==========================================
// RENDER THUMBNAILS
// ==========================================

function renderThumbnails() {

  if (!slideThumbnails)
    return;


  slideThumbnails.innerHTML =
    "";


  slides.forEach(
    (slide, index) => {

      const thumbnail =
        document.createElement(
          "div"
        );


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

          showSlide(
            index
          );

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

  const counter =
    `${currentSlide + 1} / ${slides.length}`;


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
      currentSlide >=
      slides.length - 1;

  }


  // PRESENT ARROWS

  if (presentationPrevBtn) {

    presentationPrevBtn.disabled =
      currentSlide <= 0;

  }


  if (presentationNextBtn) {

    presentationNextBtn.disabled =
      currentSlide >=
      slides.length - 1;

  }


  document
    .querySelectorAll(
      ".slide"
    )
    .forEach(
      (slide, index) => {

        slide.classList.toggle(
          "active",
          index === currentSlide
        );

      }
    );


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
    currentSlide > 0
  ) {

    currentSlide--;

    updateSlideUI();

  }

}


// ==========================================
// EDIT MODE
// ==========================================

function setEditMode(
  enabled
) {

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

function deleteCurrentSlide() {

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
    currentSlide >=
    slides.length
  ) {

    currentSlide =
      slides.length - 1;

  }


  saveLocalSlides();

  renderSlides();

  scheduleAutoSave();


  setStatus(
    "🗑️ Slide dipadam"
  );

}


if (deleteSlideBtn) {

  deleteSlideBtn.addEventListener(
    "click",
    deleteCurrentSlide
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
          "Sila pilih fail gambar."
        );

        imageInput.value =
          "";

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        () => {

          const imageHTML = `

            <br>

            <img
              src="${reader.result}"
              alt="Presentation image"
            >

            <br>

          `;


          slides[currentSlide]
            .content +=
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
// SAVE
// ==========================================

async function savePresentation() {

  saveLocalSlides();


  setStatus(
    "☁️ Saving..."
  );


  const title =
    slides[0]?.title?.trim() ||
    "Untitled Presentation";


  const content =
    JSON.stringify(
      slides
    );


  try {

    let result;


    // UPDATE

    if (
      currentPresentationId
    ) {

      result =
        await supabaseClient
          .from("works")
          .update({

            title:
              title,

            content:
              content

          })
          .eq(
            "id",
            currentPresentationId
          )
          .select()
          .single();

    }


    // INSERT

    else {

      result =
        await supabaseClient
          .from("works")
          .insert({

            title:
              title,

            content:
              content

          })
          .select()
          .single();

    }


    if (
      result.error
    ) {

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
    !savedPresentations
  )
    return;


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

      savedPresentations.innerHTML = `

        <div class="empty-cloud">

          <div style="font-size:40px;">
            ☁️
          </div>

          <h3>
            No presentations
          </h3>

          <p>
            Save your first presentation.
          </p>

        </div>

      `;

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

            <button
              class="open-cloud-btn">

              📂 Buka

            </button>


            <button
              class="edit-cloud-btn">

              ✏️ Edit

            </button>


            <button
              class="delete-cloud-btn">

              🗑️ Padam

            </button>

          </div>

        `;


        const openBtn =
          card.querySelector(
            ".open-cloud-btn"
          );


        const editCloudBtn =
          card.querySelector(
            ".edit-cloud-btn"
          );


        const deleteBtn =
          card.querySelector(
            ".delete-cloud-btn"
          );


        openBtn.addEventListener(
          "click",
          () => {

            loadCloudPresentation(
              presentation
            );

          }
        );


        editCloudBtn.addEventListener(
          "click",
          () => {

            editCloudPresentation(
              presentation
            );

          }
        );


        deleteBtn.addEventListener(
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
      `❌ ${escapeHTML(
        error.message
      )}`;

  }

}


// ==========================================
// OPEN CLOUD
// ==========================================

function loadCloudPresentation(
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
      !Array.isArray(slides) ||
      slides.length === 0
    ) {

      throw new Error(
        "Invalid presentation"
      );

    }


    currentSlide =
      0;


    saveLocalSlides();

    setEditMode(
      false
    );

    renderSlides();


    setStatus(
      "📂 Presentation dibuka"
    );


  } catch (error) {

    console.error(
      error
    );


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
      !Array.isArray(slides) ||
      slides.length === 0
    ) {

      throw new Error(
        "Invalid presentation"
      );

    }


    currentSlide =
      0;


    saveLocalSlides();


    // IMPORTANT
    // Turn editing ON

    setEditMode(
      true
    );


    renderSlides();


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
      currentPresentationId ===
      id
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
    () => {

      loadCloudPresentations();

    }
  );

}


// ==========================================
// PRESENT
// ==========================================

if (presentBtn) {

  presentBtn.addEventListener(
    "click",
    () => {

      document.body.classList.add(
        "presentation-mode"
      );


      updateSlideUI();


      setStatus(
        "▶ Presentation mode"
      );

    }
  );

}


// ==========================================
// STOP
// ==========================================

if (stopBtn) {

  stopBtn.addEventListener(
    "click",
    () => {

      document.body.classList.remove(
        "presentation-mode"
      );


      setStatus(
        "✕ Presentation stopped"
      );

    }
  );

}


// ==========================================
// PRESENTATION CENTER ARROWS
// ==========================================

if (presentationPrevBtn) {

  presentationPrevBtn.addEventListener(
    "click",
    () => {

      previousSlide();

    }
  );

}


if (presentationNextBtn) {

  presentationNextBtn.addEventListener(
    "click",
    () => {

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

    const editing =
      event.target &&
      (
        event.target.isContentEditable ||
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      );


    if (
      editing &&
      !document.body.classList.contains(
        "presentation-mode"
      )
    ) {

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


    if (
      event.key ===
      "Escape"
    ) {

      stopPresentation();

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

  setEditMode(
    true
  );

  renderSlides();

  loadCloudPresentations();

  setStatus(
    "Ready ✓"
  );

}


initialize();
```
