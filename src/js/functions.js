export function isNumberKey (evt) {
  const charCode = (evt.which) ? evt.which : event.keyCode
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false
  }
  return true
}

export function fullName (firstname, middlename, lastname, occfirstname, occmiddlename, occlastname) {
  let result
  let fname
  let mname
  let lname

  if (occfirstname === null) {
    if (firstname === '') {
      fname = ''
    } else {
      fname = firstname + ' '
    }
  } else {
    fname = occfirstname + ' '
  }
  if (occmiddlename === null) {
    if (middlename === '') {
      mname = ''
    } else {
      mname = middlename + '. '
    }
  } else {
    mname = occmiddlename + '. '
  }
  if (occlastname === null) {
    if (lastname === '') {
      mname = ''
    } else {
      lname = lastname
    }
  } else {
    lname = occlastname
  }

  // eslint-disable-next-line prefer-const
  result = fname + mname + lname
  return result
}

export function fullAddress (block, lot, address, occblock, occlot, occaddress) {
  let result
  let blk
  let lt
  let addrss

  if (occblock === 0) {
    if (block === 0) {
      blk = ''
    } else {
      blk = 'Block ' + block + ' '
    }
  } else {
    blk = 'Block ' + occblock + ' '
  }

  if (occlot === 0) {
    if (lot === 0) {
      lt = ''
    } else {
      lt = 'Lot ' + lot + ' '
    }
  } else {
    lt = 'Lot ' + occlot + ' '
  }

  if (occaddress === 0) {
    if (address === 0) {
      addrss = ''
    } else {
      addrss = address
    }
  } else {
    addrss = occaddress
  }

  // eslint-disable-next-line prefer-const
  result = blk + lt + addrss
  return result
}

// const aLength = await this.address === null ? 0 : this.address.length

export function isNotEmpty (object) {
  let result
  const elength = object === null ? 0 : object.length

  if (elength === 0) {
    result = false
  } else {
    result = true
  }

  return result
}

export function constructApplication (year, series, division) {
  let result

  if (division === 'Building') {
    if (series.length === 1) {
      result = (year + '-00000' + series).toString()
    } else if (series.length === 2) {
      result = (year + '-0000' + series).toString()
    } else if (series.length === 3) {
      result = (year + '-000' + series).toString()
    } else if (series.length === 4) {
      result = (year + '-00' + series).toString()
    } else if (series.length === 5) {
      result = (year + '-0' + series).toString()
    } else if (series.length === 6) {
      result = (year + '-' + series).toString()
    }
  }

  return result
}

export function todayDate () {
  const now = new Date()
  const month = now.getMonth()
  const day = now.getDate()
  const year = now.getFullYear()
  const hour = now.getHours()
  const minutes = now.getMinutes()

  const fixMonth = month < 10 ? '0' + month : month
  const fixDay = day < 10 ? '0' + day : day

  return year + '/' + fixMonth + '/' + fixDay + ' ' + hour + ':' + minutes
}
