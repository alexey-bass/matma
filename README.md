# Matma

A standalone HTML math learning app for kids.

**[Play now](https://alexey-bass.github.io/matma/)**

## Features

- **Addition, Subtraction, Multiplication, Division** — toggle operations on/off
- **3 Game modes** — Practice (endless), Challenge (timed with results), and Times Tables (all 81 facts from 1×1 to 9×9)
- **3 Difficulty levels** — Easy (up to 20), Medium (up to 50), Hard (up to 100)
- **2 Languages** — English and Polish, selected at startup with flag icons
- **Challenge mode** — choose timer (2/5/10 min), difficulty, and operations; see results with accuracy and average solve time
- **Live counters** — total, correct, wrong, and streak with star rewards
- **Touch-friendly** — on-screen numpad for tablets and phones
- **Zero dependencies** — no build step, no npm install needed

## How to use

Visit the [live version](https://alexey-bass.github.io/matma/).

## Local development

The app uses ES modules, so it needs to be served over HTTP (not opened as a `file://` URL). Use any local server:

```bash
npx serve
```

Then open `http://localhost:3000` in your browser.

## Running tests

Tests use the Node.js built-in test runner (Node 18+). No dependencies to install.

```bash
npm test
```
