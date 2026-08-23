import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Simple markdown block parser
export fn parseMarkdownToHtml(markdown) {
  const lines = markdown.split('\n');
  let html = [];
  let inList = false;
  let inCode = false;
  let codeBlock = [];

  for (let line of lines) {
    const trimmed = line.trim();

    // Handle code blocks
    if (trimmed.startsWith('```')) {
      if (inCode) {
        // End code block
        html.push(`<pre><code>${codeBlock.join('\n')}</code></pre>`);
        codeBlock = [];
        inCode = false;
      } else {
        // Start code block
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      // Escape HTML chars inside code blocks
      const escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      codeBlock.push(escaped);
      continue;
    }

    // Handle lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      const itemContent = parseInlineMarkdown(trimmed.substring(2));
      html.push(`<li>${itemContent}</li>`);
      continue;
    } else {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
    }

    // Skip empty lines
    if (trimmed === '') {
      continue;
    }

    // Handle headings
    if (trimmed.startsWith('# ')) {
      html.push(`<h1>${parseInlineMarkdown(trimmed.substring(2))}</h1>`);
    } else if (trimmed.startsWith('## ')) {
      html.push(`<h2>${parseInlineMarkdown(trimmed.substring(3))}</h2>`);
    } else if (trimmed.startsWith('### ')) {
      html.push(`<h3>${parseInlineMarkdown(trimmed.substring(4))}</h3>`);
    } else {
      // Paragraph
      html.push(`<p>${parseInlineMarkdown(trimmed)}</p>`);
    }
  }

  // Close lists or code if file ends
  if (inList) html.push('</ul>');
  if (inCode) html.push(`<pre><code>${codeBlock.join('\n')}</code></pre>`);

  return html.join('\n');
}

// Basic inline markdown parser (Bold, Italic, Code)
export fn parseInlineMarkdown(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold: **text**
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic: *text*
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// Split document by slide separator "---"
export fn splitSlides(markdown) {
  // Normalize line endings
  const normalized = markdown.replace(/\r\n/g, '\n');
  return normalized
    .split(/\n---\n/)
    .map((slide) => slide.trim())
    .filter((slide) => slide.length > 0);
}

// Generate the self-contained HTML slideshow template
export fn buildHtmlSlideshow(slidesContent, title = 'Presentation') {
  const slidesHtml = slidesContent
    .map((slideMarkdown, index) => {
      const slideBody = parseMarkdownToHtml(slideMarkdown);
      return `
        <div class="slide" id="slide-${index + 1}">
          <div class="slide-content">
            ${slideBody}
          </div>
        </div>
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      --bg-color: #121214;
      --text-color: #e4e4e7;
      --primary-color: #6366f1;
      --card-bg: #1c1c1f;
      --accent: #a5b4fc;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    #slideshow-container {
      width: 90%;
      max-width: 900px;
      height: 70vh;
      position: relative;
      background-color: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border: 1px solid #2e2e33;
    }
    .slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
    }
    .slide.active {
      opacity: 1;
      visibility: visible;
    }
    .slide-content {
      width: 100%;
      max-height: 100%;
      overflow-y: auto;
    }
    /* Typography formatting */
    h1 {
      font-size: 2.8rem;
      margin-bottom: 20px;
      color: var(--accent);
      border-bottom: 2px solid #2e2e33;
      padding-bottom: 10px;
    }
    h2 {
      font-size: 2.2rem;
      margin-bottom: 15px;
      color: var(--accent);
    }
    h3 {
      font-size: 1.6rem;
      margin-bottom: 10px;
      color: var(--text-color);
    }
    p {
      font-size: 1.2rem;
      line-height: 1.6;
      margin-bottom: 15px;
    }
    ul {
      margin-left: 30px;
      margin-bottom: 20px;
      font-size: 1.2rem;
      line-height: 1.8;
    }
    li {
      margin-bottom: 8px;
    }
    pre {
      background-color: #0d0d0f;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #2e2e33;
      overflow-x: auto;
      margin-bottom: 20px;
    }
    code {
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 0.95em;
      background-color: rgba(255, 255, 255, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
    pre code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
    }
    strong {
      color: var(--accent);
    }
    
    /* Footer layout controls */
    #controls {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      width: 90%;
      max-width: 900px;
      align-items: center;
    }
    .btn {
      background-color: var(--primary-color);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #4f46e5;
    }
    #slide-number {
      font-size: 1.1rem;
      color: #71717a;
    }
  </style>
</head>
<body>

  <div id="slideshow-container">
    ${slidesHtml}
  </div>

  <div id="controls">
    <button class="btn" id="prev-btn" onclick="prevSlide()">&larr; Prev</button>
    <div id="slide-number">Slide 1 of ${slidesContent.length}</div>
    <button class="btn" id="next-btn" onclick="nextSlide()">Next &rarr;</button>
  </div>

  <script>
    let currentSlide = 1;
    const totalSlides = ${slidesContent.length};

    function showSlide(n) {
      if (n > totalSlides) currentSlide = 1;
      else if (n < 1) currentSlide = totalSlides;
      else currentSlide = n;

      document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
      document.getElementById('slide-' + currentSlide).classList.add('active');
      document.getElementById('slide-number').textContent = 'Slide ' + currentSlide + ' of ' + totalSlides;
      
      // Update hash routing
      window.location.hash = 'slide-' + currentSlide;
    }

    function nextSlide() { showSlide(currentSlide + 1); }
    function prevSlide() { showSlide(currentSlide - 1); }

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        prevSlide();
      }
    });

    // Hash navigation routing on load
    window.addEventListener('load', () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#slide-')) {
        const slideId = parseInt(hash.split('-')[1], 10);
        if (!isNaN(slideId) && slideId >= 1 && slideId <= totalSlides) {
          currentSlide = slideId;
        }
      }
      showSlide(currentSlide);
    });
  </script>
</body>
</html>`;
}

// CLI handler
async function main() {
  const args = process.argv.slice(2);
  const inputPath = args[0] ? path.resolve(args[0]) : path.join(process.cwd(), 'presentation.md');
  const outputPath = args[1] ? path.resolve(args[1]) : inputPath.replace(/\.md$/, '.html');

  console.log(`Reading presentation markup from: ${inputPath}`);

  let markdown;
  try {
    markdown = await fs.readFile(inputPath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Create a default presentation slide if not found
      console.log('No presentation.md found. Creating a default presentation.md...');
      markdown = `# Welcome to Presenter!
---
## What is it?
- A fast, zero-dependency Markdown presentation compiler
- Compiles down to a **single, standalone HTML** file
- Styled automatically with a beautiful, modern theme
---
## Keyboard Shortcuts
- Go Forward: \`Space\` or \`ArrowRight\`
- Go Backward: \`ArrowLeft\`
- Links and formatting work too! **Bold**, *Italics*, \`code\` blocks.`;
      await fs.writeFile(inputPath, markdown, 'utf8');
    } else {
      console.error(`Error reading input file: ${err.message}`);
      process.exit(1);
    }
  }

  const slides = splitSlides(markdown);
  const presentationTitle = path.basename(inputPath, '.md');
  const html = buildHtmlSlideshow(slides, presentationTitle);

  try {
    await fs.writeFile(outputPath, html, 'utf8');
    console.log(`\nSlideshow compiled successfully! 🚀`);
    console.log(`Output HTML written to: ${outputPath}\n`);
  } catch (err) {
    console.error(`Error compiling presentation output file: ${err.message}`);
    process.exit(1);
  }
}

const isDirectRun = process.argv[1] && (
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith('presenter.js') ||
  process.argv[1].endsWith('index.js')
);

if (isDirectRun) {
  main().catch((err) => {
    console.error('Fatal presenter compiler error:', err);
    process.exit(1);
  });
}
