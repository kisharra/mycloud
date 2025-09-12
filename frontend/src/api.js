import { getCSRFToken } from './csrf'

export const api = {
  async json(method, url, body) {
    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
      },
      credentials: 'include', // обязательно, чтобы куки csrftoken ходили
      body: body ? JSON.stringify(body) : undefined,
    })
    const ct = res.headers.get('content-type') || ''
    const data = ct.includes('application/json') ? await res.json() : null
    if (!res.ok) throw new Error(data?.detail || 'Ошибка запроса')
    return data
  },

  async form(url, formData) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCSRFToken(),
      },
      credentials: 'include',
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.detail || 'Ошибка загрузки')
    return data
  }
}
