/// <reference path="../lib/_index.ts">
/// <reference path="./component.ts">
/// <reference path="./util.ts">

namespace mj {
  export const init = (id: string) => {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error('Unknown element ID: ' + id);
    }

    component.render(element);
  };
}
