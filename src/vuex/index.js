
import ModuleCollection from './module-collection'
import {install, Vue} from './install'
import { forEachValue } from './util';

function getState(store, path) {
  return path.reduce((start, current) => {
    return start[current]
  }, store.state)
}

function installModule(store, rootState, path, rootModule) {
  if(path.length > 0) {
    let parent = path.slice(0, -1).reduce((start, current) => {
      return start[current]
    }, rootState)
    store._withCommiting(() => {
      Vue.set(parent, path[path.length - 1], rootModule.state)
    })
    // parent[path[path.length - 1]] = rootModule.state
  }
  let namespaced = store._modules.getNamespaced(path)
  rootModule.forEachMutation((mutationKey, mutationValue) => {
    store._mutations[namespaced + mutationKey] = (store._mutations[namespaced + mutationKey] || [])
    store._mutations[namespaced + mutationKey].push((payload) => {
      store._withCommiting(() => {
        mutationValue(getState(store, path), payload)
      })
      store.subscribes.forEach(fn => fn({type: mutationKey, payload}, store.state))
    })
  })
  rootModule.forEachAction((actionKey, actionValue) => {
    store._actions[namespaced + actionKey] = (store._actions[namespaced + actionKey] || [])
    store._actions[namespaced + actionKey].push((payload) => {
      let result = actionValue(store, payload)
      return result
    })
  })
  rootModule.forEachGetters((getterKey, getterValue) => {
    if(store._wrappedGetters[namespaced + getterKey]) {
      return console.warn(`dulicate key`)
    }
    store._wrappedGetters[namespaced + getterKey] = () => {
      return getterValue(getState(store, path))
    }
  })
  rootModule.forEachModule((moduleKey, module) => {
    installModule(store, rootState, path.concat(moduleKey), module)
  })
}

function resetStoreVM(store, state) {
  let oldVm = store._vm
  store.getters = {}
  const computed = {}
  const wrappedGetters = store._wrappedGetters
  forEachValue(wrappedGetters, (getterKey, getterValue) => {
    computed[getterKey] = getterValue
    Object.defineProperty(store.getters, getterKey, {
      get: () => {
        return store._vm[getterKey]
      }
    })
  })
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  if(store.strict) {
    store._vm.$watch(() => store._vm._data.$$state, () => {
      console.assert(store._commiting, 'outside mutation')
    }, {sync: true, deep: true})
  }
  if(oldVm) {
    Vue.nextTick(() => oldVm.$destroy())
  }
}

class Store {
  constructor(options) {
    this._modules = new ModuleCollection(options)
    this._mutations = Object.create(null)
    this._actions = Object.create(null)
    this.strict = options.strict

    this._commiting = false

    this._wrappedGetters = Object.create(null)
    this.plugins = options.plugins || []
    const state = this._modules.root.state
    this.subscribes = []
    installModule(this, state, [], this._modules.root)
    resetStoreVM(this, state)
    this.plugins.forEach(plugin => plugin(this))
  }
  _withCommiting(fn) {
    this._commiting = true
    fn()
    this._commiting = false
  }
  replaceState(state) {
    this._withCommiting(() => {
      this._vm._data.$$state = state
    })
  }
  commit = (type, payload) => {
    if(this._mutations[type]) {
      this._mutations[type].forEach(fn => fn.call(this, payload))
    }
  }
  dispatch = (type, payload) => {
    if(this._actions[type]) {
      return Promise.all(this._actions[type].map(fn => fn.call(this, payload)))
      // this._actions[type].forEach(fn => fn.call(this, payload))
    }
  }
  registerModule(path, module) {
    this._modules.register(path, module)
    installModule(this, this.state, path, module.newModule)
    resetStoreVM(this, this.state)
  }
  get state() {
    return this._vm._data.$$state
  }
  subscribe(fn) {
    this.subscribes.push(fn)
  }
}

export default {
  Store,
  install
}