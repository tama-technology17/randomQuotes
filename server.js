/**
 * Random Quotes API
 * A REST API built with Node.js + Express for managing random quotes.
 * Data is persisted in quotes.json (no database required).
 */
const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const cors = require("cors");

app.use(cors());
const app = express();
const PORT = process.env.PORT || 3000;
const QUOTES_FILE = path.join(__dirname, "quotes.json");
app.use(cors());
// ─── Allowed Categories ───────────────────────────────────────────────────────
const ALLOWED_CATEGORIES = [
  "Motivasi",
  "Kehidupan",
  "Belajar",
  "Inspirasi",
  "Kesuksesan",
  "Teknologi",
  "Programming",
  "Persahabatan",
  "Cinta",
  "Islami",
  "Humor",
  "Bisnis",
  "Produktivitas",
];

// ─── Allowed Author Characters Regex ──────────────────────────────────────────
// Only letters, numbers, spaces, dot, hyphen, and apostrophe
const AUTHOR_REGEX = /^[a-zA-Z0-9\s.'\-]+$/;

// ─── HTML Tag Detection Regex ─────────────────────────────────────────────────
const HTML_TAG_REGEX = /<[^>]+>/;

// ─── Control Character Regex (excluding normal whitespace) ────────────────────
const CONTROL_CHAR_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/;

// ─── Emoji Detection Regex ────────────────────────────────────────────────────
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

// ─── Middleware: Request Logger ───────────────────────────────────────────────
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ─── Middleware: JSON Parser with 10KB Limit ──────────────────────────────────
app.use(express.json({ limit: "10kb" }));

// ─── Middleware: Invalid JSON Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Format JSON tidak valid.",
    });
  }
  next(err);
});

// ─── Helper: Read Quotes from File ────────────────────────────────────────────
async function readQuotes() {
  try {
    const data = await fs.readFile(QUOTES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

// ─── Helper: Write Quotes to File ─────────────────────────────────────────────
async function writeQuotes(quotes) {
  await fs.writeFile(QUOTES_FILE, JSON.stringify(quotes, null, 2), "utf-8");
}

// ─── Helper: Normalize String for Duplicate Check ─────────────────────────────
function normalizeForDuplicateCheck(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Helper: Check if String Contains Only Numbers ────────────────────────────
function isOnlyNumbers(str) {
  return /^\d+$/.test(str.trim());
}

// ─── Helper: Check if String Contains Only Emojis ─────────────────────────────
function isOnlyEmojis(str) {
  const cleaned = str.replace(/\s/g, "");
  if (cleaned.length === 0) return false;
  return [...cleaned].every((char) => EMOJI_REGEX.test(char));
}

// ─── Helper: Remove Multiple Spaces ───────────────────────────────────────────
function collapseSpaces(str) {
  return str.replace(/\s+/g, " ").trim();
}

// ─── Validation: Quote Body ───────────────────────────────────────────────────
function validateQuoteBody(body) {
  const errors = [];

  // Reject unknown fields
  const allowedFields = ["quote", "author", "category"];
  const unknownFields = Object.keys(body).filter(
    (key) => !allowedFields.includes(key)
  );
  if (unknownFields.length > 0) {
    errors.push(`Field tidak dikenal: ${unknownFields.join(", ")}.`);
  }

  // Validate quote
  if (!body.hasOwnProperty("quote")) {
    errors.push("Quote wajib diisi.");
  } else if (typeof body.quote !== "string") {
    errors.push("Quote harus berupa string.");
  } else {
    const quoteTrimmed = body.quote.trim();
    if (quoteTrimmed.length === 0) {
      errors.push("Quote wajib diisi.");
    } else if (quoteTrimmed.length < 10) {
      errors.push("Quote minimal 10 karakter.");
    } else if (quoteTrimmed.length > 300) {
      errors.push("Quote maksimal 300 karakter.");
    } else if (isOnlyNumbers(quoteTrimmed)) {
      errors.push("Quote tidak boleh hanya angka.");
    } else if (isOnlyEmojis(quoteTrimmed)) {
      errors.push("Quote tidak boleh hanya emoji.");
    } else if (HTML_TAG_REGEX.test(quoteTrimmed)) {
      errors.push("Quote tidak boleh mengandung tag HTML.");
    } else if (CONTROL_CHAR_REGEX.test(quoteTrimmed)) {
      errors.push("Quote tidak boleh mengandung karakter kontrol.");
    }
  }

  // Validate author
  if (body.hasOwnProperty("author")) {
    if (typeof body.author !== "string") {
      errors.push("Author harus berupa string.");
    } else {
      const authorTrimmed = body.author.trim();
      if (authorTrimmed.length > 0) {
        if (authorTrimmed.length < 2) {
          errors.push("Author minimal 2 karakter.");
        } else if (authorTrimmed.length > 50) {
          errors.push("Author maksimal 50 karakter.");
        } else if (!AUTHOR_REGEX.test(authorTrimmed)) {
          errors.push(
            "Author hanya boleh mengandung huruf, angka, spasi, titik, tanda hubung, dan apostrof."
          );
        }
      }
    }
  }

  // Validate category
  if (!body.hasOwnProperty("category")) {
    errors.push("Category wajib diisi.");
  } else if (typeof body.category !== "string") {
    errors.push("Category harus berupa string.");
  } else {
    const categoryTrimmed = body.category.trim();
    if (categoryTrimmed.length === 0) {
      errors.push("Category wajib diisi.");
    } else if (!ALLOWED_CATEGORIES.includes(categoryTrimmed)) {
      errors.push(
        `Category tidak valid. Kategori yang diperbolehkan: ${ALLOWED_CATEGORIES.join(", ")}.`
      );
    }
  }

  return errors;
}

// ─── GET / ────────────────────────────────────────────────────────────────────
// API Information
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: "Random Quotes API",
    version: "1.0.0",
    endpoints: ["GET /api/quotes/random", "POST /api/quotes"],
  });
});

// ─── GET /api/quotes/random ───────────────────────────────────────────────────
// Get a random quote
app.get("/api/quotes/random", async (req, res, next) => {
  try {
    const quotes = await readQuotes();

    if (quotes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada quote yang tersedia.",
      });
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    res.status(200).json({
      success: true,
      data: randomQuote,
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/quotes ─────────────────────────────────────────────────────────
// Add a new quote
app.post("/api/quotes", async (req, res, next) => {
  try {
    // Check Content-Type
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      return res.status(415).json({
        success: false,
        message: 'Content-Type harus "application/json".',
      });
    }

    const body = req.body;

    // Validate body
    const errors = validateQuoteBody(body);
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: errors.join(" "),
      });
    }

    // Read existing quotes
    const quotes = await readQuotes();

    // Normalize and check for duplicates
    const newQuoteNormalized = normalizeForDuplicateCheck(body.quote);
    const isDuplicate = quotes.some((q) => {
      return normalizeForDuplicateCheck(q.quote) === newQuoteNormalized;
    });

    if (isDuplicate) {
      return res.status(422).json({
        success: false,
        message: "Quote sudah ada, tidak boleh duplikat.",
      });
    }

    // Prepare new quote
    const newId = quotes.length > 0 ? Math.max(...quotes.map((q) => q.id)) + 1 : 1;

    const newQuote = {
      id: newId,
      quote: collapseSpaces(body.quote),
      author:
        body.author === undefined || body.author.trim().length === 0
          ? "Anonymous"
          : body.author.trim(),
      category: body.category.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save
    quotes.push(newQuote);
    await writeQuotes(quotes);

    res.status(201).json({
      success: true,
      message: "Quote berhasil ditambahkan.",
      data: newQuote,
    });
  } catch (error) {
    next(error);
  }
});

// ─── Middleware: 404 Not Found ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan.",
  });
});

// ─── Middleware: Global Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server.",
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Random Quotes API running on http://localhost:${PORT}`);
});
