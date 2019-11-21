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

  constructor() {
    setInterval(() => {
      this.what = new Date().toISOString().substr(0, 18) + '0';
      mj.component.detectChanges(this);
    }, 2000);
  }
}

mj.component.define('OtherChild', {
  template: '<div>foo? {{ foo }}</div>'
}, class OtherChild {
  public foo: string = 'bar';
});

mj.log.setLogLevel('debug');
mj.init('root');
