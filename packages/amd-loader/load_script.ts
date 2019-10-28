/** Load the script at a given URL (for its side-effects) and resolve when
 * complete (which will occur synchronously after the script has been executed).
 * Temporarily adds a script element to the document head. */
export const load_script = (url: string, doc = document): Promise<void> =>
  new Promise((resolve, reject) => {
    const script = doc.createElement("script");
    script.async = true;
    script.src = url;
    const remove = () => script.parentNode.removeChild(script);
    script.onload = () => (remove(), resolve());
    script.onerror = error => (remove(), reject(error));
    doc.head.appendChild(script);
  });
