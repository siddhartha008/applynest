import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import {supabase} from './utils/client'

import Dashboard from './pages/Dashboard/Dashboard'
import AuthPage from './pages/AuthPage/AuthPage'
import Search from "./pages/Search/Search.jsx";
import Export from "./pages/Export/export.jsx";
import Profile from  "./pages/Profile/profile.jsx";
import PostDetail from "./pages/Forum/PostDetail.jsx";

import './App.css'
import Forum from "./pages/Forum/Forum.jsx";


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
    <BrowserRouter>
    <div>
      {user ? (
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/search" element={<Search user={user} />} />
          <Route path="/export" element={<Export  user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/forum" element={<Forum user={user} />} />
          <Route path="/post/:postId" element={<PostDetail user={user} />} />
        </Routes>
      ) : (
        <AuthPage />
      )}
    </div>
  </BrowserRouter>
  )
}

export default App;