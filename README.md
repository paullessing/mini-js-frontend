# mini-js-frontend
Minimal and simple JS framework for really basic browsers.

## Initialisation
```html
<div class="root"></div>
```
Call `init` with the ID of the root element to initialise.
```js
mj.init('root');
```

## Declaration of components
There are two ways of declaring a component: Via a decorator, or imperatively.

### Declaring via a decorator
```typescript
@mj.Component({
  template: `
  <button class="fancy">
    {{ name }}
  </button>
  `
})
class FancyButton {
  public name: string = 'Click Me!';
}
```
The component will be identified by the name of the class.

### Declaring imperatively
```js
function FancyButton() {
  this.name = 'Click Me!';
}

mj.component.define('FancyButton', {
  template: `
  <button class="fancy">
    {{ name }}
  </button>
  `
}, FancyButton)
```

## Binding values
To bind string values into the template, use the `{{ value }}` syntax:
```html
<button>{{ name }}</button>
```
```typescript
class Button {
  public name: string;
}
```
The value inside the curly braces must be a property name on the corresponding controller.
