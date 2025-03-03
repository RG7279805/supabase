import dayjs from 'dayjs'
import { FC, useState } from 'react'
import { useRouter } from 'next/router'
import { observer } from 'mobx-react-lite'
import { IconCheck, IconClipboard } from 'ui'
import * as Tooltip from '@radix-ui/react-tooltip'

import { useParams, useStore } from 'hooks'
import Table from 'components/to-be-cleaned/Table'
import { EdgeFunctionsResponse } from 'data/edge-functions/edge-functions-query'

interface Props {
  function: EdgeFunctionsResponse
}

const EdgeFunctionsListItem: FC<Props> = ({ function: item }) => {
  const router = useRouter()
  const { ui } = useStore()
  const { ref } = useParams()
  const [isCopied, setIsCopied] = useState(false)

  // get the .co or .net TLD from the restUrl
  const restUrl = ui.selectedProject?.restUrl
  const restUrlTld = new URL(restUrl as string).hostname.split('.').pop()
  const functionUrl = `https://${ref}.functions.supabase.${restUrlTld}/${item.slug}`

  return (
    <Table.tr
      key={item.id}
      onClick={() => {
        router.push(`/project/${ref}/functions/${item.slug}/details`)
      }}
    >
      <Table.td className="">
        <div className="flex items-center gap-2">
          <p className="text-sm text-scale-1200">{item.name}</p>
        </div>
      </Table.td>
      <Table.td className="">
        <div className="text-xs text-scale-1100 flex gap-2 items-center truncate">
          <p className="font-mono truncate hidden md:inline">{functionUrl}</p>
          <button
            type="button"
            className="text-scale-900 hover:text-scale-1200 transition"
            onClick={(event: any) => {
              function onCopy(value: any) {
                setIsCopied(true)
                navigator.clipboard.writeText(value).then()
                setTimeout(function () {
                  setIsCopied(false)
                }, 3000)
              }
              event.stopPropagation()
              onCopy(functionUrl)
            }}
          >
            {isCopied ? (
              <div className="text-brand-900">
                <IconCheck size={14} strokeWidth={3} />
              </div>
            ) : (
              <div className="relative">
                <div className="block">
                  <IconClipboard size={14} strokeWidth={1.5} />
                </div>
              </div>
            )}
          </button>
        </div>
      </Table.td>
      <Table.td className="hidden 2xl:table-cell">
        <p className="text-scale-1100">{dayjs(item.created_at).format('DD MMM, YYYY HH:mm')}</p>
      </Table.td>
      <Table.td className="lg:table-cell">
        <Tooltip.Root delayDuration={0}>
          <Tooltip.Trigger>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-scale-1000">{dayjs(item.updated_at).fromNow()}</p>
            </div>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="bottom">
              <Tooltip.Arrow className="radix-tooltip-arrow" />
              <div
                className={[
                  'rounded bg-scale-100 py-1 px-2 leading-none shadow',
                  'border border-scale-200',
                ].join(' ')}
              >
                <span className="text-xs text-scale-1200">
                  Last updated on {dayjs(item.updated_at).format('DD MMM, YYYY HH:mm')}
                </span>
              </div>
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Table.td>
      <Table.td className="lg:table-cell">
        <p className="text-scale-1100">{item.version}</p>
      </Table.td>
    </Table.tr>
  )
}

export default observer(EdgeFunctionsListItem)
