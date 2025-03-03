import { Session } from '@supabase/supabase-js'
import { useProfileQuery } from 'data/profile/profile-query'
import { useStore } from 'hooks'
import { auth } from 'lib/gotrue'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { GOTRUE_ERRORS, IS_PLATFORM } from './constants'

const DEFAULT_SESSION: any = {
  access_token: undefined,
  expires_at: 0,
  expires_in: 0,
  refresh_token: '',
  token_type: '',
  user: {
    aud: '',
    app_metadata: {},
    confirmed_at: '',
    created_at: '',
    email: '',
    email_confirmed_at: '',
    id: '',
    identities: [],
    last_signed_in_at: '',
    phone: '',
    role: '',
    updated_at: '',
    user_metadata: {},
  },
}

/* Auth Context */

export type AuthContext = { refreshSession: () => Promise<Session | null> } & (
  | {
      session: Session
      isLoading: false
    }
  | {
      session: null
      isLoading: boolean
    }
)

export const AuthContext = createContext<AuthContext>({
  session: null,
  isLoading: true,
  refreshSession: () => Promise.resolve(null),
})

export type AuthProviderProps = {}

export const AuthProvider = ({ children }: PropsWithChildren<AuthProviderProps>) => {
  const { ui, app } = useStore()
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for unverified GitHub users after a GitHub sign in
  useEffect(() => {
    async function handleEmailVerificationError() {
      const { error } = await auth.initialize()

      if (error?.message === GOTRUE_ERRORS.UNVERIFIED_GITHUB_USER) {
        ui.setNotification({
          category: 'error',
          message:
            'Please verify your email on GitHub first, then reach out to us at support@supabase.io to log into the dashboard',
        })
      }
    }

    handleEmailVerificationError()
  }, [])

  // Setup a possible existing session
  useEffect(() => {
    let mounted = true

    auth
      .getSession()
      .then(({ data: { session } }) => {
        if (mounted) {
          if (session) {
            setSession(session)
          }

          setIsLoading(false)
        }
      })
      .catch(() => {
        if (mounted) {
          setIsLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  // Keep the session in sync
  useEffect(() => {
    const {
      data: { subscription },
    } = auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return subscription.unsubscribe
  }, [])

  // Track telemetry for the current user
  useProfileQuery({
    onSuccess(profile) {
      ui.setProfile(profile)

      // [Joshen] Temp fix: For new users, the GET profile call also creates a default org
      // But because the dashboard's logged in state is using gotrue as the source of truth
      // the home page loads before the GET profile call completes (and consequently before the
      // creation of the default org). Hence why calling org load here
      app.organizations.load()
    },
    // Never rerun the query
    staleTime: Infinity,
    cacheTime: Infinity,
  })

  // Helper method to refresh the session.
  // For example after a user updates their profile
  const refreshSession = useCallback(async () => {
    const {
      data: { session },
    } = await auth.refreshSession()

    return session
  }, [])

  const value = useMemo(() => {
    if (IS_PLATFORM) {
      if (session) {
        return { session, isLoading: false, refreshSession } as const
      } else {
        return { session: null, isLoading: isLoading, refreshSession } as const
      }
    } else {
      return { session: DEFAULT_SESSION, isLoading: false, refreshSession } as const
    }
  }, [session, isLoading, refreshSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* Auth Utils */

export const useAuth = () => useContext(AuthContext)

export const useSession = () => useAuth().session

export const useUser = () => useSession()?.user ?? null

export const useIsLoggedIn = () => {
  const user = useUser()

  return user !== null
}
