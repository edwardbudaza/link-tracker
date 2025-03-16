import { customAlphabet } from "nanoid";

// Define an alphabet without ambiguous characters
const alphabet = "23456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Create a URL-safe ID generator
export const generateShortId = (length: number = 7): string => {
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
};

// Validate URL format
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};
