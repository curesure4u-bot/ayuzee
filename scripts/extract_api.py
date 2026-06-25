#!/usr/bin/env python3
"""
API Part II PDF Extraction Script for Ayuzee
============================================
Reads your Ayurvedic Pharmacopoeia of India (API) Part II PDFs locally and
sends batches of pages to the Supabase edge function `extract-api-formulation`,
which uses Lovable AI Gateway (Gemini) to extract quality standards, botanical
names, anupana, description, and physicochemical limits.

REQUIREMENTS
  pip install pypdf requests

USAGE
  1. Sign in to Ayuzee as an admin in a browser.
  2. DevTools → Application → Local Storage → `sb-...-auth-token` →
     copy the `access_token` value and paste below.
  3. Place the API PDFs next to this script and run:
       python extract_api.py
  4. Review enriched formulations in /admin/afi-management.

NOTE: api-2-2_.pdf is byte-for-byte identical to API_part_2_-_1.pdf and is
NOT processed here. Only Vol I (API_part_2_-_1.pdf) and Vol II
(api-ii-vol-3.pdf) are unique.
"""

import time
import requests
from pypdf import PdfReader

# ── CONFIG ──────────────────────────────────────────────
SUPABASE_URL = "https://saphetdusyfrcduzsouk.supabase.co"
SUPABASE_ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhcGhldGR1c3lmcmNkdXpzb3VrIiwicm9sZSI6ImFub24i"
    "LCJpYXQiOjE3NzY2ODcyNjgsImV4cCI6MjA5MjI2MzI2OH0."
    "X4k1jO7nujGt7TfDjrQI3MNmk5cmlWH3kNj0O6_b8pU"
)
ACCESS_TOKEN = "PASTE_YOUR_ADMIN_ACCESS_TOKEN_HERE"
EDGE_FUNCTION_URL = f"{SUPABASE_URL}/functions/v1/extract-api-formulation"

API_FILES = [
    {
        "path": "API_part_2_-_1.pdf",
        "volume": "API Part II Vol I",
        "start_page": 9,
        "end_page": 160,
    },
    {
        "path": "api-ii-vol-3.pdf",
        "volume": "API Part II Vol II",
        "start_page": 30,
        "end_page": 150,
    },
]

BATCH_SIZE = 4  # API monographs span ~5-8 pages; 4-page windows work well
DELAY_SECONDS = 1.2

HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
}


def extract():
    if ACCESS_TOKEN.startswith("PASTE_"):
        raise SystemExit("Set ACCESS_TOKEN to your admin Supabase access token first.")

    extracted = skipped = errors = enriched = 0

    for cfg in API_FILES:
        path = cfg["path"]
        volume = cfg["volume"]
        start = cfg["start_page"] - 1
        end = cfg["end_page"] - 1

        print(f"\n{'=' * 60}\nProcessing: {path}")
        print(f"Volume: {volume}, Pages {start + 1}-{end + 1}")

        try:
            reader = PdfReader(path)
        except FileNotFoundError:
            print(f"  ! Missing file {path} — skipping")
            continue

        pages = reader.pages[start : end + 1]

        for i in range(0, len(pages), BATCH_SIZE):
            batch_pages = pages[i : i + BATCH_SIZE]
            batch_start = start + i + 1
            batch_text = ""
            for j, page in enumerate(batch_pages):
                text = (page.extract_text() or "").strip()
                if text:
                    batch_text += f"\n--- PAGE {batch_start + j} ---\n{text}"

            if len(batch_text.strip()) < 100:
                continue

            try:
                r = requests.post(
                    EDGE_FUNCTION_URL,
                    headers=HEADERS,
                    json={
                        "page_text": batch_text,
                        "api_volume": volume,
                        "page_number": batch_start,
                    },
                    timeout=60,
                )
                res = r.json()
                if res.get("status") == "success":
                    extracted += 1
                    if res.get("enriched"):
                        enriched += 1
                    std = "✓ standards" if res.get("has_standards") else ""
                    tag = "[enriched]" if res.get("enriched") else "[new]"
                    print(f"  ✓ p{batch_start}: {res.get('name')} {tag} {std}")
                elif res.get("status") == "skipped":
                    skipped += 1
                else:
                    errors += 1
                    print(f"  ✗ p{batch_start}: {res.get('error', 'unknown')}")
            except Exception as e:
                errors += 1
                print(f"  ✗ p{batch_start}: {e}")

            time.sleep(DELAY_SECONDS)

    print(f"\n{'=' * 60}\nDONE — extracted: {extracted} (of which enriched existing AFI: {enriched}) | skipped: {skipped} | errors: {errors}")
    print("Next: open /admin/afi-management to review and publish.")


if __name__ == "__main__":
    extract()
