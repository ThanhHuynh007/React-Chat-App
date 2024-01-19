import { TextInput, Label, Button } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { HiOutlineMail, HiLockClosed, HiAtSymbol, HiSearch } from "react-icons/hi";
import { VscCheckAll } from "react-icons/vsc";
import { AiOutlineLogin } from "react-icons/ai";
import { Link, useNavigate } from 'react-router-dom';
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { auth, db, GetUserProfile, setUpRecaptcha, storage, userRegister, userUpdate } from '../../firebase';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import toast, { Toaster } from 'react-hot-toast';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import DarkMode from '../../components/DarkMode';
import { useSelector } from 'react-redux';

function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { user, status } = useSelector(state => state.users);

    useEffect(() => {
        if (user && !status) {
            navigate('/', {
                replace: true
            });
        }
    }, [user, navigate, status]);

    DarkMode();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        
        const displayName = e.target[1].value;
        const email = e.target[2].value;
        const password = e.target[3].value;
        const file = e.target[0].files[0];

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);

            const date = new Date().getTime();
            const storageRef = ref(storage, `${displayName + date}`);

            await uploadBytesResumable(storageRef, file).then(() => {
                getDownloadURL(storageRef).then(async (downloadURL) => {
                    try {
                        await updateProfile(res.user, {
                            displayName,
                            email,
                        });

                        await setDoc(doc(db, "users", username), {
                            name: username,
                            displayName,
                            username: username,
                            email: email,
                            description: "",
                            photoURL: downloadURL,
                            uid: res.user.uid,
                            timeStamp: serverTimestamp()
                        });

                        await setDoc(doc(db, "userChats", res.user.uid), {});

                        navigate("/");
                    } catch (err) {
                        console.error(err);
                        toast.error("Error creating user");
                    } finally {
                        setLoading(false);
                    }
                });
            });
        } catch (err) {
            console.error(err);
            toast.error("Error creating user");
            setLoading(false);
        }
    };

    const handleConvert = (e) => {
        var reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);

        reader.onload = () => {
            const img = document.getElementById('myimg');
            img.setAttribute('src', reader.result);
        };
        reader.onerror = error => {
            toast.error("Error: ", error);
        };
    }

    return (
        <div className="bg-bgLight2 dark:bg-bgDark1 w-full flex flex-row items-center p-4 justify-center h-screen">
            <div className='bg-bgLight1 dark:bg-bgDark2 relative xs:w-full xs:justify-center md:w-4/6 lg:w-3/4 xl:w-1/3 xs:h-full md:h-5/6 flex flex-col rounded-2xl'>
                <Link to="/login">
                    <AiOutlineLogin className="absolute m-4 h-6 w-6 top-1 left-0 text-black hover:bg-loginTextBgLight hover:text-white dark:text-white dark:hover:bg-bgLight2 dark:hover:text-black hover:rounded-2xl hover:cursor-pointer" />
                </Link>
                <div className='p-8 mt-10'>
                    <form onSubmit={handleSubmit} className="flex flex-col w-11/12 m-auto mt-6 gap-4">
                        <img className='w-28 h-28 m-auto object-cover rounded-full shadow-xl shadow-neutral-900' id='myimg' src='https://cdn-icons-png.flaticon.com/512/149/149071.png' alt="landing" />
                        <input type="file" id="file" onChange={(e) => { handleConvert(e) }} />
                        {/* <div className='w-full flex flex-col items-center'>
                            <TextInput
                                id="name"
                                type="username"
                                placeholder="Name"
                                required={true}
                                name={username}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div> */}
                        <div className='w-full flex flex-col items-center'>
                            <TextInput
                                id="username"
                                type="text"
                                placeholder="Username"
                                required={true}
                                username={username}
                                icon={HiAtSymbol}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className='w-full flex flex-col items-center'>
                            <TextInput
                                id="email"
                                type="email"
                                placeholder="Email"
                                required={true}
                                email={email}
                                icon={HiOutlineMail}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className='w-full flex flex-col items-center'>
                            <TextInput
                                id="password"
                                type="password"
                                placeholder="Password"
                                required={true}
                                password={password}
                                icon={HiLockClosed}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className='flex justify-center items-center my-5'>
                            <Button disabled={loading} type="submit">
                                Register
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}

export default Register