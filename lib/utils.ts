// Type definitions for ClassValue
type ClassValue = 
  | string 
  | number 
  | bigint 
  | null 
  | boolean 
  | undefined 
  | ClassValue[] 
  | Record<string, any>;

/**
 * Simple class name utility function
 * Works without external dependencies for better web bundling compatibility
 */
function clsx(...inputs: ClassValue[]): string {
  let str = '';
  let i = 0;
  let tmp: any;
  let x: any;

  while (i < inputs.length) {
    if ((tmp = inputs[i++])) {
      if ((x = typeof tmp === 'string' || typeof tmp === 'number' || typeof tmp === 'bigint')) {
        str && (str += ' ');
        str += tmp;
      } else if (Array.isArray(tmp)) {
        tmp = clsx(...tmp);
        if (tmp) {
          str && (str += ' ');
          str += tmp;
        }
      } else if (typeof tmp === 'object') {
        for (let k in tmp) {
          if (tmp[k]) {
            str && (str += ' ');
            str += k;
          }
        }
      }
    }
  }
  return str;
}

/**
 * Utility function to combine class names
 * Compatible with both web and native platforms
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}

