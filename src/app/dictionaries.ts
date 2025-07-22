const dictionaries = {
  en: () => {},
  be: () => import('./be.json').then((module) => module.default),
}
 
export const getLangFromHeaders = (): "en" | "be" => {
  // Example logic, adjust as needed:
  // return Array.from(navigator.languages).some(lang => lang.includes("be")) ? "be" : "en";
  return "be";
};

export const getDictionary = async (locale: 'en' | 'be') =>
  dictionaries[locale]();

export const lang = getLangFromHeaders();
export const dict = await getDictionary(lang) as unknown;