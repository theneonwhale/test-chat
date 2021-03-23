import React, { Component } from 'react'
import Message from '../Message'
import Send from '../Send'
import './Chat.css'
import { socket } from './socket'

export default class Chat extends Component {
  socket = socket
  state = {
    currentUser: '',
    messages: [],
    message: '',
    isLogin: false,
    users: {},
  }

  componentDidMount() {
    this.socket.on('message', (data) => {
      if (this.state.isLogin) {
        this.setState(({ messages }) => {
          const newMessages = [...messages]
          if (newMessages.length > 50) {
            newMessages.shift()
          }
          return {
            messages: [...newMessages, { user: data.user, text: data.message }],
          }
        })
      }
    })
    this.socket.on('users', (data) => {
      this.setState({ users: data })
    })
  }

  changeMessage = (event) => {
    this.setState({ message: event.target.value })
  }

  sendMessage = (event) => {
    event.preventDefault()
    const { currentUser, message } = this.state
    if (message.trim().length) {
      this.socket.emit('message', {
        user: currentUser,
        message: message.trim(),
      })
      this.setState({ message: '' })
    }
  }

  inputName = () => {
    const user = this.state.currentUser
    if (user !== '') {
      this.setState({ currentUser: user, isLogin: true })
      this.socket.emit('change:name', user)
    }
  }

  changeName = (event) => {
    this.setState({ currentUser: event.target.value })
  }

  render() {
    const { currentUser, isLogin, message, messages, users } = this.state
    if (!isLogin) {
      return (
        <div className="login shadow-sm">
          <h4>Пожалуйста представьтесь</h4>
          <input
            className="form-control"
            value={currentUser}
            onChange={this.changeName}
            placeholder="Введите ваш никнейм"
          />
          <button className="btn btn-primary" onClick={this.inputName}>
            Войти
          </button>
        </div>
      )
    }
    return (
      <div className="chat">
        <div className="message-list">
          <div className="messages">
            {messages.map((item, key) => (
              <Message item={item} currentUser={currentUser} key={key} />
            ))}
          </div>
        </div>
        <Send
          value={message}
          onChange={this.changeMessage}
          onSend={this.sendMessage}
        />
        <ul className="list-group">
          {Object.values(users).map((el, i) => (
            <li className="list-group-item" key={i}>
              {el}
            </li>
          ))}
        </ul>
      </div>
    )
  }
}
