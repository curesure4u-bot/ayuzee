#!/usr/bin/env python3
"""
AFI PDF Extraction Script for Ayuzee
====================================
Reads your 4 AFI PDF files locally and sends each batch of pages to your
Supabase edge function `extract-afi-formulation`, which uses Lovable AI
Gateway (Gemini) to extract structured Ayurvedic formulation data.

REQUIREMENTS
  pip install pypdf requests

USAGE
  1. Sign in to Ayuzee as an admin in a browser.
  2. Open DevTools → Application → Local Storage → copy the value of
     the key starting with `sb-...-auth-token`. From that JSON copy the
     `access_token` field. Paste it below in ACCESS_TOKEN.
  3. Place the AFI PDFs next to this script and run:
       python extract_afi.py
  4. Open /admin/afi-management to review & approve extracted formulations.
"""

import json
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
ACCESS_TOKEN = "PASTE_YOUR_ADMIN_ACCESS_TOKEN_HERE"  # <-- required
EDGE_FUNCTION_URL = f"{SUPABASE_URL}/functions/v1/extract-afi-formulation"

AFI_FILES = [
    {"path": "AFI_-_1_.PDF", "part": 1, "start_page": 34, "end_page": 756},
    {"path": "AFB_2_.pdf",   "part": 2, "start_page": 10, "end_page": 269},
    # Part B (appendices) files are reference / disease index only — no formulas to extract.
]

BATCH_SIZE = 3  # pages per AI call (formulations span ~2-3 pages)
DELAY_SECONDS = 1.2

HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
}


def extract():
    if ACCESS_TOKEN.startswith("PASTE_"):
        raise SystemExit("Set ACCESS_TOKEN to your admin Supabase access token first.")

    extracted = skipped = errors = 0

    for cfg in AFI_FILES:
        path = cfg["path"]
        part = cfg["part"]
        start = cfg["start_page"] - 1
        end = cfg["end_page"] - 1
        print(f"\n{'=' * 60}\nProcessing AFI Part {part}: {path}")
        print(f"Pages {start + 1}-{end + 1}")

        try:
            reader = PdfReader(path)
        except FileNotFoundError:
            print(f"  ! Missing file {path} — skipping")
            continue

        pages = reader.pages[start : end + 1]
        batch_text = ""
        batch_start = start + 1

        for i, page in enumerate(pages):
            page_num = start + i + 1
            text = (page.extract_text() or "").strip()
            if len(text) < 50:
                continue
            batch_text += f"\n--- PAGE {page_num} ---\n{text}"

            if (i + 1) % BATCH_SIZE == 0 or i == len(pages) - 1:
                try:
                    r = requests.post(
                        EDGE_FUNCTION_URL,
                        headers=HEADERS,
                        json={
                            "page_text": batch_text,
                            "afi_part": part,
                            "page_number": batch_start,
                        },
                        timeout=60,
                    )
                    res = r.json()
                    if res.get("status") == "success":
                        extracted += 1
                        print(f"  ✓ p{batch_start}: {res.get('name')} ({res.get('ingredients_count')} ing.)")
                    elif res.get("status") == "skipped":
                        skipped += 1
                        print(f"  - p{batch_start}: skipped")
                    else:
                        errors += 1
                        print(f"  ✗ p{batch_start}: {res.get('error', 'unknown')}")
                except Exception as e:
                    errors += 1
                    print(f"  ✗ p{batch_start}: {e}")

                batch_text = ""
                batch_start = page_num + 1
                time.sleep(DELAY_SECONDS)

    print(f"\n{'=' * 60}\nDONE — extracted: {extracted} | skipped: {skipped} | errors: {errors}")
    print("Next: open /admin/afi-management to review and publish.")


if __name__ == "__main__":
    extract()
