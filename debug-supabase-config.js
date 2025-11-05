// Debug script to check what Supabase configuration is being used
// Run this in the browser console

console.log("=== SUPABASE DEBUG INFO ===");

// Check if there's a global supabase client
if (window.supabase) {
  console.log("Global supabase client found:", window.supabase);
  console.log("Supabase URL:", window.supabase.supabaseUrl);
  console.log(
    "Supabase Key:",
    window.supabase.supabaseKey?.substring(0, 20) + "..."
  );
}

// Check localStorage for any Supabase data
console.log("\n=== LOCALSTORAGE ===");
Object.keys(localStorage).forEach((key) => {
  if (key.includes("sb-") || key.includes("supabase")) {
    console.log(key + ":", localStorage.getItem(key)?.substring(0, 50) + "...");
  }
});

// Check sessionStorage
console.log("\n=== SESSIONSTORAGE ===");
Object.keys(sessionStorage).forEach((key) => {
  if (key.includes("sb-") || key.includes("supabase")) {
    console.log(
      key + ":",
      sessionStorage.getItem(key)?.substring(0, 50) + "..."
    );
  }
});

// Check cookies
console.log("\n=== COOKIES ===");
document.cookie.split(";").forEach((cookie) => {
  if (cookie.includes("sb-") || cookie.includes("supabase")) {
    console.log(cookie.trim());
  }
});

// Check if we can access environment variables (won't work in production)
console.log("\n=== ENVIRONMENT (if available) ===");
try {
  console.log(
    "process.env:",
    typeof process !== "undefined" ? process.env : "Not available in browser"
  );
} catch (e) {
  console.log("Environment variables not accessible in browser");
}

console.log("\n=== CURRENT URL ===");
console.log("Current URL:", window.location.href);
console.log("Origin:", window.location.origin);
