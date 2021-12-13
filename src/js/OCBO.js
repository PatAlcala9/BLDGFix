const GenerateMD5 = require('md5')
// const Cryptr = require('cryptr')

const Chance = require('chance')
const aesjs = require('aes-js')

const chance = new Chance()
// const hasher = require('hashr')

// const currentDate = new Date()
// const day = currentDate.getDate()
// const month = currentDate.getMonth()
// const year = currentDate.getFullYear()

export function encrypt (Password) {
  const md51 = GenerateMD5(Password)
  let vowelCount = 0
  let cosnCount = 0

  // let p1 = md51.substr(0, 8)
  const p2 = md51.substr(8, 8)
  // let p3 = md51.substr(16, 8)
  const p4 = md51.substr(24, 8)

  for (let i = 0; i < Password.length; i++) {
    if (Password.charAt(i) === 'a' || Password.charAt(i) === 'A' || Password.charAt(i) === 'e' || Password.charAt(i) === 'E' || Password.charAt(i) === 'i' || Password.charAt(i) === 'I' || Password.charAt(i) === 'o' || Password.charAt(i) === 'O' || Password.charAt(i) === 'u' || Password.charAt(i) === 'U') {
      vowelCount++
    } else {
      cosnCount++
    }
  }

  const xtra = cosnCount.toString() + vowelCount.toString()
  const md52 = GenerateMD5(xtra)

  const p21 = md52.substr(0, 8)
  // let p22 = md52.substr(8, 8)
  const p23 = md52.substr(16, 8)
  // let p24 = md52.substr(24, 8)

  // return p2 + p22 + p1 + p21 + p4 + p24 + p3 + p23
  return p2 + p21 + p4 + p23
}

export function Compare (dbPassword, strPassword) {
  let result
  const estrPassword = GenerateMD5(strPassword)

  if (dbPassword === estrPassword) {
    result = true
  } else {
    result = false
  }
  return result
}

// const key = 'ÑªÙïjX¼n?¢+VB0ö'
// const iv = 'V.ø!»þâ['

// export function encryptAES (network) {
//   const key = new Cryptr('ÑªÙïjX¼n?¢+VB0ö')
//   // this.series++
//   // const key = new Cryptr(hasher.hash(day + '-' + month + '-' + year, 'binary'))
//   const part1 = key.encrypt(network)

//   function reverseString (str) {
//     let stringRev = ''
//     for (let i = 0; i < str.length; i++) {
//       stringRev = str[i] + stringRev
//     }
//     return stringRev
//   }

//   const reversed = reverseString(network)
//   const part2 = key.encrypt(reversed)
//   const combine = part2.substring(0, 4) + part1.substring(0, 4) + part2.substring(4, 8) + part1.substring(4)

//   return combine
// }

// export function decryptAES (network) {
//   const key = new Cryptr('ÑªÙïjX¼n?¢+VB0ö')
//   // const key = new Cryptr(hasher.hash(day + '-' + month + '-' + year, 'binary'))

//   const part1 = network.toString().substring(4, 8)
//   const part2 = network.toString().substring(12)
//   const combine = part1 + part2
//   const decrypted = key.decrypt(combine)

//   return decrypted
// }

export function encryptAES (network) {
  const decoy = chance.hash({ length: 9 })

  const key = []
  for (let i = 0; i < 32; i++) {
    const publickey = chance.integer({ min: 0, max: 9 })
    key.push(publickey)
  }

  const textBytes = aesjs.utils.utf8.toBytes(network)
  // eslint-disable-next-line new-cap
  const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(10))
  const encryptedBytes = aesCtr.encrypt(textBytes)
  const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes)

  const stringify = JSON.stringify(key)
  const openBrackRemoved = stringify.replace('[', 'x')
  const closeBrackRemoved = openBrackRemoved.replace(']', 'z')
  const encryptedKey = closeBrackRemoved.replace(/,/g, chance.character({ pool: 'dxghjkfpvc' }), -1)

  function reverseString (str) {
    let stringRev = ''
    for (let i = 0; i < str.length; i++) {
      stringRev = str[i] + stringRev
    }
    return stringRev
  }

  const decoy2 = chance.hash({ length: 9 })
  const decoy3 = chance.hash({ length: 9 })

  const reversed = reverseString(network)

  const textBytes3 = aesjs.utils.utf8.toBytes(reversed)
  // eslint-disable-next-line new-cap
  const aesCtr3 = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(10))
  const encryptedBytes3 = aesCtr3.encrypt(textBytes3)
  const encryptedHex2 = aesjs.utils.hex.fromBytes(encryptedBytes3)

  const firstHalfKey = encryptedKey.substring(0, encryptedKey.length / 2)
  const secondHalfKey = encryptedKey.substring(encryptedKey.length / 2, encryptedKey.length)

  return decoy + firstHalfKey + decoy2 + secondHalfKey + decoy3 + encryptedHex + encryptedHex2
}

export function decryptAES (network) {
  // const decoy = network.substring(0, 9)
  const firstHalfKey = network.substring(9, 41)
  // const decoy2 = network.substring(41, 50)
  const secondHalfKey = network.substring(50, 83)
  // const decoy3 = network.substring(83, 92)
  const encryptedHexFull = network.substring(92, network.length)
  const encryptedHex = encryptedHexFull.toString().substring(0, encryptedHexFull.length / 2)
  // const encryptedHex2 = encryptedHexFull.toString().substring(encryptedHexFull.length / 2, encryptedHexFull.length)

  const fullKey = firstHalfKey.replace(/\D/g, '') + secondHalfKey.replace(/\D/g, '')
  const arrayKey = [...fullKey]

  const publickey = arrayKey.map((x) => {
    return parseInt(x, 10)
  })

  const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex)
  // eslint-disable-next-line new-cap
  const aesCtr = new aesjs.ModeOfOperation.ctr(publickey, new aesjs.Counter(10))
  const decryptedBytes = aesCtr.decrypt(encryptedBytes)

  const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes)

  return decryptedText
}
