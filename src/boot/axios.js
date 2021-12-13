import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { encryptAES } from 'src/js/OCBO'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// const api = axios.create({ baseURL: '' })


const api = axios.create({
  baseurl: '',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'X-Secure-Connection': 'OCBO',
    'X-Data-Lock': encryptAES('BLDGFix')
  }
})



// const api = axios.create({
//   baseURL: 'https://192.168.7.160/bldgfixserver/',
//   headers: {
//     'X-Requested-With': 'XMLHttpRequest',
//     'X-Secure-Connection': 'OCBO',
//     'X-Data-Lock': encryptAES('BLDGFix')
//   }
// })

// const apipops = axios.create({
//   baseURL: 'https://192.168.7.160/bldgfixserverpops/',
//   headers: {
//     'X-Requested-With': 'XMLHttpRequest',
//     'X-Secure-Connection': 'OCBO',
//     'X-Data-Lock': encryptAES('BLDGFix')
//   }
// })


export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // app.config.globalProperties.$apipops = apipops
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
