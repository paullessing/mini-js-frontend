/// <reference path="../dist/mini.d.ts" />

@mj.Component({
  template: `
  Hello {{ who }}
  <button>Click Me</button>
  `
})
class Root {
  public who: string = 'All of you';
}

mj.init('root');
