// Vercel Speed Insights
// This script loads and initializes Vercel Speed Insights for tracking web vitals
(function() {
  // Initialize the queue for Speed Insights
  if (window.si) return;
  
  window.si = function(...params) {
    window.siq = window.siq || [];
    window.siq.push(params);
  };

  // Load the Speed Insights script
  const script = document.createElement('script');
  script.src = '/_vercel/speed-insights/script.js';
  script.defer = true;
  
  // Add SDK information as data attributes
  script.setAttribute('data-sdkn', '@vercel/speed-insights');
  script.setAttribute('data-sdkv', '2.0.0');
  
  document.head.appendChild(script);
})();
