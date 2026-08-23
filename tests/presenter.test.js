import test from 'node:test';
import assert from 'node:assert';
import { splitSlides, parseInlineMarkdown, parseMarkdownToHtml, buildHtmlSlideshow } from '../src/presenter.js';

test('splitSlides parses slides correctly', () => {
  const md = `
# Slide 1
Welcome
---
## Slide 2
Description
---
# Slide 3
  `;
  const slides = splitSlides(md);
  assert.strictEqual(slides.length, 3);
  assert.strictEqual(slides[0], '# Slide 1\nWelcome');
  assert.strictEqual(slides[1], '## Slide 2\nDescription');
  assert.strictEqual(slides[2], '# Slide 3');
});

test('parseInlineMarkdown converts inline tokens', () => {
  const out1 = parseInlineMarkdown('This is **bold** text');
  assert.strictEqual(out1, 'This is <strong>bold</strong> text');

  const out2 = parseInlineMarkdown('This is *italic* text');
  assert.strictEqual(out2, 'This is <em>italic</em> text');

  const out3 = parseInlineMarkdown('This is `code` text');
  assert.strictEqual(out3, 'This is <code>code</code> text');

  // Should escape HTML tags
  const out4 = parseInlineMarkdown('Escape <script> tags');
  assert.strictEqual(out4, 'Escape &lt;script&gt; tags');
});

test('parseMarkdownToHtml handles structure blocks', () => {
  const md = `
# Slide Title
Some text with **bold** token.

- Item 1
- Item 2

\`\`\`javascript
const val = 42;
\`\`\`
  `;
  const html = parseMarkdownToHtml(md);
  
  assert.ok(html.includes('<h1>Slide Title</h1>'));
  assert.ok(html.includes('<p>Some text with <strong>bold</strong> token.</p>'));
  assert.ok(html.includes('<ul>'));
  assert.ok(html.includes('<li>Item 1</li>'));
  assert.ok(html.includes('<li>Item 2</li>'));
  assert.ok(html.includes('</ul>'));
  assert.ok(html.includes('<pre><code>const val = 42;</code></pre>'));
});

test('buildHtmlSlideshow integrates code and controls', () => {
  const slides = ['# Slide 1', '## Slide 2'];
  const fullHtml = buildHtmlSlideshow(slides, 'Custom Title');
  
  assert.ok(fullHtml.includes('<!DOCTYPE html>'));
  assert.ok(fullHtml.includes('<title>Custom Title</title>'));
  assert.ok(fullHtml.includes('id="slide-1"'));
  assert.ok(fullHtml.includes('id="slide-2"'));
  assert.ok(fullHtml.includes('totalSlides = 2'));
});
