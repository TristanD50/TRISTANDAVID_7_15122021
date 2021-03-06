import { createStore } from 'vuex'
// importer moment pour date/heure des posts

// Vuex est une bibliothèque de gestion d'état pour les applications Vue. js. Au centre de chaque application Vuex se trouve un "store", qui est essentiellement un objet contenant l'état de l'application.

const axios = require('axios')
import moment from "moment"
moment.locale("fr")

const instance = axios.create({
  baseURL: 'http://localhost:3000/api',
})

let user = localStorage.getItem('user')
if (!user) {
  user = {
    userId: -1,
    token: '',
  }
} else {
  try {
    user = JSON.parse(user)
    instance.defaults.headers.common.Authorization = `Bearer ${user.token}`
  } catch (ex) {
    user = {
      userId: -1,
      token: '',
    }
  }
}

const store = createStore({
  // Etat des données de l'application à l'intérieur de l'objet "state"
  state: {

    status: '',

    user: user,

    userInfos: {
      userId: '',
      isAdmin: '',
      nom: '',
      prenom: '',
      email: '',
      username: ''
    },

    postsInfos: [],

    reactionInfos: {
      reactions: '',
    },

    commentInfos: {
      description: '',
      postId: ''
    }

  },

  // Les mutations doivent être synchrones. Elles vont prendre les paramètres en compte et les placer dans le state, elles sont appelées avec "store.commit"
  // La seule façon de réellement changer l'état du store est de commettre une mutation. Les mutations Vuex sont très similaires aux événements: chaque mutation a un type et un gestionnaire. La fonction de gestionnaire est l'endroit où nous effectuons les modifications d'état réelles, et elle recevra l'état comme premier argument.
  
  mutations: {

    setStatus: function (state, status) {
      state.status = status
    },
    logUser: function (state, user) {
      instance.defaults.headers.common.Authorization = `Bearer ${user.token}`
      localStorage.setItem('user', JSON.stringify(user))
      state.user = user
    },
    userInfos: function (state, userInfos) {
      state.userInfos = userInfos
    },
    logout: function (state) {
      state.user = {
        userId: -1,
        token: '',
      }
      localStorage.removeItem('user')
    },
    addPost: function (state, post) {
      state.postsInfos.push(post)
    },
    reactionInfos: function (state, reactionInfos) {
      state.reactionInfos = reactionInfos
    },
    commentInfos: function (state, commentInfos) {
      state.commentInfos = commentInfos
    }
  },

  // Les actions permettent de changer les données en fonction des saisies de l'utilisateur dans les views, elles peuvent être asynchrones (ex: si on va chercher des données depuis une DB, on va devoir attendre le retour serveur -> seulement depuis l'action, pas la mutation)
  actions: {

    login: ({ commit }, userInfos) => {
      commit('setStatus', 'loading')
      return new Promise((resolve, reject) => {
        instance.post('/auth/login', userInfos)
          .then(function (response) {
            commit('setStatus', '')
            commit('logUser', response.data)
            resolve(response.data.message)
          })
          .catch(function (error) {
            commit('setStatus', 'error_login')
            reject(error)
          })
      })
    },

    createAccount: ({ commit }, userInfos) => {
      commit('setStatus', 'loading')
      return new Promise((resolve, reject) => {
        instance.post('/auth/signup', userInfos)
          .then(function (response) {
            resolve(response.data.message)
          })
          .catch(function (error) {
            commit('setStatus', 'error_create')
            reject(error)
          })
      })
    },

    getUserInfos: ({ commit }, id) => {
      return new Promise((resolve, reject) => {
        instance.get('/auth/' + id)
          .then((response) => {
            commit('userInfos', response.data)
            resolve(response)
          })
          .catch((error) => {
            console.error(error),
              reject(error)
          })
      })
    },

    getAllUsers: ({ commit }) => {
      return new Promise((resolve, reject) => {
        instance.get('/auth/')
          .then((response) => {
            commit(response.data)
            resolve(response)
          })
          .catch((error) => {
            console.error(error),
              reject(error)
          })
      })
    },

    supressProfile: ({ commit }, id) => {
      return new Promise((resolve, reject) => {
        instance.delete('/auth/' + id)
          .then((response) => {
            commit('setStatus', 'deleted')
            alert(response.data.message)
            resolve(response)
          })
          .catch((error) => {
            console.error(error)
            reject(error)
          })
      })
    },

    createPost: ({ commit }, data) => {
      return new Promise((resolve, reject) => {
        instance.post('/post', data)
          .then((response) => {
            alert(response.data.message)
            resolve(response.data)
          })
          .catch((error) => {
            console.error(error),
              reject(error)
          })
      })
    },

    getAllPosts: ({ commit, dispatch, state }) => {
      return new Promise((resolve, reject) => {
        instance.get('/post')
          .then(async (response) => {
            const posts = response.data
            for(const post of posts){
              post.createdAt = moment(post.createdAt).format(' Do MMMM YYYY, HH:mm:ss')
              const comments = await dispatch("getPostComment", post.id)
              post.comments = comments
              const reactions = await dispatch("getPostReaction", post.id)
              post.reactions = reactions
              let liked = false
              for(const reaction of reactions){
                if(reaction.userId == state.user.userId){
                  liked = true
                }
              }
              post.liked = liked
              commit('addPost', post)
            }
            resolve(posts)
          })
          .catch((error) => {
            console.error(error)
            reject(error)
          })
      })
    },

    deletePost: ({ commit }, postid) => {
      return new Promise((resolve, reject) => {
        instance.delete('/post/' + postid)
          .then((response) => {
            alert(response.data.message)
            resolve(response)
          })
          .catch((error) => {
            console.error(error),
              reject(error)
          })
      })
    },
    
    addReaction: ({ commit }, postId) => {
      return new Promise((resolve, reject) => {
        instance.post('/reaction/', { postId })
          .then((response) => {
            alert(response.data.message)
            resolve(response)
          })
          .catch((error) => {
            console.error(error),
              reject(error)
          })
      })
    },

    getPostReaction: ({ commit }, postid) => {
      return new Promise((resolve, reject) => {
        instance.get('/reaction/' + postid)
          .then((response) => {
            commit('reactionInfos', response.data)
            resolve(response.data)
          })
          .catch((error) => {
            console.error(error),
              reject(error)
          })
      })
    },

    deleteReaction: ({ commit }, postid) => {
      return new Promise((resolve, reject) => {
        instance.delete('/reaction/' + postid)
          .then((response) => {
            alert(response.data.message)
            resolve(response.data)
          })
          .catch((error) => {
            console.error(error),
              reject(error)
          })
      })
    },

    getPostComment: ({ commit }, postid) => {
      return new Promise((resolve, reject) => {
        instance.get('/comment/' + postid)
          .then((response) => {
            commit('commentInfos', response.data)
            resolve(response.data)
          })
          .catch((error) => {
            console.error(error),
              reject(error)
          })
      })
    },

    createComment: ({ commit }, {postId, description}) => {
      return new Promise((resolve, reject) => {
        instance.post('/comment/' + postId, { description })
          .then((response) => {
            alert(response.data.message)
            resolve(response.data)
          })
          .catch((error) => {
            console.error(error),
              reject(error)
          })
      })
    },

    deleteComment: ({ commit }, commentId) => {
      return new Promise((resolve, reject) => {
        instance.delete('/comment/' + commentId)
          .then((response) => {
            alert(response.data.message)
            resolve(response.data)
          })
          .catch((error) => {
            console.error(error),
              reject(error)
          })
      })
    },
  }
})

export default store