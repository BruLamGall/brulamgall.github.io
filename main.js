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
