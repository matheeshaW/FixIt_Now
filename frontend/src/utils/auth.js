export function getToken() {
	return localStorage.getItem('token') || '';
}

export function parseJwt(token) {
	try {
		const base64Url = token.split('.')[1];
		if (!base64Url) return null;
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));
		return JSON.parse(jsonPayload);
	} catch (e) {
		return null;
	}
}

export function getRole() {
	const token = getToken();
	if (!token) return '';
	const payload = parseJwt(token);
	return payload?.role || '';
}

export function isLoggedIn() {
	return Boolean(getToken());
}

export function logout() {
	localStorage.removeItem('token');
}


