#!/bin/bash
# Load environment and run Playwright tests

export PATH="/Users/drmohamadsaleem/.nvm/versions/node/v20.20.2/bin:$PATH"

# Load .env.e2e variables
if [ -f .env.e2e ]; then
  export $(grep -v '^#' .env.e2e | xargs)
  echo "✅ Loaded E2E environment"
  echo "🌐 Base URL: $E2E_BASE_URL"
else
  echo "❌ .env.e2e not found!"
  exit 1
fi

# Run the test
npx playwright test "$@"