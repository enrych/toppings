import { type Nullable } from "../../types";

/**
 * Asynchronously loads an element with the specified selector within a timeout.
 *
 * @param {string} selector - The CSS selector to locate the element.
 * @param {number} timeout - The maximum time (in milliseconds) to wait for the element to appear.
 * @param {number} interval - The polling interval (in milliseconds) to check for the element.
 * @returns {Promise<HTMLElement>} - A promise that resolves to the loaded element.
 * @throws {Error} - Throws an error if the element is not found within the specified timeout (in development mode).
 */
const loadElement = async (
  selector: string,
  timeout: number,
  interval: number,
): Promise<Nullable<HTMLElement>> => {
  return await new Promise<Nullable<HTMLElement>>((resolve, reject) => {
    const checkInterval = setInterval(() => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element !== null) {
        clearInterval(checkInterval);
        clearTimeout(checkTimeout);
        resolve(element);
      }
    }, interval);

    const checkTimeout = setTimeout(() => {
      clearInterval(checkInterval);
      if (process.env.NODE_ENV === "development") {
        const errorMessage = `Element with selector '${selector}' not found within ${timeout}ms.`;
        console.warn(errorMessage);
      }
      resolve(null);
    }, timeout);
  });
};

export default loadElement;
