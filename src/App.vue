<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted () {
    this.$echo.channel('channel')
      .listen('Chat', (e) => {
        console.log(e)
      })
  }
}
</script>
