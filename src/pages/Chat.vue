<template>
  <q-page>
    <q-layout view="hHh lpR lFr" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Messagerie</div>
          </q-toolbar-title>
        </q-toolbar>
      </q-header>

      <q-drawer
        side="right"
        v-model="drawerRight"
        bordered
        :width="300"
        :breakpoint="350"
        content-class="bg-grey-1"
      >
        <ChatCustomersList :data="customers" v-on:getCustomerMessages="getCustomerMessages"></ChatCustomersList>
      </q-drawer>
      <q-page-container>
        <q-page class>
          <div class="row">
            <div v-if="messages.length > 0" class="col-12">
              <q-chat-message
              v-for="(m, i) in messages"
              :key="i"
              :text="[m.message]"
              :sent="m.sender === 'USER'"/>
            </div>
            <div v-else class="col-12 text-subtitle1 text-grey-6 q-pt-xl text-center">
                <q-icon name="eva-email-outline" size="20vw" color="grey-2" />
            </div>
          </div>
        </q-page>
      </q-page-container>
      <q-footer class="bg-grey-2 text-white q-pa-sm">
        <q-toolbar>
          <div class="row full-width">
            <div class="col-10 q-pa-xs">
              <q-input
                filled
                dense
                v-model="newMsg"
                type="text"
                label="Ecrivez un message ..."
                autogrow
              />
              <div v-if="msgEmpty" class="text-caption text-red">
                Veuillez écrire quelque chose
              </div>
            </div>
            <div class="col-2 q-pa-xs text-center">
              <q-btn
                class="q-pa-sm"
                size="xs"
                color="blue-10"
                text-color="white"
                icon="eva-paper-plane-outline"
                label="Envoyer"
                @click="sendMessage"
              />
            </div>
          </div>
        </q-toolbar>
      </q-footer>
    </q-layout>
  </q-page>
</template>

<script>
import ChatCustomersList from 'components/ChatCustomersList'

export default {
  name: 'ChatPage',
  data () {
    return {
      drawerRight: true,
      customers: [],
      messages: [],
      selectedCustomerId: null,
      newMsg: '',
      msgEmpty: false
    }
  },
  computed: {},
  components: {
    ChatCustomersList
  },
  mounted () {
    this.getCustomers()

    this.$echo.channel('chat')
      .listen('MessageSent', (e) => {
        console.log(e)
        if (parseInt(this.selectedCustomerId) === parseInt(e.message.customer_id)) {
          this.messages.push(e.message)
        }
      })
  },
  methods: {
    getCustomers () {
      this.$axios.get('/customer').then(res => {
        this.customers = res.data
        this.fetched = true
      })
    },
    getCustomerMessages (id) {
      this.selectedCustomerId = id
      this.$axios.get('/chat/' + id).then(res => {
        this.messages = res.data
      })
    },
    sendMessage () {
      if (this.newMsg === null || this.newMsg === '') {
        this.msgEmpty = true
      } else {
        this.$axios.post('/chat', {
          message: this.newMsg,
          customer_id: this.selectedCustomerId
        })
          .then(res => {

          })
      }
    },
    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
    }
  }
}
</script>
