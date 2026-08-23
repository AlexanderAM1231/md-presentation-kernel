# md-presentation-kernel - Shared Open Source Project - Open-Source Project

A lightweight command-line tool written in Node.js that compiles a single Markdown file into a beautiful, self-contained, interactive HTML slide presentation with modern styled slides, keyboard navigation, and zero runtime dependencies.

## Project Features

- **Zero dependencies**: Built entirely on top of the native Node.js core modules.
- **Single file output**: Compiles slides and styling into a single standalone `.html` file that can be opened in any web browser, shared via email, or hosted static-only.
- **Embedded Slides Player**: The generated HTML includes an interactive slide deck controller script:
  - Navigation: `Space` or `ArrowRight` (forward), `ArrowLeft` or `Backspace` (back).
  - Keeps track of the current slide in URL hash routes (e.g. `#slide-2`).
- **Clean Markdown parsing**: Processes headings, bullets, code blocks, bold text, italics, and inline code snippets natively.
- **Modern Responsive Dark Theme**: Features clean system fonts, code highlight formatting, centered layouts, and transitions.

## Repository Layout

```text
md-presentation-kernel/
├── package.json
├── src/
│   └── presenter.js
├── tests/
│   └── presenter.test.js
└── README.md
```

## Build instructions

Ensure Node.js (version 18 or later) is installed. There are no npm packages to install.

## Running the Project

### 1. Compile a Markdown file

```bash
# Compiles default presentation.md to presentation.html
node src/presenter.js

# Compile a specific file with custom output destination
node src/presenter.js my_slides.md index.html
```

### 2. Format slides

Write slide decks using standard horizontal rule dividers (`---`):

```markdown
# My Title Slide
Subtitle or name here

---

## Slide 2: Main Points
- This is a bullet item with **bold** words.
- This is a bullet item with *italic* words.
- Code blocks are also supported!

---

## Slide 3: Code Demo
\`\`\`javascript
function hello() {
  console.log("Hello, Presenter!");
}
\`\`\`
```

## Running Tests

Run the test suite using Node.js's built-in test runner:

```bash
npm test
```
This runs assertions verifying slide dividing regexes, inline HTML conversions, block wrappers, and final page layouts.

---
*Released under the MIT License by Sassywow.*

---
*Released under the MIT License by alibasit-lgtm4.*
