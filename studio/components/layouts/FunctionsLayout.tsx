import Link from 'next/link'
import { FC, ReactNode, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Button, IconExternalLink, IconCode, Modal, IconTerminal } from 'ui'

import { checkPermissions, useParams, withAuth } from 'hooks'
import FunctionsNav from '../interfaces/Functions/FunctionsNav'
import BaseLayout from 'components/layouts'
import NoPermission from 'components/ui/NoPermission'
import { PermissionAction } from '@supabase/shared-types/out/constants'
import { TerminalInstructions } from 'components/interfaces/Functions'
import { useEdgeFunctionQuery } from 'data/edge-functions/edge-function-query'
import { useEdgeFunctionsQuery } from 'data/edge-functions/edge-functions-query'

interface Props {
  title?: string
  children?: ReactNode
}

const FunctionsLayout: FC<Props> = ({ title, children }) => {
  const { functionSlug, ref } = useParams()
  const [showTerminalInstructions, setShowTerminalInstructions] = useState(false)
  const { data: functions, isLoading } = useEdgeFunctionsQuery({ projectRef: ref })
  const { data: selectedFunction } = useEdgeFunctionQuery({ projectRef: ref, slug: functionSlug })

  const canReadFunctions = checkPermissions(PermissionAction.FUNCTIONS_READ, '*')
  if (!canReadFunctions) {
    return (
      <BaseLayout title={title || 'Edge Functions'} product="Edge Functions">
        <main style={{ maxHeight: '100vh' }} className="flex-1 overflow-y-auto">
          <NoPermission isFullPage resourceText="access your project's edge functions" />
        </main>
      </BaseLayout>
    )
  }

  const name = selectedFunction?.name || ''
  const hasFunctions = (functions ?? []).length > 0
  const centered = !hasFunctions

  return (
    <BaseLayout isLoading={isLoading} title={title || 'Edge Functions'} product="Edge Functions">
      {centered ? (
        <>
          <div className="mx-auto max-w-5xl py-24 px-5">
            <div
              className="item-center 
            flex 
            flex-col
            justify-between 
            gap-y-4 
            xl:flex-row"
            >
              <div className="flex items-center gap-3">
                <div
                  className={[
                    'h-6 w-6 rounded border border-brand-600 bg-brand-300',
                    'flex items-center justify-center text-brand-900',
                  ].join(' ')}
                >
                  <IconCode size={14} strokeWidth={3} />
                </div>
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl text-scale-1200">Edge Functions</h1>
                  <p className="mt-1 text-scale-1000">Beta</p>
                </div>
              </div>
            </div>

            {children}
          </div>
        </>
      ) : (
        <div className="flex h-full flex-grow flex-col py-6">
          <div
            className={[
              'mx-auto flex w-full flex-col transition-all',
              '1xl:px-28 gap-4 px-5 lg:px-16 xl:px-24 2xl:px-32',
            ].join(' ')}
          >
            <div className="item-center flex flex-col justify-between gap-y-4 xl:flex-row">
              <div className="flex items-center gap-3 w-full">
                <div
                  className={[
                    'h-6 w-6 rounded border border-brand-600 bg-brand-300',
                    'flex items-center justify-center text-brand-900',
                  ].join(' ')}
                >
                  <IconCode size={14} strokeWidth={3} />
                </div>

                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4">
                    <Link href={`/project/${ref}/functions`}>
                      <h1 className="cursor-pointer text-2xl text-scale-1200 transition-colors hover:text-scale-1100">
                        Edge Functions
                      </h1>
                    </Link>
                    <p className="mt-1 text-scale-1000">Beta</p>
                    {name && (
                      <div className="mt-1.5 flex items-center space-x-4">
                        <span className="text-scale-1000">
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            shapeRendering="geometricPrecision"
                          >
                            <path d="M16 3.549L7.12 20.600"></path>
                          </svg>
                        </span>
                        <h5 className="text-lg text-scale-1200">{name}</h5>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="default"
                      icon={<IconTerminal size={14} strokeWidth={1.5} />}
                      onClick={() => setShowTerminalInstructions(true)}
                    >
                      Terminal Instructions
                    </Button>
                    <Link href="https://supabase.com/docs/guides/functions">
                      <a target="_link">
                        <Button
                          type="default"
                          icon={<IconExternalLink size={14} strokeWidth={1.5} />}
                        >
                          Documentation
                        </Button>
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {selectedFunction !== undefined && <FunctionsNav item={selectedFunction} />}
          </div>
          <div
            className={[
              'mx-auto flex h-full w-full flex-grow flex-col transition-all',
              '1xl:px-28 gap-4 px-5 lg:px-16 xl:px-24 2xl:px-32',
            ].join(' ')}
          >
            {children}
          </div>
        </div>
      )}

      <Modal
        size="xlarge"
        visible={showTerminalInstructions}
        onCancel={() => setShowTerminalInstructions(false)}
        header={<h3>Deploying an edge function to your project</h3>}
        customFooter={
          <div className="w-full flex items-center justify-end">
            <Button type="primary" size="tiny" onClick={() => setShowTerminalInstructions(false)}>
              Confirm
            </Button>
          </div>
        }
      >
        <div className="py-4">
          <TerminalInstructions removeBorder />
        </div>
      </Modal>
    </BaseLayout>
  )
}

export default withAuth(observer(FunctionsLayout))
