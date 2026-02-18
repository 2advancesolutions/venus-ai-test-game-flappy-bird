# 🐦 Flappy Bird - React Edition

A pixel-perfect Flappy Bird clone built with React and HTML5 Canvas. Because sometimes you need to remind people why they throw their phones.

## 🎮 Features

- **Classic Gameplay**: Tap or press SPACE to flap. Avoid pipes. Try not to rage quit.
- **Pixel-Art Graphics**: Crisp, retro-styled visuals with smooth animations
- **Parallax Scrolling**: Multi-layered background with clouds and city buildings
- **Physics Engine**: Gravity, jump mechanics, and rotation animations
- **Collision Detection**: Accurate AABB collision detection
- **Score Tracking**: Local high score tracking
- **Responsive Design**: Works on desktop (click/spacebar) and mobile (touch)

## 🚀 Quick Start

No build tools required! Just open `index.html` in your browser:

```bash
# Option 1: Direct file open
open index.html

# Option 2: Use a local server (recommended)
python3 -m http.server 8000
# Then visit: http://localhost:8000

# Option 3: Use any other local server
npx serve .
```

## 🎨 Visual Design

### Color Palette
- **Sky**: `#87CEEB` (Classic Flappy Bird blue)
- **Pipes**: `#5DBE4A` (Green) with `#2D8B3D` accents
- **Bird**: `#FFC34D` (Yellow) with `#FF8C42` (Orange) details
- **Clouds**: Pure white with soft edges
- **Buildings**: `#A0B8CC` (Gray-blue silhouettes)
- **Ground**: `#DED895` (Light tan)

### Visual Effects
- Bird rotation based on velocity (falls = face-plant animation)
- Parallax scrolling (clouds move slower than pipes, buildings slower than clouds)
- Smooth pixel-art rendering with `imageSmoothingEnabled = false`
- Shine effects on pipes
- Detailed bird with eye, wing, and beak

## 🏗️ Architecture

### Component Structure
```
FlappyBirdGame (Main Component)
├── Game State Management (React hooks)
├── Canvas Rendering (useRef + useEffect)
└── Game Loop (requestAnimationFrame)

Game Classes:
├── Bird (entity, physics, rendering)
├── Pipe (spawning, movement, collision bounds)
└── Background (parallax layers, scrolling)
```

### Key Technical Decisions

**Why React with Canvas (not Phaser/Unity)?**
- Task explicitly specified "Frontend: React (functional components, hooks, JSX)"
- React provides clean state management and component lifecycle
- Canvas gives us full control over rendering and performance
- Zero build tools needed with CDN approach

**Why Class-based entities?**
- Game entities (Bird, Pipe, Background) have clear state and behavior
- Classes make collision detection and rendering logic self-contained
- Easy to debug and test individual components

**Why requestAnimationFrame?**
- Smooth 60fps gameplay
- Browser-optimized frame timing
- Automatic throttling when tab isn't active (battery friendly)

## 🎯 Game Configuration

All gameplay constants are in `GAME_CONFIG`:

```javascript
GRAVITY: 0.5           // How fast bird falls
JUMP_FORCE: -9         // How high bird jumps
PIPE_SPEED: 2.5        // Horizontal scroll speed
PIPE_GAP: 160          // Vertical gap between pipes
PIPE_SPAWN_INTERVAL: 90 // Frames between pipe spawns
```

Adjust these to make the game easier/harder!

## 🔧 Code Highlights

### Physics & Collision
```javascript
// AABB collision detection
function intersects(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}
```

### Bird Rotation Animation
```javascript
// Rotation follows velocity for dramatic face-plants
this.rotation = Math.min(Math.max(this.velocity * 3, -30), 90);
```

### Parallax Scrolling
```javascript
// Different speeds for depth perception
CLOUD_SPEED: 0.5       // Slowest (furthest away)
BUILDING_SPEED: 1      // Medium
PIPE_SPEED: 2.5        // Fastest (closest)
```

## 🐛 Known Quirks

- **Double Jump Prevention**: Rapid clicking is allowed (like the original)
- **Pipe Randomization**: Gap height is randomized per pipe spawn
- **Score Timing**: Score increments when bird passes pipe center
- **Collision Precision**: Uses rectangular hitboxes (standard for Flappy Bird)

## 🎮 Controls

- **Desktop**: Click mouse or press SPACEBAR to flap
- **Mobile**: Tap screen to flap
- **Start Screen**: Click "START GAME" or press SPACE
- **Game Over**: Click "PLAY AGAIN" to restart

## 📊 Performance

- **Target FPS**: 60fps
- **Canvas Size**: 400x600px (classic mobile game dimensions)
- **Memory**: Pipes auto-cleanup when offscreen
- **Rendering**: Optimized draw calls, no unnecessary object creation in game loop

## 🎨 Customization Ideas

Want to make it your own? Easy modifications:

1. **Change bird appearance**: Edit `Bird.draw()` method
2. **Add power-ups**: Create new entity classes
3. **Different pipes**: Modify `Pipe.draw()` for new obstacles
4. **Sound effects**: Add Web Audio API calls on jump/score/collision
5. **Themes**: Modify `COLORS` object for night mode, space theme, etc.

## 🧪 Testing Checklist

- ✅ Bird responds to clicks/spacebar
- ✅ Bird falls with gravity
- ✅ Pipes spawn at correct intervals with random heights
- ✅ Pipes scroll smoothly
- ✅ Collision detection works (bird vs pipes, ground, ceiling)
- ✅ Score increments when passing pipes
- ✅ High score persists during session
- ✅ Game resets properly after game over
- ✅ Parallax background scrolls correctly
- ✅ Bird rotation animation works

## 🚀 Deployment

This is a static site. Deploy anywhere:

```bash
# Netlify
netlify deploy --prod

# Vercel
vercel --prod

# GitHub Pages
# Just push to gh-pages branch

# Or literally anywhere that serves HTML
```

## 🤓 Technical Stack

- **React 18**: UI framework (via CDN)
- **HTML5 Canvas**: 2D rendering
- **Vanilla JavaScript**: Game logic and physics
- **CSS3**: Styling and overlays
- **Google Fonts**: "Press Start 2P" for retro feel

## 📝 License

MIT License - Feel free to clone, modify, and share!

## 🌟 Credits

Built by **Venus** — your loyal AI coding partner.

Game concept inspired by the legendary Flappy Bird by Dong Nguyen (2013).

*"I counted the frame timing calculations. There are 17 of them. Functions should do 1 thing. But this one makes a bird fly, so I'll allow it."* — Venus 🌟

---

**P.S.**: If you rage quit, that means the collision detection is working perfectly. You're welcome.
