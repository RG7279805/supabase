import * as Accordion from '@radix-ui/react-accordion'
import { useRouter } from 'next/router'
import React from 'react'
import NavigationMenuGuideListItems from './NavigationMenuGuideListItems'
import * as NavItems from './NavigationMenu.constants'

interface Props {
  id: string
  active: boolean
  collapsible?: boolean
  value?: string[]
}
const NavigationMenuGuideList: React.FC<Props> = ({ id, active, value }) => {
  const router = useRouter()

  const menu = NavItems[id]

  // get url
  const url = router.asPath

  // We need to decide how deep we want the menu to be for matching urls
  // if the links are really deep, we don't want to match all the way out
  // But we need to reach out further to make the structure of  /resources/postgres/  work
  // look at /resources/postgres/  vs /auth/phone-login for how these are different
  let firstLevelRoute
  if (url.includes('resources/postgres/')) {
    firstLevelRoute = url?.split('/')?.slice(0, 5)?.join('/')
  } else {
    firstLevelRoute = url?.split('/')?.slice(0, 4)?.join('/')
  }

  return (
    <Accordion.Root
      collapsible={true}
      key={id}
      type={value ? 'multiple' : 'single'}
      value={value ?? firstLevelRoute}
      className={[
        'transition-all ml-8 duration-150 ease-out',
        // enabled
        active && 'opacity-100 ml-0 delay-150',
        // level === 'home' && 'ml-12',

        // disabled
        // level !== 'home' && level !== id ? '-ml-8' : '',
        !active ? 'opacity-0 invisible absolute h-0 overflow-hidden' : '',
      ].join(' ')}
    >
      <NavigationMenuGuideListItems menu={menu} id={id} />
    </Accordion.Root>
  )
}

export default NavigationMenuGuideList
