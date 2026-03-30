import { io } from 'socket.io-client'

let socket = null

function _serverUrl() {
  // backend default port 4000 used in dev
  try {
    const origin = window.location.origin
    return origin.replace(/:\d+$/, ':4000')
  } catch (e) {
    return 'http://localhost:4000'
  }
}

function connect() {
  if (socket) return socket
  const url = _serverUrl()
  socket = io(url, { transports: ['websocket'] })
  socket.on('connect', () => {
    console.info('Socket connected', socket.id)
  })
  socket.on('disconnect', (reason) => {
    console.info('Socket disconnected', reason)
  })
  return socket
}

function joinOrg(orgId) {
  if (!orgId) return
  const s = connect()
  s.emit('joinOrg', orgId)
}

function leaveOrg(orgId) {
  if (!socket || !orgId) return
  socket.emit('leaveOrg', orgId)
}

function on(event, cb) {
  const s = connect()
  s.on(event, cb)
}

function off(event, cb) {
  if (!socket) return
  if (cb) socket.off(event, cb)
  else socket.removeAllListeners(event)
}

function emit(event, payload) {
  if (!socket) return
  socket.emit(event, payload)
}

function disconnect() {
  if (!socket) return
  try { socket.disconnect() } catch (e) { /* ignore */ }
  socket = null
}

export default { connect, joinOrg, leaveOrg, on, off, emit, disconnect }
