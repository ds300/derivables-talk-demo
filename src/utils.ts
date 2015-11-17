function _assign (obja, objb) {
  for (let key of Object.keys(objb)) {
    obja[key] = objb[key];
  }
  return obja;
}

/**
 * Object.assign polyfill
 */
export function assign<A>(obj: A, ...args): A;
export function assign(...args) {
  return args.reduce(_assign);
}

/**
 * Lets us use JSX to render DOM nodes
 */
export const React = {
  createElement: (tag, props={}, ...children): HTMLElement => {
    const result = document.createElement(tag);
    assign(result, props);
    function render(children) {
      if (children instanceof Array) {
        children.forEach(render);
      } else if (children instanceof HTMLElement) {
        result.appendChild(children);
      } else if (children != null) {
        result.appendChild(document.createTextNode(children.toString()));
      }
    }
    render(children);
    return result;
  }
};

/**
 * Math helpers
 */
export const add = (a, b) => a + b
export const sub = (a, b) => a - b
export const mul = (a, b) => a * b
export const divide = (a, b) => a / b;

/**
 * Pixel unit helper
 */
export const px = v => v + "px";
