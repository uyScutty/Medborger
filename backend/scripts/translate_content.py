"""
Translate question JSON and faktaark JSON from Danish into multiple languages
using the Claude API.

Usage:
    python backend/scripts/translate_content.py --target questions
    python backend/scripts/translate_content.py --target faktaark
    python backend/scripts/translate_content.py --target all

Reads:
    backend/data/prøve_2016_sommer.json
    backend/data/faktaark.json

Writes translations back in-place. Safe to re-run (skips already-translated fields).
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

import anthropic

ROOT = Path(__file__).resolve().parents[2]
QUESTIONS_FILE = ROOT / "backend" / "data" / "prøve_2016_sommer.json"
FAKTAARK_FILE = ROOT / "backend" / "data" / "faktaark.json"

TARGET_LANGS = {
    "en": "English",
    "ar": "Arabic",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "th": "Thai",
    "tl": "Tagalog (Filipino)",
    "fa": "Persian (Farsi)",
}

LANG_NAMES_DA = {
    "en": "Engelsk",
    "ar": "Arabisk",
    "tr": "Tyrkisk",
    "uk": "Ukrainsk",
    "th": "Thai",
    "tl": "Tagalog",
    "fa": "Persisk/Farsi",
}

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


def translate_batch(texts: dict[str, str], context: str = "") -> dict[str, dict[str, str]]:
    """
    Translate a dict of {key: danish_text} into all TARGET_LANGS.
    Returns {key: {lang: translated_text}}.
    """
    items_json = json.dumps(texts, ensure_ascii=False, indent=2)
    lang_list = "\n".join(f'  "{code}": "{name}"' for code, name in TARGET_LANGS.items())

    prompt = f"""You are translating Danish civic education text for people preparing for the Danish citizenship test (medborgerskabsprøven). The audience may have limited Danish, so translations must be accurate, natural, and use appropriate formal register.

Context: {context}

Translate each value in the JSON below into all these languages:
{lang_list}

Input JSON (keys are identifiers, values are Danish text to translate):
{items_json}

Return ONLY a valid JSON object in this exact format:
{{
  "<key>": {{
    "en": "...",
    "ar": "...",
    "tr": "...",
    "uk": "...",
    "th": "...",
    "tl": "...",
    "fa": "..."
  }},
  ...
}}

Rules:
- Preserve any special characters (numbers, dates, proper nouns like Folketing, Grundloven)
- Do not translate proper nouns unless they have an established translation in that language
- For Arabic, use Modern Standard Arabic
- Return only the JSON, no explanation"""

    response = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}],
    )

    # Find the text block (skip ThinkingBlock which claude-sonnet-5 may prepend)
    text_block = next((b for b in response.content if hasattr(b, "text")), None)
    if text_block is None:
        raise ValueError(f"No text block in response: {response.content}")
    text = text_block.text.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    return json.loads(text)


def translate_questions():
    print(f"\n=== Translating questions: {QUESTIONS_FILE.name} ===")
    with open(QUESTIONS_FILE, encoding="utf-8") as f:
        questions = json.load(f)

    total_input_tokens = 0
    total_output_tokens = 0

    for i, q in enumerate(questions, 1):
        qid = q["question_id"]
        existing_langs = set(q.get("question_text_translations", {}).keys())
        missing_langs = set(TARGET_LANGS) - existing_langs

        print(f"\n[{i:02d}/25] {qid}")

        if not missing_langs:
            print("  question text: already translated — skipping")
        else:
            print(f"  question text: translating {sorted(missing_langs)}...")
            batch = {"q": q["question_text"]}
            results = translate_batch(batch, context=f"Citizenship test question about {q.get('category_id', '')}")
            for lang in missing_langs:
                if lang in results.get("q", {}):
                    q.setdefault("question_text_translations", {})[lang] = results["q"][lang]
            print("  question text: done")
            time.sleep(0.5)

        # Translate choices
        for opt in q["options"]:
            existing_opt_langs = set(opt.get("text_translations", {}).keys())
            missing_opt_langs = set(TARGET_LANGS) - existing_opt_langs
            if not missing_opt_langs:
                continue
            batch = {"o": opt["text"]}
            results = translate_batch(batch, context="Answer choice for citizenship test question")
            for lang in missing_opt_langs:
                if lang in results.get("o", {}):
                    opt.setdefault("text_translations", {})[lang] = results["o"][lang]
            time.sleep(0.3)

        print(f"  choices: done")

        # Translate explanation_sentences
        for j, sent in enumerate(q.get("explanation_sentences", [])):
            existing_sent_langs = set(sent.keys()) - {"da"}
            missing_sent_langs = set(TARGET_LANGS) - existing_sent_langs
            if not missing_sent_langs:
                continue
            batch = {"s": sent["da"]}
            results = translate_batch(batch, context="Explanation for a citizenship test answer")
            for lang in missing_sent_langs:
                if lang in results.get("s", {}):
                    sent[lang] = results["s"][lang]
            time.sleep(0.3)

        print(f"  explanations: done")

        # Translate historical_note_sentences
        for sent in q.get("historical_note_sentences", []):
            existing_langs = set(sent.keys()) - {"da"}
            missing = set(TARGET_LANGS) - existing_langs
            if not missing:
                continue
            batch = {"s": sent["da"]}
            results = translate_batch(batch, context="Historical note about a law change in Denmark")
            for lang in missing:
                if lang in results.get("s", {}):
                    sent[lang] = results["s"][lang]
            time.sleep(0.3)

        # Save after each question (safe resume)
        with open(QUESTIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"\nQuestions saved to {QUESTIONS_FILE}")


def translate_faktaark():
    print(f"\n=== Translating faktaark: {FAKTAARK_FILE.name} ===")
    with open(FAKTAARK_FILE, encoding="utf-8") as f:
        faktaark = json.load(f)

    for i, fa in enumerate(faktaark, 1):
        fid = fa["factsheet_id"]
        print(f"\n[{i:02d}/26] {fid}: {fa['title'].get('da', '?')}")

        # Title (short, translate all at once)
        existing_title_langs = set(fa["title"].keys())
        missing_title_langs = set(TARGET_LANGS) - existing_title_langs
        if missing_title_langs:
            batch = {"t": fa["title"]["da"]}
            results = translate_batch(batch, context="Title of a Danish civic education fact sheet")
            for lang in missing_title_langs:
                if lang in results.get("t", {}):
                    fa["title"][lang] = results["t"][lang]
            print(f"  title: translated to {sorted(missing_title_langs)}")
            time.sleep(0.5)
        else:
            print("  title: already done")

        # Content — split into paragraphs to stay within token limits
        existing_content_langs = set(fa.get("content_markdown", {}).keys())
        missing_content_langs = set(TARGET_LANGS) - existing_content_langs

        if missing_content_langs:
            da_text = fa["content_markdown"].get("da", "")
            paragraphs = [p.strip() for p in da_text.split("\n\n") if p.strip()]

            for lang in missing_content_langs:
                lang_name = TARGET_LANGS[lang]
                print(f"  content → {lang_name}...", end="", flush=True)
                translated_paragraphs = []

                # Translate in chunks of 5 paragraphs
                chunk_size = 5
                for chunk_start in range(0, len(paragraphs), chunk_size):
                    chunk = paragraphs[chunk_start:chunk_start + chunk_size]
                    batch = {str(j): p for j, p in enumerate(chunk)}
                    # Single-language prompt for content (cheaper per call)
                    items_json = json.dumps(batch, ensure_ascii=False)
                    prompt = f"""Translate the following Danish civic education text to {lang_name}.
Preserve formatting, numbers, and proper nouns (Folketing, Grundloven, etc.).
Return ONLY a JSON object with the same keys, values translated to {lang_name}.

{items_json}"""
                    response = client.messages.create(
                        model="claude-sonnet-5",
                        max_tokens=4000,
                        messages=[{"role": "user", "content": prompt}],
                    )
                    text_block = next((b for b in response.content if hasattr(b, "text")), None)
                    result_text = text_block.text.strip() if text_block else ""
                    if result_text.startswith("```"):
                        result_text = result_text.split("```")[1]
                        if result_text.startswith("json"):
                            result_text = result_text[4:]
                        result_text = result_text.strip()
                    chunk_result = json.loads(result_text)
                    translated_paragraphs.extend(
                        chunk_result.get(str(j), chunk[j]) for j in range(len(chunk))
                    )
                    time.sleep(0.5)

                fa["content_markdown"][lang] = "\n\n".join(translated_paragraphs)
                print(" done")

        else:
            print("  content: already done")

        # Save after each faktaark
        with open(FAKTAARK_FILE, "w", encoding="utf-8") as f:
            json.dump(faktaark, f, ensure_ascii=False, indent=2)

    print(f"\nFaktaark saved to {FAKTAARK_FILE}")


def main():
    parser = argparse.ArgumentParser(description="Translate Medborger content to multiple languages")
    parser.add_argument(
        "--target",
        choices=["questions", "faktaark", "all"],
        default="questions",
        help="What to translate (default: questions)",
    )
    args = parser.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not set in environment")
        sys.exit(1)

    print(f"Using API key: {api_key[:20]}...")
    print(f"Target languages: {', '.join(TARGET_LANGS.values())}")

    if args.target in ("questions", "all"):
        translate_questions()

    if args.target in ("faktaark", "all"):
        translate_faktaark()

    print("\nDone!")


if __name__ == "__main__":
    main()
