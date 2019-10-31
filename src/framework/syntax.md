# Plan

# Rendering
```html
<div>{{ someText }}</div>
<div>{{ x ? 'someText' : 'otherText' }}</div>
```
# If statements
```html
<div data-mj-if="someCondition">
  Visible only if someCondition is true
</div>
```
# Controller?
```js
mj.register('ButtonController', function ButtonController() {
  this.onButtonClick = function($event) {
    $event.preventDefault();
  };
});
```
```html
<div data-mj-ctrl="ButtonController">
  <button data-mj-onclick="onButtonClick(event)">Click me</button>
</div>
```
