# Router.js
Manage your routes on the front-end with friendly links, dynamically requesting content and generating browsing histories if necessary

## What is
An ES6 class that uses history.pushState() or history.replaceState(), to generate routes and histories, along with fetch(), to load its assets (js, css and html) dynamically, ordered and asynchronously

## Interfaces
```javascript
// Constructor
Router()
```

```typescript
// Methods
load({
    append = true,
    fragments = [],
    scripts = [],
    selector = '',
    styles = [],
    title = ''
}: {
    append?: boolean,
    fragments?: string | string[],
    scripts?: string | string[],
    selector?: string,
    styles?: string | string[],
    title?: string
}): Promise<{ fragments: PromiseSettledResult<any>[]; scripts: PromiseSettledResult<any>[]; styles: PromiseSettledResult<any>[]; }>

redirect({
    append = false,
    fragments = [],
    path = '',
    scripts = [],
    selector = '',
    styles = [],
    title = document.title
}: {
    append?: boolean,
    fragments?: string | string[],
    path?: string,
    scripts?: string | string[],
    selector?: string,
    styles?: string | string[],
    title?: string
}): Promise<{ fragments: PromiseSettledResult<any>[]; scripts: PromiseSettledResult<any>[]; styles: PromiseSettledResult<any>[]; }>
```