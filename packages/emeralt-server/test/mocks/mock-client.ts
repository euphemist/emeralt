import RegClient from 'npm-registry-client'
import doasync from 'doasync'
import npmlog from 'npmlog'

export const createMockClient = (config = {}) => {
  const auth = {
    username: 'user1',
    password: 'user1',
    email: 'user1@user1.user1',
  }

  npmlog.level = 'silent'

  const client = doasync(
    new RegClient({
      ssl: {
        strict: false,
      },
      auth,
      log: npmlog,
      ...config,
    }),
  )

  client.config.auth = auth

  return { client, auth }
}