// ==========================================
// MY PRESENTATION - CLOUD SAVE
// ==========================================

// ---------- SUPABASE ----------
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

// ---------- VARIABLES ----------
let currentSlide = 0;
let currentPresentationId = null;
let slides = [];

const STORAGE_KEY = "myPresentationSlides";
const TITLE_KEY = "myPresentationTitle";

// ---------- ELEMENTS ----------
const editor = document.getElementById("editor");
const slideContainer = document.getElementById("slideContainer");
const slideNumber = document.getElementById("slideNumber");
const saveStatus = document.getElementById("saveStatus");

const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const stopBtn = document.getElementById("stopBtn");

const saveBtn = document.getElementById("saveBtn");
const addImageBtn = document.getElementById("addImageBtn");
const addSlideBtn = document.getElementById("addSlideBtn");
const deleteSlideBtn = document.getElementById("deleteSlideBtn");
const presentBtn = document.getElementById("presentBtn");

const imageInput = document.getElementById("imageInput");

// ---------- CLOUD ELEMENTS ----------
const savedPresentations =
  document.getElementById("savedPresentations");

const refreshCloudBtn =
  document.getElementById("refreshCloudBtn");

// ---------- DEFAULT SLIDES ----------
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

// ---------- INITIALIZE ----------
function initialize() {
  loadLocalPresentation();
  renderSlides();
  updateSlideNumber();

  if (supabaseClient) {
    loadCloudPresentations();
  } else {
    setStatus("❌ Supabase tidak dimuat");
  }
}

// ---------- LOAD LOCAL ----------
function loadLocalPresentation() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      slides = JSON.parse(saved);
    } else {
      slides = JSON.parse(JSON.stringify(defaultSlides));
    }
  } catch (error) {
    console.error(error);
    slides = JSON.parse(JSON.stringify(defaultSlides));
  }
}

// ---------- SAVE LOCAL ----------
function saveLocalPresentation() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(slides)
  );
}

// ---------- STATUS ----------
function setStatus(message) {
  if (saveStatus) {
    saveStatus.textContent = message;
  }
}

// ---------- RENDER SLIDES ----------
function renderSlides() {
  if (!slideContainer) return;

  slideContainer.innerHTML = "";

  slides.forEach((slide, index) => {
    const slideElement = document.createElement("div");

    slideElement.className = "slide";

    if (index === currentSlide) {
      slideElement.classList.add("active");
    }

    slideElement.innerHTML = `
      <div class="slide-content">
        <h1 contenteditable="true"
            class="slide-title"
            data-index="${index}">
          ${escapeHTML(slide.title || "")}
        </h1>

        <div contenteditable="true"
             class="slide-text"
             data-index="${index}">
          ${slide.content || ""}
        </div>
      </div>
    `;

    slideContainer.appendChild(slideElement);
  });

  attachEditingEvents();
}

// ---------- EDIT EVENTS ----------
function attachEditingEvents() {
  document.querySelectorAll(".slide-title").forEach((element) => {
    element.addEventListener("input", function () {
      const index = Number(this.dataset.index);

      if (slides[index]) {
        slides[index].title = this.innerText;
        autoSave();
      }
    });
  });

  document.querySelectorAll(".slide-text").forEach((element) => {
    element.addEventListener("input", function () {
      const index = Number(this.dataset.index);

      if (slides[index]) {
        slides[index].content = this.innerHTML;
        autoSave();
      }
    });
  });
}

// ---------- ESCAPE HTML ----------
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- CHANGE SLIDE ----------
function showSlide(index) {
  if (slides.length === 0) return;

  if (index < 0) {
    index = 0;
  }

  if (index >= slides.length) {
    index = slides.length - 1;
  }

  currentSlide = index;

  renderSlides();
  updateSlideNumber();
}

// ---------- UPDATE NUMBER ----------
function updateSlideNumber() {
  if (slideNumber) {
    slideNumber.textContent =
      `${currentSlide + 1} / ${slides.length}`;
  }
}

// ---------- NEXT ----------
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    if (currentSlide < slides.length - 1) {
      showSlide(currentSlide + 1);
    }
  });
}

// ---------- PREVIOUS ----------
if (previousBtn) {
  previousBtn.addEventListener("click", () => {
    if (currentSlide > 0) {
      showSlide(currentSlide - 1);
    }
  });
}

// ---------- ADD SLIDE ----------
if (addSlideBtn) {
  addSlideBtn.addEventListener("click", () => {
    slides.push({
      title: `Slide ${slides.length + 1}`,
      content: "Add your content here."
    });

    currentSlide = slides.length - 1;

    saveLocalPresentation();
    renderSlides();
    updateSlideNumber();

    setStatus("✅ Slide ditambah");
  });
}

// ---------- DELETE SLIDE ----------
if (deleteSlideBtn) {
  deleteSlideBtn.addEventListener("click", () => {
    if (slides.length <= 1) {
      alert("Mesti ada sekurang-kurangnya 1 slide.");
      return;
    }

    const confirmed = confirm(
      "Padam slide ini?"
    );

    if (!confirmed) return;

    slides.splice(currentSlide, 1);

    if (currentSlide >= slides.length) {
      currentSlide = slides.length - 1;
    }

    saveLocalPresentation();
    renderSlides();
    updateSlideNumber();

    setStatus("🗑️ Slide dipadam");
  });
}

// ---------- ADD IMAGE ----------
if (addImageBtn && imageInput) {
  addImageBtn.addEventListener("click", () => {
    imageInput.click();
  });

  imageInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
      const imageHTML = `
        <br>
        <img
          src="${event.target.result}"
          style="
            max-width:100%;
            max-height:350px;
            display:block;
            margin:20px auto;
            border-radius:12px;
          "
        >
        <br>
      `;

      slides[currentSlide].content += imageHTML;

      saveLocalPresentation();
      renderSlides();

      setStatus("🖼️ Gambar ditambah");

      imageInput.value = "";
    };

    reader.readAsDataURL(file);
  });
}

// ---------- SAVE BUTTON ----------
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    savePresentation();
  });
}

// ---------- SAVE PRESENTATION ----------
async function savePresentation() {
  saveLocalPresentation();

  if (!supabaseClient) {
    setStatus("⚠️ Cloud belum disambungkan");
    return;
  }

  setStatus("☁️ Menyimpan ke Cloud...");

  const presentationTitle =
    getPresentationTitle();

  const data = {
    title: presentationTitle,
    content: JSON.stringify(slides)
  };

  try {
    let result;

    // UPDATE
    if (currentPresentationId) {
      result = await supabaseClient
        .from("works")
        .update(data)
        .eq("id", currentPresentationId)
        .select()
        .single();
    }

    // INSERT
    else {
      result = await supabaseClient
        .from("works")
        .insert(data)
        .select()
        .single();
    }

    if (result.error) {
      console.error(
        "Supabase error:",
        result.error
      );

      setStatus(
        "❌ Gagal Cloud: " +
        result.error.message
      );

      return;
    }

    currentPresentationId =
      result.data.id;

    setStatus("☁️✅ Disimpan ke Cloud");

    loadCloudPresentations();

  } catch (error) {
    console.error(error);

    setStatus(
      "❌ Gagal sambung ke Cloud"
    );
  }
}

// ---------- GET TITLE ----------
function getPresentationTitle() {
  const firstSlide = slides[0];

  if (
    firstSlide &&
    firstSlide.title &&
    firstSlide.title.trim()
  ) {
    return firstSlide.title.trim();
  }

  return "My Presentation";
}

// ---------- LOAD CLOUD LIST ----------
async function loadCloudPresentations() {
  if (!supabaseClient) return;

  if (!savedPresentations) return;

  savedPresentations.innerHTML =
    "☁️ Loading...";

  try {
    const { data, error } =
      await supabaseClient
        .from("works")
        .select("*")
        .order("created_at", {
          ascending: false
        });

    if (error) {
      console.error(error);

      savedPresentations.innerHTML =
        "❌ Gagal load Cloud";

      return;
    }

    if (!data || data.length === 0) {
      savedPresentations.innerHTML =
        "Belum ada presentation disimpan.";
      return;
    }

    savedPresentations.innerHTML = "";

    data.forEach((item) => {
      const row =
        document.createElement("div");

      row.className =
        "cloud-presentation";

      row.innerHTML = `
        <div>
          <strong>
            ${escapeHTML(
              item.title || "Untitled"
            )}
          </strong>

          <small>
            ${formatDate(item.created_at)}
          </small>
        </div>

        <div>
          <button
            class="open-cloud-btn"
            data-id="${item.id}">
            Buka
          </button>

          <button
            class="delete-cloud-btn"
            data-id="${item.id}">
            Padam
          </button>
        </div>
      `;

      savedPresentations.appendChild(row);
    });

    document
      .querySelectorAll(".open-cloud-btn")
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            loadCloudPresentation(
              button.dataset.id
            );
          }
        );
      });

    document
      .querySelectorAll(".delete-cloud-btn")
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            deleteCloudPresentation(
              button.dataset.id
            );
          }
        );
      });

  } catch (error) {
    console.error(error);

    savedPresentations.innerHTML =
      "❌ Gagal sambung ke Cloud";
  }
}

// ---------- OPEN CLOUD ----------
async function loadCloudPresentation(id) {
  if (!supabaseClient) return;

  setStatus("☁️ Membuka presentation...");

  try {
    const { data, error } =
      await supabaseClient
        .from("works")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
      console.error(error);

      setStatus(
        "❌ Gagal buka presentation"
      );

      return;
    }

    currentPresentationId =
      data.id;

    try {
      slides = JSON.parse(
        data.content
      );
    } catch {
      slides = [
        {
          title:
            data.title || "Presentation",
          content:
            data.content || ""
        }
      ];
    }

    currentSlide = 0;

    saveLocalPresentation();
    renderSlides();
    updateSlideNumber();

    setStatus(
      "☁️✅ Presentation dibuka"
    );

  } catch (error) {
    console.error(error);

    setStatus(
      "❌ Gagal buka Cloud"
    );
  }
}

// ---------- DELETE CLOUD ----------
async function deleteCloudPresentation(id) {
  if (!supabaseClient) return;

  const confirmed = confirm(
    "Padam presentation ini dari Cloud?"
  );

  if (!confirmed) return;

  setStatus("☁️ Memadam...");

  try {
    const { error } =
      await supabaseClient
        .from("works")
        .delete()
        .eq("id", id);

    if (error) {
      console.error(error);

      setStatus(
        "❌ Gagal padam"
      );

      return;
    }

    if (
      String(currentPresentationId) ===
      String(id)
    ) {
      currentPresentationId = null;
    }

    setStatus(
      "🗑️ Presentation dipadam"
    );

    loadCloudPresentations();

  } catch (error) {
    console.error(error);

    setStatus(
      "❌ Gagal padam Cloud"
    );
  }
}

// ---------- REFRESH CLOUD ----------
if (refreshCloudBtn) {
  refreshCloudBtn.addEventListener(
    "click",
    () => {
      loadCloudPresentations();
    }
  );
}

// ---------- PRESENT MODE ----------
if (presentBtn) {
  presentBtn.addEventListener(
    "click",
    () => {
      document.body.classList.add(
        "presentation-mode"
      );

      showSlide(currentSlide);
    }
  );
}

// ---------- STOP PRESENT ----------
if (stopBtn) {
  stopBtn.addEventListener(
    "click",
    () => {
      document.body.classList.remove(
        "presentation-mode"
      );
    }
  );
}

// ---------- KEYBOARD ----------
document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "ArrowRight"
    ) {
      if (
        currentSlide <
        slides.length - 1
      ) {
        showSlide(
          currentSlide + 1
        );
      }
    }

    if (
      event.key === "ArrowLeft"
    ) {
      if (currentSlide > 0) {
        showSlide(
          currentSlide - 1
        );
      }
    }

    if (event.key === "Escape") {
      document.body.classList.remove(
        "presentation-mode"
      );
    }
  }
);

// ---------- AUTO SAVE ----------
let autoSaveTimer = null;

function autoSave() {
  saveLocalPresentation();

  clearTimeout(autoSaveTimer);

  autoSaveTimer = setTimeout(
    () => {
      if (supabaseClient) {
        savePresentation();
      }
    },
    1000
  );
}

// ---------- FORMAT DATE ----------
function formatDate(dateString) {
  if (!dateString) return "";

  const date =
    new Date(dateString);

  return date.toLocaleString(
    "ms-MY"
  );
}

// ---------- START ----------
initialize();