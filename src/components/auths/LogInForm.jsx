import {useState} from "react"
import {supabase} from "../../utils/client"

const LoginForm = () => { 
    const[email, setEmail] = useState("");
    const[password, setPwd] = useState("");
    const[error, setError] = useState(null);
    const handleLogin = async(e) => { 
        e.preventDefault()
        const {error} = await supabase.auth.signInWithPassword({
            email, password
        })
        if (error) { 
            setError(error.message);
        }
    }

    return (
        <form> 
            <h2>Login</h2>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" onChange={(e) => setPwd(e.target.value)} required />
            <button onClick={handleLogin}>Login</button>
            {error && <p>{error}</p>}
        </form>
    )
}


export default LoginForm;