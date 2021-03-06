// Component imports
import { createApiAction } from '../actionCreators'
import actionTypes from '../actionTypes'





export const addNickname = (nickname, password) => createApiAction({
  actionType: actionTypes.ADD_NICKNAME,
  url: '/nicknames',
  method: 'post',
  data: {
    nickname,
    password,
  },
})





export const getUser = () => createApiAction({
  actionType: actionTypes.GET_USER,
  url: '/profile',
})





export const updateUser = (userId, data) => createApiAction({
  actionType: actionTypes.UPDATE_USER,
  url: `/users/${userId}`,
  method: 'put',
  data,
})
