export class CookieUtils {
    static setCookie(name, value, days = 365) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        // Remove SameSite=Strict and path=/ to make it work in userscript context
        const cookieString = name + "=" + encodeURIComponent(value) + expires;
        document.cookie = cookieString;
        console.log('Setting cookie:', cookieString);
    }

    static getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        console.log('Getting cookie:', name, 'from document.cookie:', document.cookie);
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
                console.log('Found cookie value:', value);
                return value;
            }
        }
        console.log('Cookie not found:', name);
        return null;
    }

    static deleteCookie(name) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    static setJsonCookie(name, value, days = 365) {
        try {
            const jsonString = JSON.stringify(value);

            // Try localStorage first (more reliable for userscripts)
            try {
                localStorage.setItem(name, jsonString);
                console.log('Saved to localStorage:', name, jsonString);
                return true;
            } catch (localStorageError) {
                console.warn('localStorage failed, trying cookies:', localStorageError);
                this.setCookie(name, jsonString, days);
                return true;
            }
        } catch (error) {
            console.error('Error setting JSON data:', error);
            return false;
        }
    }

    static getJsonCookie(name) {
        try {
            // Try localStorage first
            try {
                const localValue = localStorage.getItem(name);
                if (localValue) {
                    console.log('Retrieved from localStorage:', name, localValue);
                    return JSON.parse(localValue);
                }
            } catch (localStorageError) {
                console.warn('localStorage failed, trying cookies:', localStorageError);
            }

            // Fallback to cookies
            const cookieValue = this.getCookie(name);
            if (cookieValue) {
                console.log('Retrieved from cookies:', name, cookieValue);
                return JSON.parse(cookieValue);
            }
            return null;
        } catch (error) {
            console.error('Error parsing JSON data:', error);
            return null;
        }
    }

    static hasCookie(name) {
        return this.getCookie(name) !== null;
    }

    static listCookies() {
        const cookies = {};
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            const c = ca[i].trim();
            if (c) {
                const eqPos = c.indexOf('=');
                if (eqPos > 0) {
                    const name = c.substring(0, eqPos);
                    const value = decodeURIComponent(c.substring(eqPos + 1));
                    cookies[name] = value;
                }
            }
        }
        return cookies;
    }
}