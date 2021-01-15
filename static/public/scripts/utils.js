export function cloneTemplateIntoParent(template, parent, sibling) {
  return sibling
    ? parent.insertBefore(template.content.cloneNode(true), sibling)
    : parent.appendChild(template.content.cloneNode(true));
}

export function makeModalWindowsInvisible() {
  document.body
    .querySelectorAll("modal-window")
    .forEach((modalWindow) => modalWindow.removeAttribute("is-visible"));
}

export function findElementInEventPath(event, selector) {
  function predicate(eventTarget, selector) {
    if (eventTarget instanceof HTMLElement) {
      return eventTarget.matches(selector);
    } else return false;
  }
  const foundElement = event
    .composedPath()
    .find((eventTarget) => predicate(eventTarget, selector));
  return foundElement ? foundElement : null;
}
