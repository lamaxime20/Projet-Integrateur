export function getSafeRedirectPath(pathname, search = "", hash = "") {
    if (!pathname || pathname === "/") {
        return "/application";
    }

    return `${pathname}${search}${hash}`;
}

export function buildRedirectTarget(locationState) {
    const requestedPath = locationState?.from?.pathname;
    const requestedSearch = locationState?.from?.search ?? "";
    const requestedHash = locationState?.from?.hash ?? "";

    return getSafeRedirectPath(requestedPath, requestedSearch, requestedHash);
}
