```javascript
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
  supabaseClient =
    window.supabase.createClient(
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

    content:
      "Welcome to my presentation!"
  },

  {
    title: "Slide 2",

    content:
      "Add your content here."
  },

  {
    title: "Slide 3",

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

let isEditMode = true;

let autoSaveTimer = null;


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

const refreshCloudBtn =
  document.getElementById(
    "refreshCloudBtn"
  );

const savedPresentations =
  document.getElementById(
    "savedPresentations"
  );


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

    saveStatus.textContent =
      message;

  }

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHTML(text) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    text ?? "";

  return div.innerHTML;

}


// ==========================================
// REMOVE HTML FOR PREVIEW
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


      slideElement.dataset.index =
        index;


      const content =
        document.createElement(
          "div"
        );


      content.className =
        "slide-content";


      // ------------------------------
      // TITLE
      // ------------------------------

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


      // ------------------------------
      // CONTENT
      // ------------------------------

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
        "";


      // ------------------------------
      // TITLE INPUT
      // ------------------------------

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


      // ------------------------------
      // CONTENT INPUT
      // ------------------------------

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


      const preview =
        stripHTML(
          slide.content
        );


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
              preview ||
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
// UPDATE UI
// ==========================================

function updateSlideUI() {

  const counter =
    `${currentSlide + 1} / ${slides.length}`;


  // Normal counter

  if (slideNumber) {

    slideNumber.textContent =
      counter;

  }


  if (slideCounter) {

    slideCounter.textContent =
      counter;

  }


  // Normal buttons

  if (previousBtn) {

    previousBtn.disabled =
      currentSlide <= 0;

  }


  if (nextBtn) {

    nextBtn.disabled =
      currentSlide >=
      slides.length - 1;

  }


  // Present buttons

  if (presentationPrevBtn) {

    presentationPrevBtn.disabled =
      currentSlide <= 0;

  }


  if (presentationNextBtn) {

    presentationNextBtn.disabled =
      currentSlide >=
      slides.length - 1;

  }


  // Slides

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


  // Thumbnails

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
    !slides ||
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
// DELETE CURRENT SLIDE
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


  const confirmed =
    confirm(
      `Padam Slide ${currentSlide + 1}?`
    );


  if (!confirmed)
    return;


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

          if (
            !slides[currentSlide]
          ) {

            return;

          }


          const imageHTML = `

            <div style="
              width:100%;
              text-align:center;
              margin:25px 0;
            ">

              <img
                src="${reader.result}"
                alt="Presentation image"
                style="
                  max-width:100%;
                  max-height:330px;
                  border-radius:12px;
                  object-fit:contain;
                "
              >

            </div>

          `;


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

  if (!supabaseClient) {

    setStatus(
      "❌ Supabase tidak tersedia"
    );

    return;

  }


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


    // UPDATE EXISTING

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


    // CREATE NEW

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


    if (result.error) {

      throw result.error;

    }


    currentPresentationId =
      result.data.id;


    setStatus(
      "☁️✅ Saved to Cloud"
    );


    await loadCloudPresentations();

  } catch (error) {

    console.error(
      "SAVE ERROR:",
      error
    );


    setStatus(
      "❌ Save gagal"
    );


    console.error(
      error.message
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
      () => {

        // Only auto-update an existing Cloud presentation

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
// CLOUD LOAD
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

      savedPresentations.innerHTML = `

        <div class="cloud-presentation">

          <strong>
            Tiada presentation
          </strong>

          <small>
            Save presentation pertama anda.
          </small>

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


        const cardTop =
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


        cardTop.appendChild(
          title
        );


        cardTop.appendChild(
          date
        );


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
          () => {

            loadCloudPresentation(
              presentation
            );

          }
        );


        // EDIT

        const editCloudButton =
          document.createElement(
            "button"
          );


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
          document.createElement(
            "button"
          );


        deleteButton.className =
          "delete-cloud-btn";


        deleteButton.textContent =
          "🗑️ Padam";


        deleteButton.addEventListener(
          "click",
          () => {

            deleteCloudPresentation(
              presentation.id
            );

          }
        );


        actions.appendChild(
          openButton
        );

        actions.appendChild(
          editCloudButton
        );

        actions.appendChild(
          deleteButton
        );


        card.appendChild(
          cardTop
        );

        card.appendChild(
          actions
        );


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

        <div class="cloud-presentation">

          <strong>
            ❌ Cloud Error
          </strong>

          <small>
            ${escapeHTML(
              error.message
            )}
          </small>

        </div>

      `;

  }

}


// ==========================================
// PARSE CLOUD PRESENTATION
// ==========================================

function parseCloudPresentation(
  presentation
) {

  try {

    const parsed =
      JSON.parse(
        presentation.content
      );


    if (
      Array.isArray(parsed) &&
      parsed.length > 0
    ) {

      return parsed;

    }

  } catch (error) {

    console.warn(
      "Content bukan JSON:",
      error
    );

  }


  return [

    {

      title:
        presentation.title ||
        "Untitled Presentation",

      content:
        presentation.content ||
        ""

    }

  ];

}


// ==========================================
// OPEN CLOUD PRESENTATION
// ==========================================

function loadCloudPresentation(
  presentation
) {

  try {

    currentPresentationId =
      presentation.id;


    slides =
      parseCloudPresentation(
        presentation
      );


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
      "OPEN ERROR:",
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


    slides =
      parseCloudPresentation(
        presentation
      );


    currentSlide =
      0;


    saveLocalSlides();


    renderSlides();


    setEditMode(
      true
    );


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
      "EDIT ERROR:",
      error
    );


    alert(
      "Gagal edit presentation."
    );

  }

}


// ==========================================
// DELETE CLOUD PRESENTATION
// ==========================================

async function deleteCloudPresentation(
  id
) {

  const confirmed =
    confirm(
      "Padam presentation ini dari Cloud?"
    );


  if (!confirmed)
    return;


  try {

    setStatus(
      "☁️ Memadam..."
    );


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


    await loadCloudPresentations();

  } catch (error) {

    console.error(
      "DELETE ERROR:",
      error
    );


    alert(
      "Gagal padam presentation:\n\n" +
      error.message
    );

  }

}


// ==========================================
// REFRESH CLOUD
// ==========================================

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


// ==========================================
// NORMAL NAVIGATION BUTTONS
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
// PRESENTATION MODE
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
// PRESENTATION ← BUTTON
// ==========================================

if (presentationPrevBtn) {

  presentationPrevBtn.addEventListener(
    "click",
    () => {

      previousSlide();

    }
  );

}


// ==========================================
// PRESENTATION → BUTTON
// ==========================================

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


    // While editing text,
    // don't change slides

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
// START
// ==========================================

function initialize() {

  loadLocalSlides();


  currentSlide =
    0;


  renderSlides();


  setEditMode(
    true
  );


  if (supabaseClient) {

    loadCloudPresentations();

  } else {

    setStatus(
      "❌ Supabase tidak dimuat"
    );

  }

}


initialize();
```
