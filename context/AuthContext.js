'use client'
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useState, useEffect, useContext } from "react"

const AuthContect = React.createContext();

export function useAuth() {
    return useContext(AuthContect);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userDataObj, setUserDataObj] = useState(null);
    const [loading, setLoading] = useState(true);

    function signUp(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    function logout() {
        setUserDataObj(null)
        setCurrentUser(null)
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async user => {
            try {
                setLoading(true)
                setCurrentUser(user)
                if (!user) {
                    console.log('No user found')
                    return;
                }

                console.log('Fetching User data.')
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                let firebaseData = {}
                if (docSnap.exists()) {
                    console.log('Found user data')
                    firebaseData = docSnap.data();
                    console.log(firebaseData);
                }
                setUserDataObj(firebaseData);
            } catch (error) {
                console.log(error.message);
            } finally {
                setLoading(false)
            }
        })

        return unsubscribe;
    }, [])

    const value = {
        currentUser,
        userDataObj,
        setUserDataObj,
        signUp,
        logout,
        login,
        loading
    }

    return (
        <AuthContect.Provider value={value}>
            {children}
        </AuthContect.Provider>
    )
}
