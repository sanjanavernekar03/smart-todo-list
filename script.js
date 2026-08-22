/**
 * Smart To-Do List Application
 * Modern Vanilla JavaScript (ES6+) Implementation
 */

// ==========================================================================
// 1. Application State & Constants
// ==========================================================================
const STORAGE_KEY_TASKS = 'smart_todo_tasks';
const STORAGE_KEY_THEME = 'smart_todo_theme';

let tasks = [];
let currentFilter = 'all';
let searchQuery = '';
let editingTaskId = null;

// DOM Elements
const taskTitleInput = document.getElementById('taskTitleInput');
const taskPrioritySelect = document.getElementById('taskPrioritySelect');
const taskCategorySelect = document.getElementById('taskCategorySelect');
const taskDueDateInput = document.getElementById('taskDueDateInput');
const addTaskForm = document.getElementById('addTaskForm');
const taskList = document.getElementById('taskList');

const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

const totalCountEl = document.getElementById('totalCount');
const activeCountEl = document.getElementById('activeCount');
const completedCountEl = document.getElementById('completedCount');

const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const emptyState = document.getElementById('emptyState');
const emptyStateTitle = document.getElementById('emptyStateTitle');
const emptyStateSubtitle = document.getElementById('emptyStateSubtitle');
const toastContainer = document.getElementById('toastContainer');

// Modal Elements
const editModal = document.getElementById('editModal');
const editTaskForm = document.getElementById('editTaskForm');
const editTaskTitleInput = document.getElementById('editTaskTitleInput');
const editTaskPrioritySelect = document.getElementById('editTaskPrioritySelect');
const editTaskCategorySelect = document.getElementById('editTaskCategorySelect');
const editTaskDueDateInput = document.getElementById('editTaskDueDateInput');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const confirmModal = document.getElementById('confirmModal');
const closeConfirmModalBtn = document.getElementById('closeConfirmModalBtn');
const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
const proceedConfirmBtn = document.getElementById('proceedConfirmBtn');


// ==========================================================================
// 2. Initialization & Event Listeners
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadTasks();
  setupEventListeners();
  render();
});

/**
 * Attaches all main DOM event listeners
 */
function setupEventListeners() {
  // Add Task Form submission
  addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleAddTask();
  });

  // Search input & clear button
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.hidden = searchQuery.trim() === '';
    render();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.hidden = true;
    searchInput.focus();
    render();
  });

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  // Bottom action buttons
  clearCompletedBtn.addEventListener('click', handleClearCompleted);
  deleteAllBtn.addEventListener('click', openConfirmModal);

  // Theme toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Edit Modal controls
  closeEditModalBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);
  editTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSaveEdit();
  });

  // Confirmation Modal controls
  closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
  cancelConfirmBtn.addEventListener('click', closeConfirmModal);
  proceedConfirmBtn.addEventListener('click', handleDeleteAll);

  // Close modals on backdrop click or Escape key
  window.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
    if (e.target === confirmModal) closeConfirmModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEditModal();
      closeConfirmModal();
    }
  });
}


// ==========================================================================
// 3. Local Storage Handling
// ==========================================================================

/**
 * Loads tasks array from Local Storage safely
 */
function loadTasks() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY_TASKS);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        // Guarantee all loaded task objects match full schema with fallbacks
        tasks = parsed.map(t => ({
          id: t.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: t.title || 'Untitled Task',
          completed: Boolean(t.completed),
          priority: t.priority || 'medium',
          category: t.category || 'Personal',
          dueDate: t.dueDate || '',
          createdAt: t.createdAt || Date.now()
        }));
      } else {
        tasks = [];
      }
    } else {
      // Pre-populate with initial friendly sample tasks if first time
      tasks = [
        {
          id: 'task_init_1',
          title: 'Learn Vanilla JavaScript ES6+',
          completed: true,
          priority: 'high',
          category: 'Study',
          dueDate: '',
          createdAt: Date.now() - 86400000
        },
        {
          id: 'task_init_2',
          title: 'Build a Portfolio Project',
          completed: false,
          priority: 'medium',
          category: 'Work',
          dueDate: getTodayDateString(),
          createdAt: Date.now()
        }
      ];
      saveTasks();
    }
  } catch (error) {
    console.error('Error loading tasks from LocalStorage:', error);
    showToast('Failed to load saved tasks. Resetting stored data.', 'error');
    tasks = [];
  }
}

/**
 * Saves current tasks array to Local Storage
 */
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to LocalStorage:', error);
    showToast('Could not save tasks to Local Storage.', 'error');
  }
}


// ==========================================================================
// 4. CRUD Task Operations
// ==========================================================================

/**
 * Handles adding a new task with validation
 */
function handleAddTask() {
  const title = taskTitleInput.value.trim();
  const priority = taskPrioritySelect.value;
  const category = taskCategorySelect.value;
  const dueDate = taskDueDateInput.value;

  // Validation 1: Prevent Empty Task
  if (!title) {
    showToast('Please enter a task title!', 'error');
    taskTitleInput.focus();
    return;
  }

  // Validation 2: Prevent Duplicate Tasks (case-insensitive check)
  const isDuplicate = tasks.some(
    t => t.title.trim().toLowerCase() === title.toLowerCase()
  );
  if (isDuplicate) {
    showToast('A task with this title already exists!', 'error');
    taskTitleInput.focus();
    return;
  }

  // Construct Task Object
  const newTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: title,
    completed: false,
    priority: priority,
    category: category,
    dueDate: dueDate,
    createdAt: Date.now()
  };

  tasks.unshift(newTask); // Place new task at the top
  saveTasks();

  // Reset Input Form
  taskTitleInput.value = '';
  taskDueDateInput.value = '';
  taskPrioritySelect.value = 'medium';
  taskCategorySelect.value = 'Personal';

  render();
  showToast('Task added successfully!', 'success');
}

/**
 * Toggles completion status of a task by ID
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveTasks();
  render();

  if (task.completed) {
    showToast('Task marked as completed! 🎉', 'info');
  }
}

/**
 * Prepares and opens the edit modal for a task
 */
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingTaskId = id;
  editTaskTitleInput.value = task.title;
  editTaskPrioritySelect.value = task.priority || 'medium';
  editTaskCategorySelect.value = task.category || 'Personal';
  editTaskDueDateInput.value = task.dueDate || '';

  editModal.classList.remove('hidden');
  editTaskTitleInput.focus();
}

/**
 * Closes edit modal and clears editing state
 */
function closeEditModal() {
  editModal.classList.add('hidden');
  editingTaskId = null;
}

/**
 * Saves edited task details with validation
 */
function handleSaveEdit() {
  if (!editingTaskId) return;

  const newTitle = editTaskTitleInput.value.trim();
  const newPriority = editTaskPrioritySelect.value;
  const newCategory = editTaskCategorySelect.value;
  const newDueDate = editTaskDueDateInput.value;

  // Validation 1: Prevent Empty Title
  if (!newTitle) {
    showToast('Task title cannot be empty!', 'error');
    editTaskTitleInput.focus();
    return;
  }

  // Validation 2: Prevent Duplicate Titles (excluding the task being edited)
  const isDuplicate = tasks.some(
    t => t.id !== editingTaskId && t.title.trim().toLowerCase() === newTitle.toLowerCase()
  );
  if (isDuplicate) {
    showToast('Another task already has this title!', 'error');
    editTaskTitleInput.focus();
    return;
  }

  const task = tasks.find(t => t.id === editingTaskId);
  if (task) {
    task.title = newTitle;
    task.priority = newPriority;
    task.category = newCategory;
    task.dueDate = newDueDate;

    saveTasks();
    render();
    closeEditModal();
    showToast('Task updated successfully!', 'success');
  }
}

/**
 * Deletes a single task by ID with slide-out animation
 */
function deleteTask(id) {
  const taskElement = document.querySelector(`[data-id="${id}"]`);
  // Update state and storage immediately
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();

  if (taskElement) {
    taskElement.classList.add('removing');
    setTimeout(() => {
      render();
      showToast('Task deleted.', 'info');
    }, 250);
  } else {
    render();
    showToast('Task deleted.', 'info');
  }
}

/**
 * Clears all completed tasks
 */
function handleClearCompleted() {
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount === 0) {
    showToast('No completed tasks to clear.', 'info');
    return;
  }

  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
  showToast(`Cleared ${completedCount} completed task(s).`, 'success');
}

/**
 * Opens confirm modal for deleting all tasks
 */
function openConfirmModal() {
  if (tasks.length === 0) {
    showToast('No tasks to delete.', 'info');
    return;
  }
  confirmModal.classList.remove('hidden');
}

/**
 * Closes confirmation modal
 */
function closeConfirmModal() {
  confirmModal.classList.add('hidden');
}

/**
 * Deletes all tasks after confirmation
 */
function handleDeleteAll() {
  tasks = [];
  saveTasks();
  closeConfirmModal();
  render();
  showToast('All tasks deleted.', 'info');
}


// ==========================================================================
// 5. Filtering, Search & Dynamic Rendering
// ==========================================================================

/**
 * Returns filtered tasks based on filter mode & search query
 */
function getFilteredTasks() {
  return tasks.filter(task => {
    // Filter by tab (All / Active / Completed)
    const matchesFilter =
      currentFilter === 'all' ? true :
        currentFilter === 'active' ? !task.completed :
          currentFilter === 'completed' ? task.completed : true;

    // Filter by search query (title matching)
    const cleanQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = cleanQuery === '' ? true : task.title.toLowerCase().includes(cleanQuery);

    return matchesFilter && matchesSearch;
  });
}

/**
 * Main Render method: updates DOM task list, stats, and empty states
 */
function render() {
  updateStats();
  renderTaskList();
}

/**
 * Renders task elements safely to prevent XSS
 */
function renderTaskList() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = '';

  if (filteredTasks.length === 0) {
    emptyState.classList.remove('hidden');
    if (tasks.length === 0) {
      emptyStateTitle.textContent = 'No tasks yet';
      emptyStateSubtitle.textContent = 'Add your first task to get started.';
    } else {
      emptyStateTitle.textContent = 'No matching tasks found.';
      emptyStateSubtitle.textContent = 'Try adjusting your search query or switching filters.';
    }
    return;
  }

  emptyState.classList.add('hidden');

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.setAttribute('data-id', task.id);

    // 1. Checkbox wrapper
    const checkboxWrapper = document.createElement('label');
    checkboxWrapper.className = 'checkbox-wrapper';
    checkboxWrapper.setAttribute('title', task.completed ? 'Mark as active' : 'Mark as completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'active' : 'completed'}`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const checkmarkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    checkmarkSvg.setAttribute('class', 'checkmark-icon');
    checkmarkSvg.setAttribute('width', '14');
    checkmarkSvg.setAttribute('height', '14');
    checkmarkSvg.setAttribute('viewBox', '0 0 24 24');
    checkmarkSvg.setAttribute('fill', 'none');
    checkmarkSvg.setAttribute('stroke', 'currentColor');
    checkmarkSvg.setAttribute('stroke-width', '3');
    checkmarkSvg.setAttribute('stroke-linecap', 'round');
    checkmarkSvg.setAttribute('stroke-linejoin', 'round');

    const checkmarkPolyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    checkmarkPolyline.setAttribute('points', '20 6 9 17 4 12');
    checkmarkSvg.appendChild(checkmarkPolyline);

    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(checkmarkSvg);

    // 2. Task Content (Title & Badges)
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';

    const taskTitle = document.createElement('span');
    taskTitle.className = 'task-title';
    taskTitle.textContent = task.title; // Safe textContent to prevent unsafe innerHTML

    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'task-tags';

    // Priority Badge
    const prioBadge = document.createElement('span');
    prioBadge.className = `badge badge-priority-${task.priority || 'medium'}`;
    prioBadge.textContent = (task.priority || 'medium');
    tagsDiv.appendChild(prioBadge);

    // Category Badge
    if (task.category) {
      const catBadge = document.createElement('span');
      catBadge.className = 'badge badge-category';
      catBadge.setAttribute('data-category', task.category);
      catBadge.textContent = task.category;
      tagsDiv.appendChild(catBadge);
    }

    // Due Date & Overdue Indicator Badge
    if (task.dueDate) {
      const dueBadge = document.createElement('span');
      const overdue = isOverdue(task.dueDate, task.completed);
      dueBadge.className = `badge badge-due-date ${overdue ? 'overdue' : ''}`;

      const formattedDate = formatDate(task.dueDate);
      dueBadge.textContent = overdue ? `⚠️ Due: ${formattedDate}` : `📅 ${formattedDate}`;
      tagsDiv.appendChild(dueBadge);
    }

    taskContent.appendChild(taskTitle);
    taskContent.appendChild(tagsDiv);

    // 3. Action Buttons (Edit & Delete)
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';

    // Edit Button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'icon-btn icon-btn-edit';
    editBtn.setAttribute('title', 'Edit task');
    editBtn.setAttribute('aria-label', `Edit task "${task.title}"`);
    editBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    `;
    editBtn.addEventListener('click', () => openEditModal(task.id));

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'icon-btn icon-btn-delete';
    deleteBtn.setAttribute('title', 'Delete task');
    deleteBtn.setAttribute('aria-label', `Delete task "${task.title}"`);
    deleteBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    `;
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    taskActions.appendChild(editBtn);
    taskActions.appendChild(deleteBtn);

    // Assemble Item
    li.appendChild(checkboxWrapper);
    li.appendChild(taskContent);
    li.appendChild(taskActions);

    taskList.appendChild(li);
  });
}

/**
 * Recalculates and updates task counters and button disabled states
 */
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;

  totalCountEl.textContent = total;
  activeCountEl.textContent = active;
  completedCountEl.textContent = completed;

  // Toggle footer action state & accessibility attributes
  clearCompletedBtn.disabled = completed === 0;
  clearCompletedBtn.style.opacity = completed === 0 ? '0.5' : '1';
  clearCompletedBtn.style.pointerEvents = completed === 0 ? 'none' : 'auto';

  deleteAllBtn.disabled = total === 0;
  deleteAllBtn.style.opacity = total === 0 ? '0.5' : '1';
  deleteAllBtn.style.pointerEvents = total === 0 ? 'none' : 'auto';
}


// ==========================================================================
// 6. Theme Switcher (Dark / Light Mode)
// ==========================================================================

/**
 * Initializes saved theme from LocalStorage
 */
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

/**
 * Toggles between Dark and Light mode
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
  showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} mode`, 'info');
}


// ==========================================================================
// 7. Helper & Utility Functions
// ==========================================================================

/**
 * Displays user-friendly Toast Notification
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';

  toast.innerHTML = `<span>${iconSvg}</span> <span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  }, 3000);
}

/**
 * Helper to check if a due date is in the past for an active task
 */
function isOverdue(dueDateString, isCompleted) {
  if (!dueDateString || isCompleted) return false;
  const today = getTodayDateString();
  return dueDateString < today;
}

/**
 * Helper to get local YYYY-MM-DD date string
 */
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats YYYY-MM-DD into a friendly date format (e.g. "Aug 25, 2026")
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Basic HTML escaping helper for text insertion inside toasts
 */
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
