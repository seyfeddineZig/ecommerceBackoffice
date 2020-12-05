import Vue from 'vue'
import Echo from 'laravel-echo'

window.Pusher = require('pusher-js')

const echo = new Echo({
  // authEndpoint: 'http://localhost:8000/broadcasting/auth',
  // encrypted: true,
  broadcaster: 'pusher',
  key: 'local',
  wsHost: 'localhost',
  wsPort: 6001,
  forceTLS: false,
  disableStats: true
  //   auth: {
  //     headers: {
  //       Accept: 'application/json',
  //       Authorization: 'Bearer ' + localStorage.getItem('TOKEN'),
  //       'Access-Control-Allow-Origin': '*'
  //     }
  //   }
})

Vue.prototype.$echo = echo
export { echo }
