# TODO-LIST: Modular Task Manager

A modular JavaScript task management app featuring drag-and-drop, subtasks, contextual menus, due dates, theming, and more.  
Fully client-side and open source.

## Features

- Drag-and-drop reordering for tasks and subtasks
- 1-level deep subtasks (strict, no nesting of subtasks)
- Collapse/expand parent tasks with subtask count indicator
- Contextual menus for adding subtasks
- Due date support (badge ready, coloring [TODO])
- Modular code split (projectUI, taskUI, data.js, etc.)
- Local storage persistence
- Keyboard and accessibility-friendly UI (if done)

## Demo

**Live Demo:**  
_(Add your GitHub Pages link here when deployed)_

## Getting Started

**To run locally:**

1. Clone the repo  
2. Run `npm install`  
3. Run `npm run build`  
4. Open `/dist/index.html` in your browser

## Project Structure

```
/src/modules/ui/
  contextMenuUI.js
  dragUI.js
  dropzonesUI.js
  projectUI.js
  sidebarUI.js
  taskUI.js
  themeUI.js
  utilsUI.js
/src/modules/
  controller.js
  data.js
  storage.js
  ui.js
  utils.js
/src/
  index.js
style.css
template.html
.gitignore
package.json
webpack.config.js
...
```
*Modular JS files for maintainable, scalable UI and logic.*

## How to Deploy

If you want your own version live,

- Fork and clone this repo
- Push to a GitHub repo
- Enable GitHub Pages in your repo settings
- Open the published link!

## Credits / License

- Made by Max Datskovsky
- Open source ([MIT](LICENSE) or your choice)
