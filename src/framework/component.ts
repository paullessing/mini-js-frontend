namespace mj {
  type Constructor<T = any> = new () => T;

  interface ComponentDeclaration {
    name: string;
    config: component.Config;
    constructorFn: Constructor;
  }
  const componentRegistry: { [name: string]: ComponentDeclaration } = {};

  type ComponentInstance<T = any> = {
    constructorFn: Constructor<T>;
    controller: T;
    element: HTMLElement;
    render: Renderer<T>;
    parent: ComponentInstance | null;
    children: ComponentInstance[];
    // TODO store bindings for render and children, so that we can run change detection and only rerender on change
  }

  type Renderer<T = any> = (component: T) => void;

  export namespace component {
    export interface Config {
      template: string;
    }

    export function createComponent(element: HTMLElement): ComponentInstance {
      const componentName = element.dataset.mjCmp;
      if (!componentName || !componentRegistry[componentName]) {
        throw new Error('Component not found: ' + componentName);
      }

      const { constructorFn, config } = componentRegistry[componentName];
      const controller = new constructorFn();

      const { render, children } = parseTemplate(element, config.template);

      const component: ComponentInstance = {
        element,
        constructorFn,
        controller,
        render,
        parent: null,
        children,
      };

      // TODO is this necessary?
      children.forEach((child) => child.parent = component);

      // TODO store this somewhere and call again when values change
      render(controller);

      return component;
    }

    /**
     * Parses the given HTML template, inserts it into the given HTML element, and returns a render context
     * @param element
     * @param templateString
     * @return {
     *   render: Callback to render this specific element's content (not recursive)
     *   children: List of child Component Instances inside this element
     * }
     */
    function parseTemplate(element: HTMLElement, templateString: string): { render: Renderer, children: ComponentInstance[] } {
      element.innerHTML = templateString;

      // TODO recurse through child nodes and replace components

      const textRenderers: Renderer[] = [];
      const children: ComponentInstance[] = [];

      function recurseThroughElementAndProcessBindings(element: HTMLElement): void {
        const childNodes = element.childNodes;

        util.toArray(childNodes).forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const renderer = createTextNodeRenderContext(node as Text);
            if (renderer) {
              textRenderers.push(renderer);
            }
          } else if (isElementNode(node)) {
            if (node.dataset.mjCmp) {
              const child = createComponent(node);
              children.push(child);
            } else {
              recurseThroughElementAndProcessBindings(node);
            }
          }
          // TODO handle other node types
          // TODO handle recursion
        });
      }

      recurseThroughElementAndProcessBindings(element);

      const render = textRenderers.length ? (controller: any) => textRenderers.forEach((renderer) => renderer(controller)) : noop;

      return {
        render,
        children,
      };
    }

    function createTextNodeRenderContext(textNode: Text): ((controller: any) => void) | null {
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

      const namedValues = values.filter((value) => value.hasOwnProperty('name')) as { name: string }[];
      const ref = document.createComment('Noderef:' + namedValues.map(({ name }) => name).join());
      textNode.parentElement!.insertBefore(ref, textNode);

      return (controller: any): void => {
        const text = values.map((value) => typeof value === 'string' ? value : controller[value.name]).join('');
        const newNode = new Text(text);

        ref.parentNode!.replaceChild(newNode, ref.nextSibling!);
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

function isElementNode(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE;
}

function noop() {}
