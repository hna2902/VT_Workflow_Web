export const setUserStorage = (key, value) => {
    localStorage.setItem(key, value);
    sessionStorage.setItem(key, value);
};

export const setSessionStorage = (key, value) => {
    sessionStorage.setItem(key, value);
};

export const getUserStorage = (key, defaultValue) => {
    return sessionStorage.getItem(key) || localStorage.getItem(key) || defaultValue;
};

export const getSessionStorage = (key, defaultValue) => {
    return sessionStorage.getItem(key) || defaultValue;
};

export const removeStorage = (key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
};

export const removeSessionStorage = (key) => {
    sessionStorage.removeItem(key);
};