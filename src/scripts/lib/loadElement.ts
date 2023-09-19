/**
 * Asynchronously loads an element with the specified selector within a timeout.
 *
 * @param {string} selector - The CSS selector to locate the element.
 * @param {number} timeout - The maximum time (in milliseconds) to wait for the element to appear.
 * @param {number} interval - The polling interval (in milliseconds) to check for the element.
 * @returns {Promise<HTMLElement>} - A promise that resolves to the loaded element.
 * @throws {Error} - Throws an error if the element is not found within the specified timeout.
 */
const loadElement = async (
  selector: string,
  timeout: number,
  interval: number
): Promise<HTMLElement> => {
  return await new Promise<HTMLElement>((resolve, reject) => {
    const checkInterval = setInterval(() => {
      const element = document.querySelector(selector) as HTMLElement
      if (element !== undefined) {
        clearInterval(checkInterval)
        clearTimeout(checkTimeout)
        resolve(element)
      }
    }, interval)

    const checkTimeout = setTimeout(() => {
      clearInterval(checkInterval)
      reject(new Error(`Element with selector '${selector}' not found within ${timeout}ms.`))
    }, timeout)
  })
}

export default loadElement
