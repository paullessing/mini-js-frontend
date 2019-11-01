namespace mj {
  interface ComponentDeclaration {
    name: string;
    config: component.Config;
    constructorFn: new () => any;
  }
  const componentRegistry: { [name: string]: ComponentDeclaration } = {};

  export namespace component {
    export interface Config {
      template: string;
    }

    export function render(element: HTMLElement): void {
      const componentName = element.dataset.mjCmp;
      if (!componentName || !componentRegistry[componentName]) {
        throw new Error('Component not found: ' + componentName);
      }

      const declaration = componentRegistry[componentName];

      const controller = new declaration.constructorFn();
      parseTemplate(controller, element, declaration.config.template);
    }

    function parseTemplate(controller: any, element: HTMLElement, templateString: string): void {
      element.innerHTML = templateString;

      // TODO recurse through child nodes and replace components

      const childNodes = element.childNodes;
      childNodes.forEach((childNode) => {
        if (childNode.nodeType === Node.TEXT_NODE) {
          const renderContext = createTextNodeRenderContext(childNode as Text);
          if (renderContext) {
            // Attach somehow, rendering whenever it changes
          }
        }
      });
    }

    function createTextNodeRenderContext(textNode: Text): ((controller: any) => Text) | null {
      const text = textNode.data;
      const regex = /\{\{(.*?)\}\}/gm;
      let m;
      let start = 0;

      const values: (string | { name: string })[] = [];

      let hasRenderText = false;
      while ((m = regex.exec(text)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        hasRenderText = true;

        // m[0] = {{foo}}
        // m[1] = foo
        // m.index = start of this string inside text

        const textBefore = text.slice(start, m.index);
        if (textBefore) {
          values.push(textBefore)
        }

        values.push({ name: m[1] });

        start += m.index + m[0].length;
      }

      const textAfter = text.slice(start);
      if (textAfter) {
        values.push(textAfter);
      }

      if (!hasRenderText) {
        return null; // Only a single text node
      }

      return (controller: any) => {
        const text = values.map((value) => typeof value === 'string' ? value : controller[value.name]).join('');
        return new Text(text);
      };
    }
  }

  export function Component(config: component.Config): ClassDecorator {
    return (target: any): void => {
      const name = target.name;
      componentRegistry[name] = {
        name, config, constructorFn: target
      };
    };
  }
}
