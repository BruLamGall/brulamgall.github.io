document.getElementById("unblockscroll").addEventListener("click", function () {
  document.body.classList.remove("no-scroll");
  const hero = document.getElementsByClassName("hero")[0];
  const aboutMeTarget = navLinks[0];

  if (aboutMeTarget) {
    moveDotToLink(aboutMeTarget);
  }

  if (hero) {
    hero.addEventListener(
      "transitionend",
      function () {
        const aboutMeSection = document.getElementById("about-me");

        if (aboutMeSection) {
          aboutMeSection.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", "#about-me");
        }
      },
      {
        once: true,
      },
    );

    hero.classList.add("go-left");
  }
});

const navbar = document.querySelector(".navbar");
const active = document.querySelector(".navbar .active");
const navLinks = Array.from(document.querySelectorAll('.navbar a[href^="#"]'));

const linkTargets = navLinks
  .map((link) => {
    const id = link.getAttribute("href")?.slice(1);
    if (!id) return null;

    const section = document.getElementById(id);
    const heading = section?.querySelector("h1");

    if (!section || !heading) return null;
    return { link, section, heading };
  })
  .filter(Boolean);

function getInitialTarget() {
  const hashTarget = navLinks.find(
    (link) => link.getAttribute("href") === window.location.hash,
  );

  return hashTarget ?? navLinks[0] ?? null;
}

function moveDotToLink(link) {
  if (!navbar || !active || !link) return;

  const navbarRect = navbar.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const x =
    linkRect.left -
    navbarRect.left +
    linkRect.width / 2 -
    active.offsetWidth / 2;

  active.style.transform = `translateX(${x}px)`;
}

function getCurrentTarget() {
  if (!linkTargets.length || !navbar) return null;

  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  const triggerLine = navbar.getBoundingClientRect().bottom + 10 * rootFontSize;

  let current = linkTargets[0];

  linkTargets.forEach((entry) => {
    const headingTop = entry.heading.getBoundingClientRect().top;
    if (headingTop <= triggerLine) {
      current = entry;
    }
  });

  return current;
}

function updateActiveDot() {
  const current = getCurrentTarget();
  if (!current) return;
  moveDotToLink(current.link);
}

function initializeActiveDot() {
  const initialTarget = getInitialTarget();
  if (initialTarget) {
    moveDotToLink(initialTarget);
  }
}

window.addEventListener("scroll", updateActiveDot, { passive: true });
window.addEventListener("resize", updateActiveDot);
window.addEventListener("DOMContentLoaded", initializeActiveDot);
window.addEventListener("load", initializeActiveDot);
window.addEventListener("hashchange", updateActiveDot);

function parseExperienceMarkdown(markdownText) {
  const lines = markdownText.split(/\r?\n/);
  const entries = [];
  let currentEntry = null;
  let bodyLines = [];

  function finalizeCurrentEntry() {
    if (!currentEntry) return;

    currentEntry.text = bodyLines.join(" ").replace(/\s+/g, " ").trim();
    entries.push(currentEntry);
  }

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("# ")) {
      finalizeCurrentEntry();
      currentEntry = {
        title: trimmedLine.slice(2).trim(),
        place: "",
        text: "",
        skills: [],
      };
      bodyLines = [];
      return;
    }

    if (!currentEntry || !trimmedLine) return;

    if (trimmedLine.startsWith("## ")) {
      currentEntry.place = trimmedLine.slice(3).trim();
      return;
    }

    if (trimmedLine.startsWith("### ")) {
      currentEntry.skills = trimmedLine
        .slice(4)
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
      return;
    }

    bodyLines.push(trimmedLine);
  });

  finalizeCurrentEntry();
  return entries;
}

async function loadExperienceEntries() {
  try {
    const response = await fetch("experience.md");
    if (!response.ok) return [];
    const markdownText = await response.text();
    return parseExperienceMarkdown(markdownText);
  } catch {
    return [];
  }
}

function parseProjectsMarkdown(markdownText) {
  const lines = markdownText.split(/\r?\n/);
  const entries = [];
  let currentEntry = null;
  let bodyLines = [];

  function finalizeCurrentEntry() {
    if (!currentEntry) return;

    currentEntry.text = bodyLines.join(" ").replace(/\s+/g, " ").trim();
    entries.push(currentEntry);
  }

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("# ")) {
      finalizeCurrentEntry();
      currentEntry = {
        title: trimmedLine.slice(2).trim(),
        subtitle: "",
        text: "",
        technologies: [],
      };
      bodyLines = [];
      return;
    }

    if (!currentEntry || !trimmedLine) return;

    if (trimmedLine.startsWith("## ")) {
      currentEntry.subtitle = trimmedLine.slice(3).trim();
      return;
    }

    if (trimmedLine.startsWith("### ")) {
      currentEntry.technologies = trimmedLine
        .slice(4)
        .split(",")
        .map((technology) => technology.trim())
        .filter(Boolean);
      return;
    }

    bodyLines.push(trimmedLine);
  });

  finalizeCurrentEntry();
  return entries;
}

async function loadProjectsEntries() {
  try {
    const response = await fetch("projects.md");
    if (!response.ok) return [];
    const markdownText = await response.text();
    return parseProjectsMarkdown(markdownText);
  } catch {
    return [];
  }
}

function renderSliderStops(slider, count) {
  if (!slider) return;

  const existingHitbox = slider.querySelector(".slider-hitbox");
  const existingStops = slider.querySelector(".slider-stops");
  if (existingHitbox) {
    existingHitbox.remove();
  }
  if (existingStops) {
    existingStops.remove();
  }

  const hitbox = document.createElement("div");
  hitbox.className = "slider-hitbox";

  const stopLayer = document.createElement("div");
  stopLayer.className = "slider-stops";

  const stopColor = getComputedStyle(slider).backgroundColor;

  for (let index = 0; index < count; index += 1) {
    const stop = document.createElement("span");
    const topPosition = count === 1 ? 0 : (index / (count - 1)) * 100;

    stop.className = "slider-stop";
    stop.style.top = `${topPosition}%`;
    stop.style.backgroundColor = stopColor;
    stopLayer.appendChild(stop);
  }

  slider.appendChild(hitbox);
  slider.appendChild(stopLayer);
}

async function initializeExperienceSlider() {
  const slider = document.querySelector(".experience .slider");
  const mark = slider?.querySelector(".mark");
  const experienceText = document.querySelector(".experience .experience-text");
  const experienceTitle = experienceText?.querySelector("h2");
  const experiencePlace = experienceText?.querySelector("i");
  const experienceBody = experienceText?.querySelector("p");
  const experienceSkills = experienceText?.querySelector(".experience-skills");

  if (
    !slider ||
    !mark ||
    !experienceText ||
    !experienceTitle ||
    !experiencePlace ||
    !experienceBody ||
    !experienceSkills
  )
    return;

  const experienceEntries = await loadExperienceEntries();
  if (!experienceEntries.length) return;

  renderSliderStops(slider, experienceEntries.length);

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const maxIndex = experienceEntries.length - 1;
  let activeIndex = 0;
  let isDragging = false;

  function setExperienceContent(index) {
    const entry = experienceEntries[index];

    experienceTitle.textContent = entry.title;
    experiencePlace.textContent = entry.place;
    experienceBody.textContent = entry.text;
    experienceSkills.innerHTML = "";

    entry.skills.forEach((skill) => {
      const skillPill = document.createElement("span");
      skillPill.className = "skill-pill";
      skillPill.textContent = skill;
      experienceSkills.appendChild(skillPill);
    });
  }

  function setMarkPosition(index) {
    const rect = slider.getBoundingClientRect();
    const y = maxIndex > 0 ? (rect.height * index) / maxIndex : 0;
    mark.style.top = `${y}px`;
  }

  function setActiveExperience(index) {
    activeIndex = clamp(Math.round(index), 0, maxIndex);
    setExperienceContent(activeIndex);
    setMarkPosition(activeIndex);
  }

  function indexFromClientY(clientY) {
    const rect = slider.getBoundingClientRect();
    const y = clamp(clientY - rect.top, 0, rect.height);

    if (rect.height === 0 || maxIndex === 0) {
      return 0;
    }

    return Math.round((y / rect.height) * maxIndex);
  }

  function startDragging(event) {
    event.preventDefault();
    isDragging = true;
    slider.classList.add("dragging");
    slider.setPointerCapture(event.pointerId);
    setActiveExperience(indexFromClientY(event.clientY));
  }

  function handlePointerMove(event) {
    if (!isDragging || !slider.hasPointerCapture(event.pointerId)) return;
    setActiveExperience(indexFromClientY(event.clientY));
  }

  function stopDragging(event) {
    if (slider.hasPointerCapture(event.pointerId)) {
      slider.releasePointerCapture(event.pointerId);
    }
    isDragging = false;
    slider.classList.remove("dragging");
    mark.classList.remove("dragging");
  }

  slider.addEventListener("pointerdown", startDragging);
  slider.addEventListener("pointermove", handlePointerMove);
  slider.addEventListener("pointerup", stopDragging);
  slider.addEventListener("pointercancel", stopDragging);

  window.addEventListener("resize", () => {
    setMarkPosition(activeIndex);
  });

  setActiveExperience(0);
}

window.addEventListener("DOMContentLoaded", initializeExperienceSlider);

async function initializeProjectsSlider() {
  const slider = document.querySelector(".projects .slider");
  const mark = slider?.querySelector(".mark");
  const projectsText = document.querySelector(".projects .projects-text");
  const projectTitle = projectsText?.querySelector("h2");
  const projectSubtitle = projectsText?.querySelector("i");
  const projectBody = projectsText?.querySelector("p");
  const projectTechnologies = projectsText?.querySelector(
    ".projects-technologies",
  );

  if (
    !slider ||
    !mark ||
    !projectsText ||
    !projectTitle ||
    !projectSubtitle ||
    !projectBody ||
    !projectTechnologies
  )
    return;

  const projectsEntries = await loadProjectsEntries();
  if (!projectsEntries.length) return;

  renderSliderStops(slider, projectsEntries.length);

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const maxIndex = projectsEntries.length - 1;
  let activeIndex = 0;
  let isDragging = false;

  function setProjectContent(index) {
    const entry = projectsEntries[index];

    projectTitle.textContent = entry.title;
    projectSubtitle.textContent = entry.subtitle;
    projectSubtitle.style.display = entry.subtitle ? "inline" : "none";
    projectBody.textContent = entry.text;
    projectTechnologies.innerHTML = "";

    entry.technologies.forEach((technology) => {
      const technologyPill = document.createElement("span");
      technologyPill.className = "technology-pill";
      technologyPill.textContent = technology;
      projectTechnologies.appendChild(technologyPill);
    });
  }

  function setMarkPosition(index) {
    const rect = slider.getBoundingClientRect();
    const y = maxIndex > 0 ? (rect.height * index) / maxIndex : 0;
    mark.style.top = `${y}px`;
  }

  function setActiveProject(index) {
    activeIndex = clamp(Math.round(index), 0, maxIndex);
    setProjectContent(activeIndex);
    setMarkPosition(activeIndex);
  }

  function indexFromClientY(clientY) {
    const rect = slider.getBoundingClientRect();
    const y = clamp(clientY - rect.top, 0, rect.height);

    if (rect.height === 0 || maxIndex === 0) {
      return 0;
    }

    return Math.round((y / rect.height) * maxIndex);
  }

  function startDragging(event) {
    event.preventDefault();
    isDragging = true;
    slider.classList.add("dragging");
    slider.setPointerCapture(event.pointerId);
    setActiveProject(indexFromClientY(event.clientY));
  }

  function handlePointerMove(event) {
    if (!isDragging || !slider.hasPointerCapture(event.pointerId)) return;
    setActiveProject(indexFromClientY(event.clientY));
  }

  function stopDragging(event) {
    if (slider.hasPointerCapture(event.pointerId)) {
      slider.releasePointerCapture(event.pointerId);
    }
    isDragging = false;
    slider.classList.remove("dragging");
    mark.classList.remove("dragging");
  }

  slider.addEventListener("pointerdown", startDragging);
  slider.addEventListener("pointermove", handlePointerMove);
  slider.addEventListener("pointerup", stopDragging);
  slider.addEventListener("pointercancel", stopDragging);

  window.addEventListener("resize", () => {
    setMarkPosition(activeIndex);
  });

  setActiveProject(0);
}

window.addEventListener("DOMContentLoaded", initializeProjectsSlider);

function initializeContactTextareaAutoGrow() {
  const messageTextarea = document.querySelector(".contact textarea#message");
  if (!messageTextarea) return;

  function autoGrow() {
    messageTextarea.style.height = "auto";
    messageTextarea.style.height = `${messageTextarea.scrollHeight}px`;
  }

  messageTextarea.addEventListener("input", autoGrow);
  autoGrow();
}

window.addEventListener("DOMContentLoaded", initializeContactTextareaAutoGrow);

async function updateGitHubContributions() {
  const contributionElement = document.getElementById("github-contributions");
  if (!contributionElement) return;

  try {
    const response = await fetch(
      "https://r.jina.ai/http://github.com/users/brulamgall/contributions",
    );

    if (!response.ok) return;

    const text = await response.text();
    const match = text.match(/(\d[\d,]*)\s+contributions in the last year/i);

    if (!match) return;

    contributionElement.textContent = match[1];
  } catch {}
}

window.addEventListener("load", updateGitHubContributions);
