import { useEffect, useState } from "react";

import {supabase} from './utils/client'
import './App.css'
import Dashboard from './pages/Dashboard/Dashboard'
import AuthPage from './pages/AuthPage/AuthPage'
import SignUpForm from './components/auths/SignUpForm'
import LogInForm from './components/auths/LogInForm'

function App() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    });
  
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    });
  
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      {
        user ? (
          <Dashboard/>
        ) : (
        <>
            <LogInForm/>
            <SignUpForm/>
          </>
        )
      }
    </div>
  )
}

export default App