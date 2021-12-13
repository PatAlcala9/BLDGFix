<template>
  <q-page v-if="$q.screen.width >= 1280" class="mainpage window-height window-width column justify-center items-center content-center">
    <div class="logo-section">
      <section class="row items-center">
        <img class="logo" src="../assets/fix-logo.svg" alt="Fix Logo" />

        <section class="column">
          <span class="logo-title">Automated Building Fix</span>
          <span class="logo-label">Advanced Page</span>
        </section>
      </section>
    </div>

    <Ocbo/>

    <section v-if="assessAccess === false" class="column items-center info-area">
      <span class="access-title">Assessment</span>
      <q-btn v-if="excavationExist === false" class="access-button" unelevated rounded color="standard" label="Add Excavation Fee" @click="addExcavation"/>
      <q-btn v-if="poolExist === false" class="access-button" unelevated rounded color="standard" label="Add Pool Fee" @click="addPool"/>
      <q-btn class="access-button" unelevated rounded color="standard" label="Add New Fee" @click="addNewFee"/>
      <q-btn v-if="allowReprint" class="access-button" unelevated rounded color="standard" label="Re-Print Override" @click="reprint"/>
    </section>

    <div class="button-area">
      <q-btn
        class="button"
        unelevated
        rounded
        color="secondary"
        label="Back to Main"
        size="lg"
        @click="goBack"
      />
    </div>
  </q-page>

  <q-page v-else class="mainpage window-height window-width column justify-center items-center content-center">
    <div class="label mobile">
      <span>This Applicaiton does not support mobile</span>
    </div>
  </q-page>


   <q-dialog v-model="alert">
      <q-card class="dialog">
        <q-card-section class="column items-center">
          <span class="dialog-title">{{dialogTitle}}</span>
        </q-card-section>


        <q-card-section v-if="dialogTitle.includes('New')" class="column items-center info-area">
          <span class="dialog-label">Name</span>
          <input 
            type="text"
            class="textbox2"
            autocomplete="off"
            v-model="newFeeName"
          />
          <span class="dialog-label">Amount</span>
          <input 
            type="text"
            class="textbox2"
            autocomplete="off"
            v-model="newFeeAmount"
            @keypress="formatAmount($event)"
          />
        </q-card-section>


        <q-card-section v-else class="column items-center info-area">
          <span class="dialog-label">Amount</span>
          <input 
            v-if="dialogTitle.includes('Excavation')"
            type="text"
            class="textbox2"
            autocomplete="off"
            v-model="excavationAmount"
            @keypress="formatAmount($event)"
          />
          <input 
            v-if="dialogTitle.includes('Pool')"
            type="text"
            class="textbox2"
            autocomplete="off"
            v-model="poolAmount"
            @keypress="formatAmount($event)"
          />
          <div v-if="excavationAmount > 0 && dialogTitle.includes('Excavation')">
            <!-- <span  v-if="excavationAmount < 1000" class="dialog-amount">&#8369; {{Number(excavationAmount).toFixed(2)}}</span>
            <span v-else class="dialog-amount">&#8369; {{Number(excavationAmount).toFixed(2).toString().replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}}</span> -->
            <span class="dialog-amount">&#8369; {{Intl.NumberFormat('en-IN').format(excavationAmount)}}</span>
          </div>

          <div v-if="poolAmount > 0 && dialogTitle.includes('Pool')">
            <!-- <span  v-if="excavationAmount < 1000" class="dialog-amount">&#8369; {{Number(excavationAmount).toFixed(2)}}</span>
            <span v-else class="dialog-amount">&#8369; {{Number(excavationAmount).toFixed(2).toString().replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}}</span> -->
            <span class="dialog-amount">&#8369; {{Intl.NumberFormat('en-IN').format(poolAmount)}}</span>
          </div>
        </q-card-section>

        

        <q-card-actions align="center">
          <q-btn v-if="dialogTitle.includes('Excavation')" flat size="lg" label="Add" color="primary" @click="getOPOtherDetails" />
          <q-btn v-if="dialogTitle.includes('Excavation')" flat size="lg" label="Cancel" color="red-5" @click="cancelExcavation" />

          <q-btn v-if="dialogTitle.includes('Pool')" flat size="lg" label="Add" color="primary" @click="getOPOtherDetailsPool" />
          <q-btn v-if="dialogTitle.includes('Pool')" flat size="lg" label="Cancel" color="red-5" @click="cancelPool" />

          <q-btn v-if="dialogTitle.includes('New')" flat size="lg" label="Save" color="primary" @click="saveData" />
          <q-btn v-if="dialogTitle.includes('New')" flat size="lg" label="Cancel" color="red-5" v-close-popup />
        </q-card-actions>

        
      </q-card>
    </q-dialog>


    <q-dialog v-model="reprintOverride">
      <q-card class="dialog">
        <q-card-section class="column items-center">
          <span class="dialog-title">RePrinting Override</span>
        </q-card-section>

        <q-card-section class="column items-center">
          <span class="dialog-label">Required to override Assessment as well?</span>
        </q-card-section>

        <q-card-section class="row nowrap justify-around items-start">
          <q-btn flat size="lg" label="Yes" color="primary" @click="reassess" />
          <q-btn flat size="lg" label="No" color="red-5" @click="rerelease" />
        </q-card-section>

      </q-card>
    </q-dialog>

</template>

<script>
import Ocbo from 'components/Ocbo'
import { LocalStorage, SessionStorage } from 'quasar'
import { ref, defineComponent } from 'vue'
import { api, apipops } from "boot/axios"
import { useRouter } from 'vue-router'



export default defineComponent({
  name: 'AdvancePage',


  components: {
    Ocbo
  },


  setup () {
    const router = useRouter()
    // const $store = useStore()
    let progressAccess = ref(false)
    let alert = ref(false)
    let dialogTitle = ref(null)
    let reprintOverride = ref(false)
    



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

    let globalReceivingID = null

    const getGlobalReceivingID = async () => {
      globalReceivingID = await SessionStorage.getItem('receivingid')
    }
    // const setGlobalReceivingID = (val) => {
    //   SessionStorage.set('receivingid', val)
    // }
   
    
    
    let applicationNumber = null
    const getApplicationNumber = async () => {
      applicationNumber = await LocalStorage.getItem('Application Number')
    }
    getApplicationNumber()


    let accessList = []
    const getAccessList = async () => {
      accessList = await LocalStorage.getItem('Access')
    }
    getAccessList()
    

    let assessAccess = ref(false)
    const checkAssess = () => {
      for (let i = 0; i < accessList.length; i++) {
        if (accessList[i].includes(2)) {
          assessAccess.value = true
          exit
        } else {
          assessAccess.value = false
        }
      }
    }
    checkAssess()

    
    
    
    let excavationID = null
    let excavationAmount = ref(null)

    const getExcavation = async () => {
      await api.get('/api/GetExcavation')
        .then((response) => {
          const data = response.data[0]
          
          if (data) {
            excavationID = data.result
          } else {
            excavationID = 0
          }
        })
        .then(() => {
          if (excavationID !== 0) {
            checkExistOP()
          }
        })
        .catch(() => {
          excavationID = 0
        })
    }

    let excavationExist = ref(false)
    const checkExistOP = async () => {
      await api.get('/api/CheckExistOP/' + applicationNumber + '/' + excavationID)
        .then((response) => {
          const data = response.data[0]

          if (data) {
            excavationExist.value = data.result === 1 ? true : false
          } else {
            excavationExist.value = false
          }
        })
        .catch(() => {
          excavationExist.value = false
        })
    }
    getExcavation()

    const addExcavation = () => {
      dialogTitle.value = 'Adding Excavation'
      alert.value = true
    }

    let assessedBy = 0
    let reviewedBy = 0
    let optn = null
    const getOPOtherDetails = async () => {
      await api.get('/api/GetOPOtherDetails/' + applicationNumber)
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
        .then(() => {
          if (assessedBy !== 0) {
            saveExcavation()
          }
        })
        .catch(() => {
          assessedBy = 0
          reviewedBy = 0
          optn = null
        })
    }

    const saveExcavation = async () => {
      await api.post('/api/SaveOP', {
        app: applicationNumber,
        ref: excavationID,
        amount: excavationAmount.value,
        assess: assessedBy,
        review: reviewedBy,
        optn: optn
      })
      .then(() => {
        excavationExist.value = true
      })
      .then(() => {
        alert.value = false
      })
    }

    const cancelExcavation = async () => {
      excavationAmount.value = null
      alert.value = false
    }





    
    let poolID = null
    let poolAmount = ref(null)

    const getPool = async () => {
      await api.get('/api/GetPool')
        .then((response) => {
          const data = response.data[0]
          
          if (data) {
            poolID = data.result
          } else {
            poolID = 0
          }
        })
        .then(() => {
          if (poolID !== 0) {
            checkExistOPPool()
          }
        })
        .catch(() => {
          poolID = 0
        })
    }

    let poolExist = ref(false)
    const checkExistOPPool = async () => {
      await api.get('/api/CheckExistOP/' + applicationNumber + '/' + poolID)
        .then((response) => {
          const data = response.data[0]

          if (data) {
            poolExist.value = data.result === 1 ? true : false
          } else {
            poolExist.value = false
          }
        })
        .catch(() => {
          poolExist.value = false
        })
    }
    getPool()

    const addPool = () => {
      dialogTitle.value = 'Adding Pool'
      alert.value = true
    }
    
    const getOPOtherDetailsPool = async () => {
      await api.get('/api/GetOPOtherDetails/' + applicationNumber)
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
        .then(() => {
          if (assessedBy !== 0) {
            savePool()
          }
        })
        .catch(() => {
          assessedBy = 0
          reviewedBy = 0
          optn = null
        })
    }

    const savePool = async () => {
      await api.post('/api/SaveOP', {
        app: applicationNumber,
        ref: poolID,
        amount: poolAmount.value,
        assess: assessedBy,
        review: reviewedBy,
        optn: optn
      })
      .then(() => {
        poolExist.value = true
      })
      .then(() => {
        alert.value = false
      })
    }

    const cancelPool = async () => {
      poolAmount.value = null
      alert.value = false
    }




    const addNewFee = async () => {
      await getOtherAccountCode()
      dialogTitle.value = 'Adding New Fee'
      alert.value = true
    }

    let otherCodeID = null
    let otherOldCodeID = null

    const getOtherAccountCode = async () => {
      await api.get('/api/GetOtherAccountCode')
        .then((response) => {
          const data = response.data
          
          if (data) {
            otherCodeID = data[0].resultA
            otherOldCodeID = data[0].resultO
          } else {
            otherCodeID = null
            otherOldCodeID = null
          }
        })
    }

    let newFeeName = ref(null)
    let newFeeAmount = ref(null)
    let newFeeID = null
    let newFeeExisting = false

    const checkNewFee = async () => {
      await api.get('/api/CheckNewFee/' + newFeeName.value)
        .then((response) => {
          const data = response.data

          if (data) {
            const result = data[0].result

            if (result > 0) {
              newFeeExisting = true
            } else {
              newFeeExisting = false
            }
          } else {
            newFeeExisting = false
          }
        })
        .catch(() => {
          newFeeExisting = false
        })
    }

    const getNewDescription = async () => {
       await api.get('/api/GetNewDescription/' + newFeeName.value.toUpperCase())
        .then((response) => {
          const data = response.data
          
          if (data) {
            newFeeID = data[0].result
          } else {
            newFeeID = null
          }
        })
    }

    const getOPOtherDetailsNew = async () => {
      await api.get('/api/GetOPOtherDetails/' + applicationNumber)
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

    const saveOPNew = async () => {
      await api.post('/api/SaveOP', {
        app: applicationNumber,
        ref: newFeeID,
        amount: newFeeAmount.value,
        assess: assessedBy,
        review: reviewedBy,
        optn: optn
      })
    }

    const saveNewFee = async () => {
      await api.post('/api/SaveNewFee', {
        description: newFeeName.value.toUpperCase(),
        code: otherCodeID,
        oldcode: otherOldCodeID
      })
    }




    const saveData = async () => {
      await checkNewFee()

      if (newFeeExisting === false) {
        await saveNewFee()

        if (newFeeName.value !== null) {
          await getOPOtherDetailsNew()

          if (newFeeName.value !== null) {
            await getNewDescription()

            if (newFeeID !== null) {
              await saveOPNew()
            }
          }
        }
        alert.value = false
      } else {
        await getNewDescription()

        if (newFeeID !== null) {
          await saveOPNew()
        }

        alert.value = false
      }
    }




    const formatAmount = (evt) => {
      evt = (evt) ? evt : window.event
      var charCode = (evt.which) ? evt.which : evt.keyCode

      if ((charCode > 31 && (charCode < 45 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault()
      } else {
        return true
      }
    }



    let allowReprint = ref(true)
    const reprint = () => {
      //STEPS:
      //1.Ask Change OP or Not *
      //Change OP
      //1.Delete OP
      //2.Push to Assessment
      //No Change
      //1.Check OP
      //2.Remove popstransmitted, is_release in OP
      //3.Check POPS if paid
      //4.if PAID
      //5.Push to ORDER OF PAYMENT PRINTED
      //6.If not PAID, delete
      //7.Push to ORDER OF PAYMENT PRINTED
      //8.Release to POPS
      //9.Push to ORDER OF PAYMENT RELEASED


      reprintOverride.value = true
    }

    const deleteOrderofPayment = async () => {
      await api.delete('/api/DeleteOrderofPayment/' + applicationNumber)
    }

    const pushToAssessment = async () => {
      await getGlobalReceivingID()

      await api.post('/api/PushToAssessment', {
        id: globalReceivingID,
        employeeid: 1
      })
      // await getGlobalReceivingID()
      // console.log('receivingid:', globalReceivingID)
    }

    const reassess = async () => {
      await deleteOrderofPayment()
      await pushToAssessment()
      reprintOverride.value = false
      allowReprint.value = false
    }


    let lastStatus = null

    const checkLastStatus = async () => {
      await  getGlobalReceivingID()

      await api.get('/api/CheckLastStatus/' + globalReceivingID)
        .then((response) => {
          const data = response.data[0]
          
          if (data) {
            lastStatus = data.result
          }
        })
    }

    const updateOrderofPayment = async () => {
      await api.put('/api/UpdateOrderofPaymentForReRelease/' + applicationNumber)
    }
    

    let paid = false
    const checkPaid = async () => {
      await api.get('http://localhost:1236/api/CheckPaid/' + applicationNumber)
        .then((response) => {
          const data = response.data

          if (data === true) {
            paid = true
          }
        })
        .then(() => {
          console.log('paid:', paid)
        })
    }

    const pushToReleasing = async () => {
      await api.post('/api/PushToReleasing', {
        id: globalReceivingID,
        employeeid: 1
      })
    }

    const rerelease = async () => {
      await checkLastStatus()
      // if (lastStatus === '') {}
      await updateOrderofPayment()
      await pushToReleasing()

      await checkPaid()

      reprintOverride.value = false
      allowReprint.value = false
    }


    const goBack = () => {
      LocalStorage.remove('Application Number')
      router.push('/', () => {})
    }


    return {
      assessAccess,
      progressAccess,
      alert,
      reprintOverride,
      dialogTitle,
      addExcavation,
      cancelExcavation,
      formatAmount,
      excavationAmount,
      getExcavation,
      excavationExist,
      getOPOtherDetails,
      addPool,
      cancelPool,
      poolAmount,
      poolExist,
      getOPOtherDetailsPool,
      goBack,
      reprint,
      addNewFee,
      newFeeName,
      newFeeAmount,
      saveData,
      reassess,
      rerelease,
      allowReprint,
    }
  }
})
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
    font-size: 2.2rem
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

  .access-title
    font-family: 'WorkSansThin'
    font-size: 3rem
    color: #CDF0EA

  .access-button
    font-family: 'WorkSansThin'
    font-size: 1.2rem
    text-decoration: underline4

  .dialog
    background-color: #003638 //055052

  .dialog-title
    height: auto
    padding: auto
    text-align: left
    font-size: 3rem
    font-family: 'WorkSansThin'
    color: #CDF0EA
    
  .dialog-label
    width: 100%
    text-align: center
    font-size: 1.6rem
    font-family: 'WorkSansThin'
    color: #CDF0EA 

  .dialog-amount
    // width: 100%
    // text-align: center
    margin-top: 1.1rem
    font-size: 1.8rem
    // font-family:'
    color: #CDF0EA 

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
    // color: #ffffff
    
</style>
