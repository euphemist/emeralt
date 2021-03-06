import { Router } from 'express'

import { TEmeraltHandlerParams } from '@/types'
import { endpoints } from '@/constants'
import { useIf } from '@/utils'

export const searchHandler = ({ config }: TEmeraltHandlerParams) =>
  useIf(
    config.endpoints.search,
    Router().get(endpoints.search, (req, res) => {
      res.status(200).json({
        objects: [],
        total: 0,
        time: new Date().toString(),
      })
    }),
  )
