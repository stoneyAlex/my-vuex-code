<template>
  <div id="app">
    stoney的年龄{{$store.state.age}} <br />
    alex的年龄{{$store.getters.myAge}} <br />
    alex的年龄{{$store.getters.myAge}} <br />
    alex的年龄{{$store.getters.myAge}} <br />
    <button @click="$store.commit('a/d/add', 3)">调用mutation</button>
    <button @click="actionAdd">调用action</button>

    <div>
      a模块
       a的age是： {{$store.state.a.age}}
       a中的计算属性是： {{$store.getters['myAge']}}
    </div>
    <div>
      c模块
       c的age是： {{$store.state.c.age}}
    </div>
    <div>
      d模块
       d的age是： {{$store.state.a.d.age}}
    </div>
    <div>
      e模块
       e的age是： {{$store.state.a.e.age}}
       e的计算age是： {{$store.getters['a/e/myAge']}}
       <button @click="$store.commit('a/e/add', 5)">更改e</button>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log(this.$store)
  },
  methods: {
    actionAdd() {
      this.$store.dispatch("add", 5).then(() => {
        console.log('ok')
      })
    }
  }
}
</script>

<style>

</style>
