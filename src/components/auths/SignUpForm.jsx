import {useState} from "react"
import { supabase } from "../../utils/client"

export default function SignUpForm() { 
    const[email, setEmail] = useState("");
    const[pwd, setPwd] = useState("");
    const[error, setError] = useState(null);

    const handleSignUp = async(e) => { 
        e.preventDefault(); 
        const {error} = await supabase.auth.signUp( { 
            email, password:pwd
        })
        if (error) { 
            setError(error.message);
        } else { 
            alert("Check your email for the confirmation link");
        }
    }

    return (
        <form> 
            <h2>Sign Up</h2>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" onChange={(e) => setPwd(e.target.value)} required />
            <button onClick={handleSignUp}>Sign Up</button>
            {error && <p>{error}</p>}
        </form>
    ) 
}