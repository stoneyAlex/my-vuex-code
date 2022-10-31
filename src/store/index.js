import Vue from 'vue'
// import Vuex from 'vuex'
// import logger from 'vuex/dist/logger'
import Vuex from '../vuex/index'

console.log(Vuex)

Vue.use(Vuex)

// const persitsPlugin = function(store) {
//   console.log(store)
//   store.subscribe(function(mutationType, rootState) {
//     console.log(mutationType, rootState)
//   })
// }

// const logger = function(store) {
//   let prevState = JSON.parse(JSON.stringify(store.state))
//   store.subscribe(function(mutationType, rootState) {
//     let nextState = JSON.parse(JSON.stringify(rootState))
//     console.log(mutationType, prevState)
//     console.log(mutationType, nextState)
//     prevState = nextState
//   })
// }

const persists = function(store) {
  let state = localStorage.getItem('VUEX')
  if(state) {
    store.replaceState(JSON.parse(state))
  }
  store.subscribe(function(mutationType, rootState) {
    localStorage.setItem('VUEX', JSON.stringify(rootState))
  })
}

const store = new Vuex.Store({
  strict: true,
  plugins: [
    persists
  ],
  state: {
    age: 13
  },
  getters: {
    myAge(state) {
      return state.age + 20
    }
  },
  mutations: {
    add(state, payload) {
      state.age += payload
    }
  },
  actions: {
    add({commit}, payload) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('add', payload)
          resolve()
        }, 1000);
      })
    }
  },
  modules: {
    a: {
      namespaced: true,
      getters: {
        myAge(state) {
          return state.age + 20
        }
      },
      state: {
        age: 200
      },
      mutations: {
        add(state, payload) {
          state.age += payload
        }
      },
      modules: {
        d: {
          namespaced: true,
          state: {
            age: 200
          },
          mutations: {
            add(state, payload) {
              state.age += payload
            }
          },
        }
      }
    },
    c: {
      namespaced: true,
      state: {
        age: 400
      },
      mutations: {
        add(state, payload) {
          state.age += payload
        }
      }
    }
  }
})

store.registerModule(['a', 'e'], {
  namespaced: true,
  state: {
    age: 'a100'
  },
  getters: {
    myAge(state) {
      return state.age + '200'
    }
  },
  mutations: {
    add(state) {
      return state.age += '!'
    }
  }
})

export default store