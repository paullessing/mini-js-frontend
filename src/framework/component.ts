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
      const renderer = parseTemplate(element, declaration.config.template);

      // TODO store this somewhere and call again when values change
      renderer(controller);
    }

    function parseTemplate(element: HTMLElement, templateString: string): (controller: any) => void {
      element.innerHTML = templateString;

      // TODO recurse through child nodes and replace components

      const childNodes = element.childNodes;

      const renderNodes = util.toArray(childNodes).map((node, index) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const renderContext = createTextNodeRenderContext(node as Text);
          if (renderContext) {
            return (controller: any) => {
              // TODO change detection?
              const newContent = renderContext(controller);

              const currentNode = element.childNodes.item(index);
              element.replaceChild(newContent, currentNode);
            }
          }
        }
        // TODO handle other node types
        // TODO handle recursion
        return null;
      }).filter(Boolean) as ((controller: any) => void)[];

      return (controller: any) => renderNodes.forEach((renderer) => renderer(controller));
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

        values.push({ name: m[1].trim() });

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
