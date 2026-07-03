/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run preview -- --host 127.0.0.1 --port 4173",
      startServerReadyPattern: "Local:",
      url: [
        "http://127.0.0.1:4173/",
        "http://127.0.0.1:4173/doctors",
        "http://127.0.0.1:4173/shop",
        "http://127.0.0.1:4173/therapies",
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: ["--no-sandbox", "--disable-dev-shm-usage"],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.45 }],
        "categories:accessibility": ["warn", { minScore: 0.8 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.85 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
