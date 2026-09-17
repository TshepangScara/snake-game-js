# Snake Game

A classic Snake game built with vanilla HTML, CSS, and JavaScript — playable directly in the browser, no dependencies or build step.

## Features

- Three difficulty levels (Easy, Medium, Hard) with different speeds and score multipliers
- Keyboard (arrow keys) and on-screen d-pad controls, so it works on desktop and touch devices
- Pause/resume
- Persistent high score and top-5 leaderboard, saved locally via `localStorage`
- Welcome and game-over popups

## How to play

Open `index.html` in a browser, press **Enter** (or tap **Play**), then pick a difficulty:

- **1** or **Easy** button — slower speed
- **2** or **Medium** button
- **3** or **Hard** button — fastest speed, highest score multiplier

Control the snake with the arrow keys or the on-screen d-pad. Eat food to grow and score points; avoid running into yourself.

## Running locally

No build step required — it's a static site.

```bash
py -3 -m http.server
```

Then open `http://localhost:8000` in your browser (or just open `index.html` directly).

## Tech stack

- HTML5, CSS3, vanilla JavaScript
- Font Awesome (via CDN) for the directional control icons
- Browser `localStorage` for high score and leaderboard persistence
