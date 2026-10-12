/* Demo-only profile form. No authentication or network requests are made. */
const STORAGE_KEY = "demo-profile";
const form = document.querySelector("#profile-form");
const card = document.querySelector("#profile-card");
const status = document.querySelector("#profile-status");
const nameInput = document.querySelector("#profile-name");
const phoneInput = document.querySelector("#profile-phone");
const genderInput = document.querySelector("#profile-gender");

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function renderProfile(profile) {
  const signedIn = Boolean(profile?.name && profile?.phone && profile?.gender);
  card.hidden = !signedIn;
  form.hidden = signedIn;
  if (signedIn) {
    document.querySelector("#profile-display-name").textContent = profile.name;
    document.querySelector("#profile-display-phone").textContent = profile.phone;
    document.querySelector("#profile-display-gender").textContent = profile.gender;
  }
  document.querySelectorAll("[data-profile-link] .menu-link__label").forEach((label) => {
    label.textContent = signedIn ? profile.name : "Profile";
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const profile = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    gender: genderInput.value,
  };
  if (profile.name.length < 2) {
    nameInput.setCustomValidity("Please enter at least 2 characters.");
    nameInput.reportValidity();
    nameInput.setCustomValidity("");
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    status.textContent = "Demo profile saved on this device.";
    renderProfile(profile);
  } catch {
    status.textContent = "Could not save this profile in your browser.";
  }
});

document.querySelector("#profile-signout").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  status.textContent = "You have signed out of the demo profile.";
  renderProfile(null);
});

renderProfile(readProfile());