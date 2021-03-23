<template>
  <div id="app">
    <loading :active.sync="loading" :is-full-page="true"></loading>
    <div class="bubbles-container">
      <div class="container" v-for="user in orderedUsers" :key="user.name">
        <div
          class="item"
          :style="{
            '--size': (150 - 70) * getDebtPercentage(user.name) + 70 + 'px',
          }"
        >
          <img class="user-image" :src="user.image" />
          <div class="information">
            <span>${{ user.debt }}</span>
          </div>
        </div>
        <div
          class="circle"
          v-for="i in [1, 2, 3, 4]"
          :key="i"
          :style="{
            '--animation-delay': 4 - i,
            '--background-color': user.color,
            '--size': (150 - 70) * getDebtPercentage(user.name) + 70 + 'px',
          }"
        ></div>
      </div>
    </div>
    <div>
      <div>
        <div class="input-container">
          <input type="number" class="input" v-model="cost" />
          <button class="add" @click="addCost">+</button>
        </div>
        <div class="radio-container">
          <label
            for="mutual"
            :class="['radio-label', { selected: type === 'mutual' }]"
            >Debemos</label
          >
          <input type="radio" id="mutual" value="mutual" v-model="type" /><br />
          <label
            for="self"
            :class="['radio-label', { selected: type === 'self' }]"
            >Pagué</label
          >
          <input type="radio" id="self" value="self" v-model="type" /><br />
           <label
            for="return"
            :class="['radio-label', { selected: type === 'return' }]"
            >Devolví</label
          >
          <input type="radio" id="return" value="return" v-model="type" /><br />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import db from "./interactors/firestore";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
export default {
  name: "App",
  components: {
    Loading,
  },
  methods: {
    addCost() {
      this.loading = true;
      const currentUser = this.users.find(
        (user) => user.name === window.location.pathname.slice(1)
      );
      let newUsers;
      if (this.type === "mutual") {
        newUsers = [
          { ...this.users[0], debt: this.users[0].debt + this.cost / 2 },
          { ...this.users[1], debt: this.users[1].debt + this.cost / 2 },
        ];
      } else if (this.type === "self") {
        newUsers = [
          {
            ...currentUser,
            debt: Math.max(currentUser.debt - this.cost, 0),
          },
          ...this.users
            .filter((user) => user.name !== currentUser.name)
            .map((user) => ({
              ...user,
              debt: user.debt + -Math.min(currentUser.debt - this.cost, 0) / 2,
            })),
        ];
      } else if (this.type === 'return') {
         newUsers = [
          {
            ...currentUser,
            debt: Math.max(currentUser.debt - this.cost, 0),
          },
          ...this.users
            .filter((user) => user.name !== currentUser.name)
            .map((user) => ({
              ...user,
              debt: user.debt + -Math.min(currentUser.debt - this.cost, 0),
            })),
        ];
      }
      const ref = db.doc("users/SYQutOmnAPgYl0mdZ2ib");
      return db
        .runTransaction((transaction) => {
          return transaction.get(ref).then(() => {
            transaction.update(ref, this.serializeUsers(newUsers));
          });
        })
        .then(() => {
          this.cost = null;
        });
    },
    getDebtPercentage(userName) {
      const userDebt = this.users.find((user) => user.name === userName).debt;
      return this.totalDebt ? userDebt / this.totalDebt : 0;
    },
    serializeUsers(users) {
      return users.reduce(
        (acc, value) => ({ ...acc, [value.name]: value }),
        {}
      );
    },
  },
  computed: {
    totalDebt() {
      return this.users.reduce((acc, user) => acc + user.debt, 0);
    },
    orderedUsers() {
      return [
        this.users.find((user) => user.name === this.userName),
        ...this.users.filter((user) => user.name !== this.userName),
      ];
    },
  },
  mounted() {
    const ref = db.doc("users/SYQutOmnAPgYl0mdZ2ib");
    ref.onSnapshot((snap) => {
      this.users = Object.values(snap.data());
      this.loading = false;
    });
    this.userName = window.location.pathname.slice(1);
  },
  data() {
    return {
      cost: null,
      loading: true,
      userName: null,
      type: "self",
      users: [],
    };
  },
};
</script>

<style>
body,
html {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  overflow: hidden;
  background: #416283;
  height: 100vh;
  color: white;
}

.bubbles-container {
  display: flex;
}

@keyframes scaleIn {
  from {
    transform: scale(0.5, 0.5);
    opacity: 0.5;
  }
  to {
    transform: scale(2.5, 2.5);
    opacity: 0;
  }
}

.container {
  width: 600px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.circle {
  border-radius: 50%;
  width: var(--size);
  height: var(--size);
  position: absolute;
  opacity: 0;
  background-color: var(--background-color);
  animation: scaleIn 4s infinite cubic-bezier(0.36, 0.11, 0.89, 0.32);
  animation-delay: var(--animation-delay) s;
}

.item {
  z-index: 100;
  position: relative;
  padding: 5px;
  width: var(--size);
}

.user-image {
  width: var(--size);
  overflow: hidden;
  border-radius: 100%;
}

.information {
  width: 100%;
  position: absolute;
}

.add {
  margin-left: 5px;
  border-radius: 4px;
  outline: 0;
  border: 1px solid white;
  color: white;
  background-color: transparent;
}

.input {
  background: transparent;
  border: 0;
  border-bottom: 1px solid white;
  outline: 0;
  border-radius: 0;
  color: white;
}

.input-container {
  margin-bottom: 5px;
}

.radio-label {
  border-bottom: 1px solid transparent;
}

.radio-label + input {
  opacity: 0;
}

.selected {
  border-color: white;
}

.radio-container {
  margin: 10px 5px;
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
