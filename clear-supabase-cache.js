// Temporary utility to clear old Supabase cache
// Open browser console and paste this code to run it

console.log("Clearing Supabase cache...");

// Clear all localStorage items that start with 'sb-'
Object.keys(localStorage).forEach((key) => {
  if (key.startsWith("sb-")) {
    localStorage.removeItem(key);
    console.log("Removed:", key);
  }
});

// Clear any other Supabase-related items
const supabaseKeys = [
  "supabase.auth.token",
  "supabase.auth.refreshToken",
  "supabase.auth.user",
  "supabase.session",
];

supabaseKeys.forEach((key) => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log("Removed:", key);
  }
});

// Also clear sessionStorage
Object.keys(sessionStorage).forEach((key) => {
  if (key.startsWith("sb-") || key.includes("supabase")) {
    sessionStorage.removeItem(key);
    console.log("Removed from sessionStorage:", key);
  }
});

// Clear any cookies related to Supabase
document.cookie.split(";").forEach((cookie) => {
  const eqPos = cookie.indexOf("=");
  const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
  if (name.startsWith("sb-") || name.includes("supabase")) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    console.log("Removed cookie:", name);
  }
});

console.log("Complete Supabase cache cleared! Please refresh the page.");
console.log("Current localStorage keys:", Object.keys(localStorage));
console.log("Current sessionStorage keys:", Object.keys(sessionStorage));

// Force reload after 2 seconds
setTimeout(() => {
  console.log("Force reloading page...");
  window.location.reload(true);
}, 2000);
