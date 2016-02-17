console.log('step 1')
setTimeout(function(){
  console.log('step 2')
}, 0)
process.nextTick(function(){
  console.log('step 2*')
})
console.log('step 1.5?')
