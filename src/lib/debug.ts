// src/lib/debug.ts
export function debugJSON(data: any, context: string) {
  console.log(`DEBUG [${context}]:`);
  try {
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error stringifying:', error);
    console.log('Original data:', data);
  }
}

export function logDataType(data: any, label: string) {
  console.log(`TYPE [${label}]:`, typeof data);
  if (typeof data === 'object') {
    console.log(`KEYS [${label}]:`, Object.keys(data));
  } else if (typeof data === 'string') {
    console.log(`STRING LENGTH [${label}]:`, data.length);
    console.log(`STRING FIRST 100 CHARS [${label}]:`, data.substring(0, 100));
  }
}

// Nouvelle fonction ajoutée
export function isJsonString(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}