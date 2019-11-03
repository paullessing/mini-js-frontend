namespace mj.util {
  export function query(selector: string): HTMLElement[] {
    const parts = selector.split(/\s+/g).filter(Boolean);

    if (!parts.length) {
      return [];
    }

    const first = parts.shift()!;
    let searchSpace = findElementsBySelector(document, first);

    while (parts.length) {
      const current = parts.shift()!;
      searchSpace = flatMap(searchSpace.map((element) => findElementsBySelector(element, current)));
    }

    return searchSpace;
  }

  export function findElementsBySelector(parentElement: HTMLElement | Document, elementSelector: string): HTMLElement[] {
    const parts = elementSelector.split(/[.#]/g).filter(Boolean);
    if (!parts.length) {
      return [];
    }
    const first = parts[0];
    let pool: HTMLElement[] = [];
    if (first[0] === '#') {
      const element = document.getElementById(first.slice(1));
      if (element && (parentElement === document || isChild(element, parentElement as HTMLElement))) {
        pool.push(element);
      }
    } else if (first[0] === '.') {
      const matchingElements = parentElement.getElementsByClassName(first.slice(1));
      for (let i = 0; i < matchingElements.length; i++) {
        pool.push(matchingElements[i] as HTMLElement);
      }
    } else {
      const matchingElements = parentElement.getElementsByTagName(first);
      for (let i = 0; i < matchingElements.length; i++) {
        pool.push(matchingElements[i] as HTMLElement);
      }
    }

    for (let i = 1; i < parts.length; i++) {
      pool = pool.filter((element) => is(element, parts[i]))
    }

    return pool;
  }

  function isChild(child: HTMLElement, parent: HTMLElement): boolean {
    let maybeParent: HTMLElement | null = parent;
    while (maybeParent && child !== maybeParent) {
      maybeParent = child.parentElement;
    }
    return child === maybeParent;
  }

  function is(element: HTMLElement, selector: string): boolean {
    switch (selector[0]) {
      case '#': return element.id === selector.slice(1);
      case '.': return hasClassName(element, selector.slice(1));
      default: return element.tagName.toLowerCase() === selector;
    }
  }

  export function hasClassName(element: HTMLElement, className: string): boolean {
    return element.className.split(/\s+/g).indexOf(className) >= 0;
  }

  export function flatMap<T>(arrays: T[][]): T[] {
    return ([] as T[]).concat.apply([], arrays);
  }

  export function toArray<T>(arrayLike: { [index: number]: T }): T[] {
    return [].slice.apply(arrayLike);
  }
}
