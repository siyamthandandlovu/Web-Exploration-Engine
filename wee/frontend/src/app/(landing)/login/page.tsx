'use client'
import React from "react";
import ThemeSwitch from "../../components/ThemeSwitch";
import { FlipWords } from "../../components/FlipWords";

export default function Login() {
    return (
        <div className='h-screen'>
            login!!!!!
            <ThemeSwitch/>
            <div className="bg-jungleGreen-200 dark:bg-jungleGreen-800">
                Test light darkmode
            </div>
            Efficiently
            <FlipWords words={['categorize', 'analyze', 'extract']}/>
            data from the web
        </div>
    )
}