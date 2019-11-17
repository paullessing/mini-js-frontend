/// <reference path="./util.ts" />

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

  type Renderer<T = any> = {
    (component: T): void;
    props: string[];
  };

  type StringKey<T> = string & keyof T;

  export namespace component {
    import unique = mj.util.unique;

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
        });
      }

      recurseThroughElementAndProcessBindings(element);

      // TODO handle change detection

      if (!textRenderers.length) {
        return {
          render: noop,
          children
        };
      }

      const render: Partial<Renderer> = function(controller: any): void {
        textRenderers.forEach((renderer) => renderer(controller))
      };
      render.props = mj.util.flatMap(textRenderers.map(({ props }) => props)).filter(mj.util.unique);

      return {
        render: render as Renderer,
        children,
      };
    }

    function createTextNodeRenderContext<T>(textNode: Text): Renderer<T> | null {
      const text = textNode.data;
      const regex = /\{\{(.*?)\}\}/gm;
      let m;
      let start = 0;

      const values: (string | { name: StringKey<T> })[] = [];

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

        values.push({ name: m[1].trim() as StringKey<T> });

        start += m.index + m[0].length;
      }

      const textAfter = text.slice(start);
      if (textAfter) {
        values.push(textAfter);
      }

      if (!hasRenderText) {
        return null; // Only a single text node
      }

      const renderValues: { ref: Comment, prop: StringKey<T> }[] = [];
      const currentText = [];
      const parent = textNode.parentNode!;
      for (const value of values) {
        if (typeof value === 'string') {
          currentText.push(value);
        } else {
          parent.insertBefore(new Text(currentText.join('')), textNode);
          currentText.splice(0);
          const commentNode = document.createComment('Noderef:' + value.name);
          parent.insertBefore(commentNode, textNode);
          parent.insertBefore(new Text(''), textNode); // Placeholder; will be replaced on render
          renderValues.push({ ref: commentNode, prop: value.name });
        }
      }
      if (currentText.length) {
        parent.insertBefore(new Text(currentText.join('')), textNode);
      }

      parent.removeChild(textNode);

      const render: Partial<Renderer> = function(controller: T): void {
        renderValues.forEach(({ ref, prop }) => {
          const value = '' + controller[prop];
          ref.parentElement!.replaceChild(new Text(value), ref.nextSibling!);
        });
      };
      render.props = renderValues.map(({ prop }) => prop).filter(unique);
      return render as Renderer;
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
namespace noop {
  export const props: string[] = [];
}
