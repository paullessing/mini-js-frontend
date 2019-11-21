/// <reference path="../dist/mini.d.ts" />

@mj.Component({
  template: `
  Hello {{ who }}
  <button>Click Me</button>
  <div data-mj-cmp="Child"></div>
  <div data-mj-cmp="OtherChild"></div>
  `
})
class Root {
  public who: string = 'All of you';
}

@mj.Component({
  template: `
  <div style="color: red">I am a {{ what }} component</div>
  `,
})
class Child {
  public what: string = 'child';
}

mj.component.define('OtherChild', {
  template: '<div>foo? {{ foo }}</div>'
}, class OtherChild {
  public foo: string = 'bar';
});

mj.init('root');
