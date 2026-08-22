# Smart To-Do List 📝

A complete, modern, responsive task management web application built with **Vanilla JavaScript (ES6+)**, **HTML5**, **CSS3**, and **Browser Local Storage**. Designed with a glassmorphism theme, dynamic statistics, dark/light mode toggle, search & filtering, priority/category/due date tags, and smooth micro-interactions.

---

## 🌟 Features

- **Add & Manage Tasks**: Add tasks with Priority (**High**, **Medium**, **Low**), Category (**Personal**, **Work**, **Study**, **Other**), and optional Due Date.
- **Input Validation**: Prevents empty tasks and duplicate task titles (case-insensitive) with toast notifications.
- **Task Metadata Badges**: Clear priority badges, category color tags, and due date tags with overdue indicators (`⚠️ Due: [Date]`).
- **Complete Tasks**: Mark tasks as active/completed with a custom animated checkmark checkbox and line-through styling.
- **Edit Tasks**: Accessible modal dialog allowing title, priority, category, and due date updates with validation.
- **Delete Tasks**: Remove individual tasks with smooth slide-out CSS keyframe animations.
- **Real-Time Search**: Search tasks by title as you type with a clear (`x`) button.
- **Filter Tabs**: View **All**, **Active**, or **Completed** tasks with visual pill indicators.
- **Task Statistics**: Dynamic counter cards tracking Total, Active, and Completed tasks in real-time.
- **Bulk Actions**: Clear Completed tasks or Delete All tasks with a confirmation modal prompt.
- **Dark & Light Mode**: Persistent theme switcher with high-contrast CSS variable tokens.
- **Local Storage Persistence**: Auto-saves tasks and theme preference so data survives page reloads and browser restarts.
- **Responsive & Accessible**: Mobile-first design (tested from 320px up to desktop display) with `:focus-visible` outlines, ARIA roles, and keyboard navigation support.

---

## 🛠️ Technologies Used

- **HTML5**: Semantic tags (`<header>`, `<main>`, `<footer>`, `<section>`, `<form>`) and ARIA accessibility attributes.
- **CSS3**: Custom CSS Variables, Glassmorphism backdrop filters, Flexbox, Grid, CSS animations (`@keyframes`), and responsive media queries.
- **Vanilla JavaScript (ES6+)**: ES6 modules/arrow functions, array methods (`map`, `filter`, `find`, `some`), DOM manipulation, and Local Storage API.
- **No External Frameworks**: 100% pure native web technologies.

---

## 📁 Project Structure

```text
todo-app/
├── index.html     # Application HTML5 structure & modals
├── style.css      # Design system, CSS variables & responsive rules
├── script.js      # App state, CRUD logic & Local Storage handlers
├── README.md      # Project documentation
└── .gitignore     # Git ignore rules
```

---

## 🚀 How to Run Locally

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/your-username/smart-todo-app.git
   cd smart-todo-app
   ```

2. **Open in Browser**:
   - Double-click `index.html` to open it directly in any modern web browser (Chrome, Edge, Firefox, Safari).
   - *Optionally*, run a simple local static HTTP server:
     ```bash
     python -m http.server 8000
     # Or using Node.js
     npx serve .
     ```
   - Access at `http://localhost:8000`.

---

## 💾 How Local Storage Works

- **Saving**: Tasks are stored as a JSON string under the key `'smart_todo_tasks'`:
  ```javascript
  localStorage.setItem('smart_todo_tasks', JSON.stringify(tasks));
  ```
- **Loading**: On app launch, `loadTasks()` fetches and parses the data inside a `try...catch` block:
  ```javascript
  const data = JSON.parse(localStorage.getItem('smart_todo_tasks'));
  ```
- **Theme**: User theme preference is preserved separately under `'smart_todo_theme'`.

---

## 💡 Main JavaScript Concepts Demonstrated

1. **DOM Manipulation & XSS Prevention**: Creating elements programmatically with `document.createElement` and using `textContent` for user inputs to prevent HTML injection.
2. **State-Driven Rendering**: Single source of truth array (`tasks`) triggering dynamic UI updates (`render()`).
3. **Array Methods**: Heavy usage of `filter`, `map`, `find`, and `some` for search, filtering, status toggles, and duplicate checking.
4. **Event Delegation & Listeners**: Managing click, submit, input, and keyboard Escape events cleanly.
5. **Modal & Dialog Management**: Custom modal backdrops handling open/close states and backdrop clicks.

---

## 🖼️ Screenshots

*(Add your screenshots here for portfolio presentation)*

| Dark Theme | Light Theme |
| :---: | :---: |
| ![Dark Theme Placeholder](https://via.placeholder.com/600x350/0f172a/ffffff?text=Smart+To-Do+Dark+Mode) | ![Light Theme Placeholder](https://via.placeholder.com/600x350/f8fafc/0f172a?text=Smart+To-Do+Light+Mode) |

---

## 🔮 Future Improvements

- **Drag-and-Drop Reordering**: Manual task sorting via HTML5 Drag & Drop API.
- **Category Filter Dropdown**: Filter task list specifically by Personal, Work, Study, or Other categories.
- **Sub-tasks / Checklists**: Support for nested sub-tasks within a task item.
- **Export & Import JSON**: Backup and restore task data via file download/upload.
- **Progressive Web App (PWA)**: Service Worker and Web App Manifest integration for offline installation.

---

## 👩‍💻 Author

- Built as a modern portfolio/interview project demonstrating clean Vanilla JavaScript architecture.
- License: MIT
