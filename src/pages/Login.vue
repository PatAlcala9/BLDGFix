<template>
  <q-page v-if="$q.screen.width >= 1280" class="mainpage window-height window-width column justify-center items-center content-center">
    <div class="logo-section">
      <section class="row items-center">
        <img class="logo" src="../assets/fix-logo.svg" alt="Fix Logo" />

        <section class="column">
          <span class="logo-title">Automated Building Fix</span>
          <span class="logo-label">Login Page</span>
        </section>
      </section>
    </div>

    <Ocbo/>

    <div class="column items-center info-area">
      <span class="info">Before accessing Advance Option</span>
      <span class="info">Please login using your IIPS Account</span>
    </div>
    
    <span class="label">Username</span>
    <input 
        type="text"
        class="textbox2"
        id="username"
        v-model="username"
        @focus="animateUsername"
        @blur="animateUsername2"
        autocomplete="off"
      />

    <span class="label">Password</span>
    <input 
        type="password"
        class="textbox2"
        id="password"
        v-model="password"
        @focus="animatePassword"
        @blur="animatePassword2"
        @keypress.enter="checkEmpty"
      />

    <div class="button-area">
      <q-btn
        class="button"
        unelevated
        rounded
        color="secondary"
        label="Login"
        size="lg"
        @click="checkEmpty"
      />
    </div>
  </q-page>

  <q-page v-else class="mainpage window-height window-width column justify-center items-center content-center">
    <div class="label mobile">
      <span>This Applicaiton does not support mobile</span>
    </div>
  </q-page>
</template>

<script>
import Ocbo from 'components/Ocbo'
import { ref } from 'vue'
import { gsap } from 'gsap/dist/gsap'
import { api } from "boot/axios"
import { encrypt } from '../js/OCBO.js'
import { LocalStorage, useQuasar, QSpinnerHourglass } from 'quasar'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginPage',

  components: {
    Ocbo
  },

  setup () {
    let username = ref(null)
    let password = ref(null)
    const router = useRouter()
    const quasar = useQuasar()

   

    let empty = false
    const checkEmpty = async () => {
      quasar.loading.show({
        spinner: QSpinnerHourglass,
        message: 'Authenticating'
      })

      if (username.value === null || username.value.length === 0) {
        empty = true
      } else {
        if (password.value === null || password.value.length === 0) {
          empty = true
        } else {
          empty = false

          await checkUsername()
          if (validUsername === true) {
            await checkPassword()
          }
         
        }
      }
    }
    
    let validUsername = false
    const checkUsername = async () => {
      await api.get('/api/CheckUsername/' + username.value.toUpperCase())
        .then((response) => {
          const data = response.data

          if (data) {
            if (parseInt(data[0].result) > 0) {
              validUsername = true
            } else {
              validUsername = false
            }
          }
        })
       
    }

    let dbPassword = null

    const checkPassword = async () => {
      await api.get('/api/CheckPassword/' + username.value.toUpperCase())
        .then((response) => {
          const data = response.data

          if (data) {
            dbPassword = data[0].result
          }
        })
        .then(() => {
          comparePasswords()
        })
    }

    const comparePasswords = async () => {
      const ePassword = await encrypt(password.value.toUpperCase())

      if (dbPassword === ePassword) {
        getEmployeeID()
      } else {
        quasar.loading.hide()
        //Invalid Password
      }
    }

    let employeeid = 0
    const getEmployeeID = async () => {
      quasar.loading.show({
        spinner: QSpinnerHourglass,
        message: `Analysing User's Access`
      })

      await api.get('/api/GetEmployeeID/' + username.value.toUpperCase())
        .then((response) => {
          const data = response.data

          if (data) {
            employeeid = data[0].result
          }
        })
        .then(() => {
          LocalStorage.set('Employee ID', employeeid)
        })
        .then(() => {
          getAccess()
        })
        .then(() => {
          quasar.loading.hide()
        })
        
    }

    let accessList = []
    const getAccess = async () => {
      await api.get('/api/GetAccess/' + employeeid)
        .then((response) => {
          const data = response.data

          if (data) {
            for (let i = 0; i < data.length; i++) {
              accessList.push(data[i].result)
            }
          }
        })
        .then(() => {
          LocalStorage.set('Access', accessList)
        })
        .then(() => {
          router.push('advance', () => {})
        })
    }




    const animateUsername = () => {
      gsap.to('#username', { duration: 0.3, width: '450', backgroundColor: '#1976D2', fontSize: '2.2rem' })
    }
     const animateUsername2 = () => {
      gsap.to('#username', { duration: 0.3, width: '390', backgroundColor: '#ffffff', fontSize: '1.6rem' })
    }

    const animatePassword = () => {
      gsap.to('#password', { duration: 0.3, width: '450', backgroundColor: '#1976D2', fontSize: '2.2rem' })
    }
     const animatePassword2 = () => {
      gsap.to('#password', { duration: 0.3, width: '390', backgroundColor: '#ffffff', fontSize: '1.6rem' })
    }



    return {
      username,
      password,
      animateUsername,
      animateUsername2,
      animatePassword,
      animatePassword2,
      checkEmpty
    }
  }
}
</script>

<style lang="sass" scoped>
  .logo-section
    position: absolute
    top: 0
    left: 0
    margin: 2rem

  .logo
    width: 6.5rem
    height: auto

  .logo-title
    margin-left: 2.2rem
    height: auto
    padding: auto
    text-align: left
    font-size: 2.5rem
    font-family: 'WorkSansThin'
    color: #CDF0EA

  .logo-label
    margin-left: 2rem
    height: auto
    text-align: left
    font-size: 4.1rem
    font-family: 'WorkSansThin'
    color: #CDF0EA

  .label
    width: 100%
    text-align: center
    font-size: 1.6rem
    font-family: 'WorkSansThin'
    color: #CDF0EA  

  .button-area
    margin-top: 2rem

  .info-area
    margin: 2rem

  .info
    font-family: 'WorkSansThin'
    color: #CDF0EA 
    font-size: 1.8rem

  .textbox2
    margin-top: 2rem
    width: 25rem
    font-size: 1.6rem
    margin-top: 0.1rem
    text-align: center
    font-family: 'Roboto'
    border-radius: 28px
    border: 1px solid #2d9fd9
    height: 3.5rem
    text-transform: uppercase

  .textbox2:focus
    outline: none
    border: 1px solid #1976D2
    color: #ffffff
</style>
