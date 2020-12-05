  <template>
  <q-layout v-if="authUser" view="hHh lpR fFf">
    <q-header class="bg-blue-10 text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left"/>
        <div>Administrateur</div>

        <q-toolbar-title></q-toolbar-title>
        <!-- <q-btn-dropdown
          flat
          size="sm"
          :label="selectedLang ? selectedLang.short_name : ''"
          color="white"
        >
          <q-list>
            <q-item
              v-for="l in  langs"
              :key="l.id"
              clickable
              v-close-popup
              @click="setSelectedLang(l)"
            >
              <q-item-section>
                <q-item-label>{{ l.short_name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>-->
        <q-btn-dropdown
          flat
          size="sm"
          color="white"
          :label="authUser.last_name + ' ' + authUser.first_name"
        >
          <q-list>
            <q-item clickable v-close-popup>
              <q-item-section>
                <q-item-label>Profile</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="logout">
              <q-item-section>
                <q-item-label>Deconnexion</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      v-model="left"
      side="left"
      behavior="desktop"
      content-class="bg-white"
      no-borders
      :width="200"
      :breakpoint="700"
    >
      <q-scroll-area
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
        style="height: 90vh; max-height: 90vh"
      >
        <q-list>
          <div v-for="m in menu" :key="m.title">
            <q-item-label class="text-grey-10 text-weight-bold" header>{{ m.title }}</q-item-label>
            <q-list dense>
              <q-item
                class="text-grey-4 text-caption"
                v-for="l in hasRoleLinks(m.links)"
                :key="l.title"
                clickable
                active-class="activeLink"
                v-ripple
                :to="{path: l.link, props: l.props || {}}"
              >
                <q-item-section class="text-grey-9 q-pa-xs" v-if="l.icon!== undefined" avatar>
                  <q-icon color="blue-10" :name="l.icon" size="xs"/>
                </q-item-section>
                <q-item-section class="text-grey-9 q-pa-xs" style="font-size:11px">{{ l.title }}</q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="bg-white no-borders" >
      <router-view v-if="langFetched"/>
    </q-page-container>
  </q-layout>
  <q-layout v-else view="hHr LpR lFf">
    <q-page-container>
      <div class="column" style="height: 100vh">
        <div class="col self-center q-pt-lg">
          <q-circular-progress
            indeterminate
            size="150px"
            :thickness="0.08"
            color="blue-10"
            center-color="transparent"
            track-color="transparent"
            class="q-ma-md"
          />
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',

  components: {},

  data () {
    return {
      left: false,
      langFetched: false,
      authUser: null,
      langs: [],
      menu: [
        {
          title: 'Accueil',
          links: [
            {
              title: 'Tableau de bord',
              link: '/',
              icon: 'eva-pie-chart-outline'
            }
          ]
        },
        {
          title: 'Catalogue',
          links: [
            {
              title: 'Produits',
              link: '/Product',
              role: 'GET_PRODUCT',
              icon: 'eva-archive-outline'
            },
            {
              title: 'Catégories',
              link: '/ProductCategory/category',
              role: 'GET_PRODUCT_CATEGORY',
              icon: 'eva-menu-outline'
            },
            {
              title: 'Sous catégories',
              link: '/ProductCategory/subCategory',
              role: 'GET_PRODUCT_CATEGORY',
              icon: 'eva-list-outline'
            },
            {
              title: 'Marques',
              link: '/Brand',
              role: 'GET_BRAND',
              icon: 'eva-cube-outline'
            },
            {
              title: 'Caractéristiques',
              link: '/Attribute',
              role: 'GET_ATTRIBUTE',
              icon: 'eva-grid-outline'
            }
          ]
        },
        {
          title: 'Clients',
          links: [
            {
              title: 'Commandes',
              link: '/Order',
              role: 'GET_ORDER',
              icon: 'eva-file-text-outline'
            },
            {
              title: 'Messagerie',
              link: '/Chat',
              icon: 'eva-email-outline'
            },
            {
              title: 'Livraison',
              link: '/Shipping',
              role: 'GET_SHIPPING',
              icon: 'eva-car-outline'
            },
            {
              title: 'Retour',
              link: '/Return',
              role: 'GET_RETURN',
              icon: 'eva-corner-up-right-outline'
            },
            {
              title: 'Tarifs de livraison',
              link: '/ShippingFee',
              role: 'GET_SHIPPING_FEE',
              icon: 'eva-credit-card-outline'
            },
            {
              title: 'Clients',
              link: '/Customer',
              role: 'GET_CUSTOMER',
              icon: 'eva-people-outline'
            },
            {
              title: 'Catégories',
              link: '/CustomerCategory',
              role: 'GET_CUSTOMER_CATEGORY',
              icon: 'eva-menu-outline'
            },
            {
              title: 'Activité',
              link: '/CustomerActivity',
              role: 'GET_CUSTOMER_ACTIVITY',
              icon: 'eva-menu-outline'
            },
            {
              title: 'Recherches des clients',
              link: '/CustomerSearch',
              role: 'GET_CUSTOMER_ACTIVITY',
              icon: 'eva-search-outline'
            },
            {
              title: 'Avis des clients',
              link: '/CustomerNotice',
              role: 'GET_CUSTOMER_ACTIVITY',
              icon: 'eva-message-square-outline'
            }
          ]
        },
        {
          title: 'Stock',
          links: [
            {
              title: 'Etat du stock',
              link: '/Stock',
              role: 'GET_STOCK',
              icon: 'eva-cube-outline'
            },
            {
              title: 'Mouvement du stock',
              link: '/StockMovement',
              role: 'GET_STOCK_MOVEMENT',
              icon: 'eva-flip-2-outline'
            },
            {
              title: 'Inventaires',
              link: '/Inventory',
              role: 'GET_INVENTORY',
              icon: 'eva-menu-arrow-outline'
            },
            {
              title: 'Entrées',
              link: '/Input',
              role: 'GET_INPUT',
              icon: 'eva-corner-left-down-outline'
            },
            {
              title: 'Sorties',
              link: '/Output',
              role: 'GET_OUTPUT',
              icon: 'eva-corner-right-up-outline'
            }
          ]
        },
        {
          title: 'Configuration',
          links: [
            {
              title: 'Utilisateurs',
              link: '/user',
              role: 'GET_USER',
              icon: 'eva-people-outline'
            },
            {
              title: 'Groupes',
              link: '/userGroup',
              role: 'GET_USER_GROUP',
              icon: 'fas fa-users-cog'
            },
            {
              title: 'Configuration',
              link: '/configuration',
              icon: 'eva-settings-2-outline'
            }
          ]
        },
        {
          title: 'Paramètres du site',
          links: [
            {
              title: 'Publicités',
              link: '/pub',
              role: 'GET_PUB',
              icon: 'eva-image-outline'
            }
          ]
        }
      ],
      thumbStyle: {
        right: '0px',
        borderRadius: '0px',
        backgroundColor: '#0d47a1',
        width: '5px',
        opacity: 0.75
      },

      barStyle: {
        right: '2px',
        borderRadius: '9px',
        backgroundColor: '#027be3',
        width: '9px',
        opacity: 0
      }
    }
  },
  computed: {
    selectedLang () {
      return this.$store.getters['config/getSelectedLang']
    }
  },
  mounted () {
    this.getAuthUser()
    this.getLangs()
  },

  methods: {
    hasRoleLinks (links) {
      return links.filter(l => !l.role || this.hasRole(l.role))
    },
    logout () {
      this.$axios.post('logout').then(res => {
        localStorage.removeItem('TOKEN')
        this.$router.push('/login')
      })
    },
    getAuthUser () {
      this.$axios
        .get('authUser')
        .then(res => {
          this.$store.dispatch('config/setUser', res.data)
          this.authUser = res.data
        })
        .catch(() => {
          localStorage.removeItem('TOKEN')
        })
    },

    getLangs () {
      this.$axios.get('lang').then(res => {
        this.$store.dispatch('config/setLangs', res.data)
        this.langs = res.data
        this.langFetched = true
      })
    },
    setSelectedLang (l) {
      this.$store.dispatch('config/setSelectedLang', l)
    },
    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
    }
  }
}
</script>
<style>
.text-overflow {
  text-overflow: ellipsis;
  overflow: hidden;
  height: 1.5em;
  white-space: nowrap;
}

/* width */
::-webkit-scrollbar {
  width: 2px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #aaa;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: rgb(49, 49, 49);
}

.activeLink {
  border-right: 4px solid #0d47a1;
  background: #eee;
}
</style>
