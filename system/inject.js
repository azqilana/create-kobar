export function injectData(htmlString, data) {
  const doc = new DOMParser().parseFromString(htmlString, "text/html");

  doc.querySelectorAll("*").forEach((el) => {
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith("this-data-")) {
        const attrName = attr.name.slice("this-data-".length);
        const key = attr.value;
        if (key in data) {
          el.setAttribute(attrName, data[key]);
        }
        el.removeAttribute(attr.name);
      }
    }
  });

  doc.querySelectorAll("[this-data]").forEach((el) => {
    const key = el.getAttribute("this-data");
    if (!(key in data)) return;
    if (el.tagName.toLowerCase() === "meta") {
      const temp = document.createElement("template");
      temp.innerHTML = data[key];
      el.replaceWith(temp.content.cloneNode(true));
    } else {
      el.removeAttribute("this-data");
      el.setAttribute(`data-${key}`, data[key]);
    }
  });

  return doc.body.innerHTML;
}
