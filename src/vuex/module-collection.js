import Module from './module'
import { forEachValue } from "./util";

export default class ModuleCollection {
  constructor(options) {
    this.root = null
    this.register([], options)
  }
  getNamespaced(path) {
    let module = this.root
    return path.reduce((str, key) => {
      module = module.getChild(key)
      return str + (module.namespaced ? `${key}/` : '')
    }, '')
  }
  register(path, rootModule) {
    let newModule = new Module(rootModule)
    rootModule.newModule = newModule
    if(this.root == null) {
      this.root = newModule
    } else {
      let parent = path.slice(0, -1).reduce((start, current) => {
        console.log(start)
        return start.getChild(current)
      }, this.root)
      console.log(parent)
      parent.addChild(path[path.length - 1], newModule)
    }
    if(rootModule.modules) {
      forEachValue(rootModule.modules, (moduleName, moduleValue) => {
        this.register(path.concat(moduleName), moduleValue)
      })
    }
  }
}