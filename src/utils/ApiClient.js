const getAddress = () => {
    const url = new URL(window.location.href)
    return process.env.NODE_ENV === 'development' ? `${url.protocol}//${url.hostname}:4000` : `${url.protocol}//${url.host}`
}

function apiRequest(endPoint, method, key, body) {
    let opts = {method}
    if (body) {
        if (body instanceof File) {
            const formData = new FormData()
            formData.append('attachment', body)
            opts = {body: formData, ...opts}
        } else {
            opts = { headers: { 'Content-Type': "application/json" }, body: JSON.stringify(body), ...opts }
        }
    }

    if (key) {
        opts.headers = {'Authorization': `Bearer ${key}`, ...opts.headers}
    }

    return fetch(getAddress() + "/api" + endPoint, opts)
        .then(response => {
            const contentType = response.headers.get("content-type")
            if (contentType && contentType.indexOf("application/json") !== -1) {
                if (response.ok) {
                    return response.json()
                } else {
                    return response.json().then(e => Promise.reject(Error(e?.error || `Error Inesperado ${response.status}`)))
                }
            } else if (contentType && contentType.indexOf("text/html") !== -1) {
                if (response.ok) {
                    return response.text()
                } else {
                    return Promise.reject(Error(`Error Inesperado ${response.status}`))
                }
            } else {
                if (response.ok) {
                    return Promise.resolve(response)
                } else {
                    return Promise.reject(Error(`Error Inesperado ${response.status}`))
                }
            }
        })
}

export {apiRequest, getAddress}