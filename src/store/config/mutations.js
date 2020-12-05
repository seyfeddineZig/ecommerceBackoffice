export const setIsLoggedIn = (state, isLoggedIn) => {
  state.auth.isLoggedIn = isLoggedIn
}

export function setLangs (state, data) {
  state.langs = data
  state.selectedLang = data.find(el => el.default === 1)
}

export function setUser (state, data) {
  state.user = data
}

export function setSelectedLang (state, l) {
  state.selectedLang = l
}
