<template>
  <q-page padding>
    <LoginComponent></LoginComponent>
  </q-page>
</template>

<script>
import LoginComponent from 'components/LoginComponent'
export default {
  name: 'AuthPage',
  components: {
    LoginComponent
  }
}
</script>
