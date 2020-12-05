export function setLangs (context, data) {
  context.commit('setLangs', data)
}

export function setUser (context, data) {
  context.commit('setUser', data)
}

export function setSelectedLang (context, l) {
  context.commit('setSelectedLang', l)
}
