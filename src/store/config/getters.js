export function getLangs (state) {
  return state.langs
}

export function getUser (state) {
  return state.user
}

export function hasRole (state) {
  return role => { return state.user.roles.findIndex(el => el.name === role) !== -1 }
}

export function getSelectedLang (state) {
  return state.selectedLang
}
