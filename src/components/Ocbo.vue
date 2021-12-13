<template>
   <div class="ocbo-section">
      <img class="ocbologo" src="../assets/ocbologo.svg" alt="OCBO Logo">
    </div>
</template>

<script>
export default {
  name: 'OcboComponent',
  
  setup () {
    return {}
  }
}
</script>

<style lang="sass" scoped>
.ocbo-section
    position: fixed
    top: 1em
    right: 1em

.ocbologo
  // width: calc(26vw - 16rem)
  width: 14.3rem
  height: auto
  opacity: 0.1
</style>
