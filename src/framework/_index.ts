/// <reference path="../lib/_index.ts">
/// <reference path="./util.ts">
/// <reference path="./component.ts">

namespace mj {
  export const init = (id: string) => {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error('Unknown element ID: ' + id);
    }

    const cmp = component.createComponent(element);

    console.log(cmp);
  };
}
