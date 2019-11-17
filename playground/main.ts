/// <reference path="../dist/mini.d.ts" />

@mj.Component({
  template: `
  Hello {{ who }}
  <button>Click Me</button>
  <div data-mj-cmp="Child"></div>
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

mj.init('root');
