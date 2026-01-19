# AGENTS.md

This file provides guidelines for agentic coding assistants working on this codebase.

## Development Commands

```bash
# Start development server with hot reload
npm start

# Build for production
npm run package

# Create distributables
npm run make

# Note: No test framework is currently configured
```

## Project Structure

- `src/main/` - Electron main process (Node.js)
- `src/preload/` - Preload scripts for context isolation
- `src/renderer/` - Vue 3 renderer process
- `src/renderer/components/` - Vue components
- `src/renderer/App.vue` - Root Vue component

## Technology Stack

- **Framework**: Electron 39 + Vue 3 (Composition API with `<script setup>`)
- **Styling**: Tailwind CSS 3.4
- **Icons**: lucide-vue-next
- **Markdown**: marked (for rendering AI-generated content)
- **Build**: Vite + Electron Forge

## Code Style Guidelines

### Vue Components

- Use `<script setup>` syntax exclusively
- Prefer Composition API over Options API
- Use `defineProps()` and `defineEmits()` for component interfaces
- Import icons from `lucide-vue-next` using named imports
- Use Tailwind utility classes for all styling
- Avoid inline CSS unless necessary (use `<style>` block for component-specific styles)

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { IconName } from 'lucide-vue-next';

const props = defineProps({
  prop: { type: String, required: true }
});

const emit = defineEmits(['update']);
</script>
```

### Imports

- Group imports: Vue first, then third-party, then local components
- Use named imports for icons from `lucide-vue-next`
- No default imports for Vue (use named imports from 'vue')

```javascript
import { ref, computed, watch } from 'vue';
import { ChevronDown, Plus } from 'lucide-vue-next';
import ComponentName from './components/ComponentName.vue';
```

### Naming Conventions

- **Components**: PascalCase (e.g., `MaterialForm.vue`, `ResultDisplay.vue`)
- **Variables/Functions**: camelCase (e.g., `generateMaterial`, `showSettings`)
- **Props/Emits**: kebab-case in templates, camelCase in JS
- **Constants**: UPPER_SNAKE_CASE (rarely used, prefer const with meaningful names)
- **Files**: kebab-case for utilities, PascalCase for components

### State Management

- Use `ref()` for primitive values and objects that need reactivity
- Use `computed()` for derived state
- Use `watch()` for side effects and watching changes
- For local state within components, create reactive refs from props when needed

```javascript
const localState = ref(props.initialValue);
const computedValue = computed(() => localState.value * 2);

watch(localState, (newValue) => {
  emit('update', newValue);
});
```

### Error Handling

- Always wrap async operations in try-catch blocks
- Return error objects with `{ success: false, error: string }` pattern for API calls
- Display user-friendly error messages in the UI
- Log errors to console for debugging

```javascript
async function generateMaterial() {
  try {
    const result = await apiCall();
    return { success: true, data: result };
  } catch (error) {
    console.error('Generation failed:', error);
    return { success: false, error: error.message };
  }
}
```

### Electron IPC

- Use `ipcMain.handle()` in main process for async handlers
- Use `contextBridge.exposeInMainWorld()` in preload script
- Access via `window.electronAPI` in renderer
- Return standardized response objects: `{ success: boolean, data?: any, error?: string }`

```javascript
// Main process
ipcMain.handle('operation-name', async (event, data) => {
  try {
    const result = await performOperation(data);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Renderer
const api = await window.electronAPI.operationName(data);
```

### Styling with Tailwind

- Use semantic color scales (blue-50, gray-200, etc.)
- Apply `rounded-lg` for cards, `rounded-full` for badges
- Use `flex`, `flex-col`, `flex-1` for layouts
- Add `overflow-hidden` to prevent scroll issues
- Use `transition-colors` for smooth UI transitions
- Apply `hover:` states for interactive elements

```html
<div class="bg-white rounded-lg border border-gray-200 p-4">
  <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
    Button
  </button>
</div>
```

### Data Persistence

- Use `localStorage` for simple key-value storage (settings, sessions)
- Store as JSON strings: `JSON.stringify()` / `JSON.parse()`
- Keys: `'aiSettings'`, `'sessions'`
- Always check for null/undefined when reading from storage

```javascript
function loadSettings() {
  const saved = localStorage.getItem('aiSettings');
  if (saved) {
    return JSON.parse(saved);
  }
  return defaultSettings;
}
```

### Accessibility

- Add `aria-label` to icon-only buttons
- Use semantic HTML (nav, main, section, etc.)
- Provide visible focus states (Tailwind's `focus:ring-*`)
- Include descriptive alt text for images (if any)
- Use proper form labels with `for` attribute

### Performance

- Use `v-show` for frequent toggling, `v-if` for rare toggling
- Add `:key` for `v-for` loops (use unique IDs)
- Debounce expensive operations when needed
- Use `field-sizing: content` for auto-resizing textareas

## Component Guidelines

### File Organization

- Keep components under 300 lines if possible
- Split complex components into smaller sub-components
- Group related functionality together
- Use descriptive file names

### Props Definition

- Always define prop types using `defineProps()`
- Mark required props explicitly
- Provide sensible defaults when possible

```javascript
const props = defineProps({
  title: { type: String, required: true },
  items: { type: Array, default: () => [] },
});
```

### Emits

- Document all events a component emits
- Use kebab-case for event names
- Emit data only when necessary

## Testing

- No test framework is currently configured
- Manually test by running `npm start`
- Test both light/dark modes (if applicable)
- Verify Electron window behavior on different screen sizes

## Common Patterns

### Modal/Dialog
- Fixed overlay with z-index > 50
- Click outside to close (using `@click.self`)
- Esc key to close (implement via keydown listener)

### Form Input
- Use `v-model` for two-way binding
- Add `@input` handlers for immediate feedback
- Show validation errors below inputs
- Disable submit button when form is invalid

### Loading States
- Show loading spinner or skeleton UI
- Disable buttons during async operations
- Provide visual feedback for long-running operations

## When Modifying This Project

1. Maintain consistency with existing code style
2. Add comments only for complex logic
3. Prefer clarity over cleverness
4. Test changes by running `npm start`
5. Check for TypeScript errors if using type hints
6. Ensure Electron main process security (contextIsolation: true, nodeIntegration: false)
