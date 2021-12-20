<template>
  <q-page v-if="$q.screen.width >= 1280" class="mainpage window-height window-width column justify-center items-center content-center">
      <div class="logo-section">
        <section class="row items-center">
          <img class="logo" src="../assets/fix-logo.svg" alt="Fix Logo" />
          <span class="logo-label">Automated Building Fix</span>
        </section>
      </div>

      <ocbo/>

      <span class="label">Application Number</span>
      <input 
        type="text"
        class="textbox2"
        v-model="applicationNo"
        @focus="animateTextbox"
        @blur="animateTextbox2"
        :maxlength="9"
        @keypress="formatApplication($event)"
        @keypress.enter="checkButton"
      />
     
      <q-btn
        class="button"
        unelevated
        rounded
        color="secondary"
        :label="buttonText"
        size="lg"
        @click="checkButton"
      />

      <span v-if="goodMessage === true" class="message-good">{{ errorsList[0] }}</span>
      <div v-else class="message-bad">
        <section v-if="errorsList.length > 1">
          <span>{{ errorsList.length }} Errors Found</span>
          <span class="message-bad-detail row justify-center" v-for="error in errorsList" :key="error">
            {{error}}
          </span>
        </section>

        <section v-else class="message-bad-detail">
          <span>{{ errorsList[0] }}</span>
        </section>
      </div>

      <div v-if="errorsList.length > 0 && errorsList.includes('No Connection on Server') === false && errorsList.includes('Invalid Building Application Number') === false">
        <q-btn class="adv-button" flat label="Advance Option" @click="gotoLogin"/>
      </div>
  </q-page>

  <q-page v-else class="mainpage window-height window-width column justify-center items-center content-center">
    <div class="label mobile">
      <span>This Application does not support mobile</span>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, watch } from "vue"
// import { useStore } from 'vuex'
import { api } from "boot/axios";
import { gsap } from 'gsap/dist/gsap'
import { useQuasar, QSpinnerHourglass, LocalStorage, SessionStorage } from 'quasar'
import { useRouter } from 'vue-router'
import Ocbo from 'components/Ocbo'

export default defineComponent({
  name: "IndexPage",

  components: {
    Ocbo
  },

  setup() {
    let applicationNo = ref(null);
    const errorsList = ref([])
    let goodMessage = ref(true)
    let buttonText = ref('Scan')
    const quasar = useQuasar()
    const router = useRouter()
    // const $store = useStore()



    watch(applicationNo, (value, oldvalue) => {
      if (value !== oldvalue) {
        buttonText.value = "Scan"
        errorsList.value = []
      }
    })




    let connected = false
    const checkServer = async () => {
      await api.get('/api/CheckConnection')
        .then((response) => {
          const data = response.data[0]
          // if (data.includes('OK') === true || data[0].message.includes('Successfull')) {
          //   connected = true
          // } else {
          //   connected = false
          // }
          if (parseInt(data.result) === 1) {
            connected = true
          }
        })
        .catch(() => {
          connected = false
        })
    }




    const checkButton = () => {
      if (buttonText.value === 'Scan') {
        preScan()
      } else {
        preFix()
      }
    }




    const preScan = async () => {
      errorsList.value = []

      if (applicationNo.value.length === 9) {
        quasar.loading.show({
          spinner: QSpinnerHourglass,
          message: 'Scanning for Errors'
        })

        await checkServer()
        if (connected === true) {
          scan()
        } else {
          quasar.loading.hide()

          errorsList.value.push('No Connection on Server')
          goodMessage.value = false
        }

      } else {
        errorsList.value.push('Invalid Building Application Number')
        goodMessage.value = false
      }
    }

    const scan = async () => {
      await checkExisting()
      if (receivingID > 0) {

        await checkNameError()
        if (isNameZero === '0') {
          errorsList.value.push(`Name's not display properly`)
          goodMessage.value = false
          buttonText.value = 'Fix'
        }

        // await checkArea()
        // // if (isFence === 1) {
        // //   checkLastStatus()
        // // }

        let fenceError = false
        await checkFence()
        if (isFence === 1) {
          await checkLastStatus()

          const allowStatus = ['RECEIVING', 'RE-ROUTING', 'ASSESSMENT', 'RECEIVEZONING', 'RECEIVEFIRE']

          if (allowStatus.includes(lastStatus)) {
            fenceError = true
            errorsList.value.push(`Not Visible to OP Approval`)
            goodMessage.value = false
            buttonText.value = 'Fix'
          }
        }

        // await getExcavation()
        // if (excavationID !== null) {
        //   checkLastStatus()
        // }

        // await getPool()
        // if (poolID !== null) {
        //   checkLastStatus()
        // }

        // await getEmbankment()
        // if (embankmentID !== null) {
        //   checkLastStatus()
        // }

        await checkAdminFine ()
        if (isAdminFineError === true) {
          await getAdminFine()
        }

        if (isNameZero !== '0' &&  fenceError === false) {
          errorsList.value.push(`No Error Detected`)
          goodMessage.value = true
        }

        // getOPOtherDetails()

        quasar.loading.hide()
       
      } else {
        quasar.loading.hide()
        errorsList.value.push('not exist')
        goodMessage.value = false
      }
    }



    
    const preFix = async () => {
      await checkServer()
      if (connected === true) {
        await fix()
      } else {
        errorsList.value.push('Cannot Fix, No Connection on Server')
        goodMessage.value = false
      }
      
    }

    const fix = async () => {
      if (errorsList.value.includes(`Name's not display properly`)) {
        fixNameError()
      }

      if (errorsList.value.includes(`Not Visible to OP Approval`)) {
        await fixFenceDocflow()
        await fixFencePayment()
      }

      errorsList.value = []
      errorsList.value.push('Fix Complete')
      goodMessage.value = true
    }

    const fixNameError = async () => {
      await api.put('/api/FixNameError/' + applicationNo.value )
    }

    const fixFenceDocflow = async () => {
      await api.post('/api/FixFenceDocflow', {
        id: receivingID
      })
    }

    const fixFencePayment = async () => {
      await api.put('/api/FixFencePayment/' + applicationNo.value)
    }
    

    



    let receivingID = null

    // let globalReceivingID = computed({
    //   // get: () => $store.state.receivingid.receivingidState,
    //   // set: val => {
    //   //   $store.commit('receivingid/updateReceivingID', val)
    //   // }

    //   get: () => SessionStorage.getItem('receivingid'),
    //   set: val => {
    //     SessionStorage.set('receivingid', val)
    //   }
    // })

    // const getGlobalReceivingID = () => {
    //   return SessionStorage.getItem('receivingid')
    // }
    const setGlobalReceivingID = (val) => {
      SessionStorage.set('receivingid', val)
    }

    

    // let globalTotalArea = computed({
    //   get: () => $store.state.totalarea.totalarea,
    //   set: val => {
    //     $store.commit('totalarea/updateTotalArea', val)
    //   }
    // })

    let globalTotalArea = null
    const getGlobalTotalArea = async () => {
      globalTotalArea = await SessionStorage.getItem('totalarea')
    }
     const setGlobalTotalArea = (val) => {
      SessionStorage.set('totalarea', val)
    }


    // let globalBldgFeeID = computed({
    //   get: () => $store.state.bldgfeeid.bldgfeeid,
    //   set: val => {
    //     $store.commit('bldgfeeid/updateBldgFeeID', val)
    //   }
    // })
    let globalBldgFeeID = null
    const getGlobalBldgFeeID = async () => {
      globalTotalArea = await SessionStorage.getItem('bldgfeeid')
    }
     const setGlobalBldgFeeID = (val) => {
      SessionStorage.set('bldgfeeid', val)
    }


    // let globalBldgFee = computed({
    //   get: () => $store.state.bldgfee.bldgfee,
    //   set: val => {
    //     $store.commit('bldgfee/updateBldgFee', val)
    //   }
    // })
    let globalBldgFee = null
    const getGlobalBldgFee = async () => {
      globalTotalArea = await SessionStorage.getItem('bldgfee')
    }
     const setGlobalBldgFee = (val) => {
      SessionStorage.set('bldgfee', val)
    }

    

    const checkExisting = async () => {
      await api
        .get('/api/CheckExisting/' + applicationNo.value)
        .then((response) => {
          const data = response.data[0]

          if (data) {
            receivingID = data.result;
          } else {
            receivingID = 0
          }
          setGlobalReceivingID(receivingID)
        })
        .catch(() => {
          receivingID = 0
          setGlobalReceivingID(receivingID)
        })
    };


    //Duplicate Admin Fine
    //1.Count Admin Fine
    //2.Get Admin Fine Amount
    //3.Delete All Admin Fine
    //4.Add Admin Fine

    let isAdminFineError = false

    const checkAdminFine = async () => {
      await api.get('/api/CheckAdminFine/' + applicationNo.value )
        .then((response) => {
          const data = response.data[0]

          if (data) {
            isAdminFineError = data.result > 1 ? true : false

            if (isAdminFineError === true) {
              errorsList.value.push('Duplicate Admin Fine')
              goodMessage.value = false
              buttonText.value = 'Fix'
            }
            
          } else {
            isAdminFineError = false
          }
        })
        .catch (() => {
          isAdminFineError = false
        })
    }

    let adminFineAmount = 0

    const getAdminFine = async () => {
      await api.get('/api/GetAdminFine/' + applicationNo.value )
        .then((response) => {
          const data = response.data[0]

          if (data) {
            adminFineAmount = data.result
          } else {
            adminFineAmount = 0
          }
        })
        .catch (() => {
          adminFineAmount = 0
        })
    }

    const removeAllAdminFine = async () => {
      await api.delete('/api/RemoveAdminFines/' + applicationNo.value )
    }

    let assessedBy = 0
    let reviewedBy = 0
    let optn = null
    const getOPOtherDetails = async () => {
      await api.get('/api/GetOPOtherDetails/' + applicationNo.value )
        .then((response) => {
          const data = response.data[0]

          if (data) {
            assessedBy = data.resultA
            reviewedBy = data.resultR
            optn = data.resultO
          } else {
            assessedBy = 0
            reviewedBy = 0
            optn = null
          }
        })
        .catch(() => {
          assessedBy = 0
          reviewedBy = 0
          optn = null
        })
    }

    const addNewAdminFine = async () => {
      await api.post('/api/AddNewAdminFine', {
        app: applicationNo.value,
        amount: adminFineAmount,
        assess: assessedBy,
        review: assessedBy,
        optn: optn
      })
    }





    //Name is Zero
    //1.Check occlastName from customer using receivingid
    //2.Change 0 to empty value

    let isNameZero = null

    const checkNameError = async () => {
      await api.get('/api/CheckNameError/' + applicationNo.value )
        .then((response) => {
          const data = response.data[0]

          if (data) {
            isNameZero = data.result.toString();
          } else {
            isNameZero = null
          }
        })
        .catch (() => {
          isNameZero = null
        })
    }



    //Duplicate Area
    //1.Count Areas
    //2.Delete Duplicates on bldg_fee
    //3.Update Floor Area on bldg_permit
    
    let duplicateArea = null

    const checkArea = async () => {
       await api.get('/api/CheckArea/' + applicationNo.value )
        .then((response) => {
          const data = response.data

          if (data) {
            duplicateArea = data.length > 1 ? true :false

            if (duplicateArea > 1) {
              const totalArea = data.resultT
              const bldgFeeID = data.resultI
              const bldgFee = data.resultF

              setGlobalTotalArea(totalArea)
              setGlobalBldgFeeID(bldgFeeID)
              setGlobalBldgFee(bldgFee)
            }
          }
        })
    }



    //Cannot Locate OP Approval (Fence)
    //1.Check if Fence
    //2.Check Last Status
    //3.Add OP Approval if not latest
    //4.Make sure for_approval = 1 and is_approved = 0

    let isFence = null

    const checkFence = async () => {
      await api.get('/api/CheckFence/' + receivingID)
        .then((response) => {
          const data = response.data[0]
          
          if (data) {
            isFence = data.result
          }
        })
    }



    let lastStatus = null

    const checkLastStatus = async () => {
      await api.get('/api/CheckLastStatus/' + receivingID)
        .then((response) => {
          const data = response.data[0]
          
          if (data) {
            lastStatus = data.result
          }
        })
    }



    //Excavation
    //1.Get Excavation details from ref_bldgcomputation
    //2.Get current status
    //3.Ask Amount to Add
    //4.Save Amount on building_orderofpayment
    //5.Push to Approval if already approved

    

  


    //Pool
    //1.Get Pool details from ref_bldgcomputation
    //2.Get current status
    //3.Ask Amount to Add
    //4.Save Amount on building_orderofpayment
    //5.Push to Approval if already approved

    let poolID = null

    const getPool = async () => {
      await api.get('/api/GetPool')
        .then((response) => {
          const data = response.data[0]
          
          if (data) {
            poolID = data.result
          }
        })
    }



    let embankmentID = null

    const getEmbankment = async () => {
      await api.get('/api/GetEmbankment')
        .then((response) => {
          const data = response.data[0]
          
          if (data) {
            embankmentID = data.result
          }
        })
    }



    const animateTextbox = () => {
      gsap.to('.textbox2', { duration: 0.3, width: '310', backgroundColor: '#1976D2', fontSize: '2.2rem' })
    }
     const animateTextbox2 = () => {
      gsap.to('.textbox2', { duration: 0.3, width: '250', backgroundColor: '#ffffff', fontSize: '1.6rem' })
    }




    const formatApplication = (evt) => {
      evt = (evt) ? evt : window.event
      var charCode = (evt.which) ? evt.which : evt.keyCode

      applicationNo.value

      if (applicationNo.value !== null && applicationNo.value.length === 2) {
        applicationNo.value = applicationNo.value + '-'
      }

      if ((charCode > 31 && (charCode < 45 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault()
      } else {
        return true
      }
    }



    const gotoLogin = () => {
      
      LocalStorage.set('Application Number', applicationNo.value)
      let logged = LocalStorage.has('Employee ID')

      if (logged === true) {
        router.push('advance', () => {})
      } else {
        router.push('login', () => {})
      }
    }


  

    return {
      applicationNo,
      preScan,
      errorsList,
      goodMessage,
      animateTextbox,
      animateTextbox2,
      buttonText,
      checkButton,
      formatApplication,
      gotoLogin
    };
  },
});
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

  .textbox 
    width: 16rem
    font-size: 1.6rem
    margin-top: 0.1rem
    text-align: center
    font-family: 'Roboto'

  .textbox2
    margin-top: 2rem
    width: 16rem
    font-size: 1.6rem
    margin-top: 0.1rem
    text-align: center
    font-family: 'Roboto'
    border-radius: 28px
    border: 1px solid #2d9fd9
    height: 3.5rem

  .textbox2:focus
    outline: none
    border: 1px solid #1976D2
    color: #ffffff

  

  .message-good
    width: 100%
    text-align: center
    color: #CDF0EA
    font-size: 1.8rem
    margin-top: 2rem
    font-family: 'WorkSansThin'

  .message-bad
    width: 100%
    text-align: center
    color: #E99497
    font-size: 1.8rem
    margin-top: 2rem

  .message-bad-detail
    font-family: 'WorkSansThin'
    width: 100%
    text-align: center
    color: #E99497
    font-size: 1.8rem
    margin-top: 0

  .adv-button
    color: #CDF0EA
    font-size: 1.2rem
    margin-top: 1rem
    font-family: 'WorkSans'

  .mobile
    font-size: 2rem

</style>
