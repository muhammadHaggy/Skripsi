import React, { useEffect } from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsChevronDown,BsArrowLeft,BsBusFront  } from "react-icons/bs";
import {Modal} from "../components/Modal";
import axios from 'axios';
import Button from '../components/Button';
import notFound from "../images/notFound.jpg";
import jwtDecode from "jwt-decode";



export default function NotFound(){
    let navigate = useNavigate();
    let [modalKeluar, setModalKeluar] = useState(false);
    let [modalKeluarSukses, setModalKeluarSukses] = useState(false);
    let [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUser, setIsUser] = useState(null);
    const [userRole, setUserRole] = useState("")
    const [userEmail, setUserEmail] = useState("")
    const [username, setUsername] = useState("")


    const handleLogout = () => {
        delete axios.defaults.headers.common["Authorization"];
        sessionStorage.clear();
        navigate("/login");
    };

    const navigateLogo = () => {
        if (isUser !== null){
            navigate("/");
        }else{
            navigate("/login");
        }
    }

    
    useEffect(() => {
        try {
          const token = sessionStorage.getItem('token');
          
          if (token) {
            const decodedToken = jwtDecode(token);
            
            setUserEmail(decodedToken.email);
            setUsername(decodedToken.username);
            setUserRole(decodedToken.role.name);
            setIsUser(decodedToken.role.name === 'User');
          }
        } catch (error) {
          console.error('Failed to decode token:', error);
        }
      }, []); 
    return(
        <>
        <Modal 
            variant="danger" 
            isOpen={modalKeluar} 
            closeModal={() => setModalKeluar(false)} 
            title="Keluar" 
            description="Anda yakin ingin keluar dari akun?" 
            rightButtonText="Yakin" 
            leftButtonText="Batal"
            onClickRight={() => {
                handleLogout()
                setModalKeluarSukses(true)
                setModalKeluar(false)
            }}
        />

        <Modal 
            variant="danger" 
            isOpen={modalKeluarSukses} 
            closeModal={() => setModalKeluarSukses(false)} 
            description="Anda telah keluar dari akun" 
            rightButtonText="Selesai"
        />
        <div className="flex">
            <main className="w-screen h-[100vh]" style={{ height: 'calc(100vh - 88px)' }}>
                <div className='flex relative items-center justify-between px-[50px] drop-shadow-md bg-neutral-10 z-40'>
                    <div className='flex w-max h-fit space-x-2 cursor-pointer' onClick={() => navigateLogo()}>
                        <BsBusFront className='' size={30}/>
                        <h3 className=''>Routing App</h3>
                    </div>
                    {isUser !== null ? 
                        <div className='relative space-y-2'>
                            <div className='flex items-center inline-flex justify-between px-4 h-[88px] space-x-2 hover:bg-primary-surface hover:bg-opacity-25 hover:text-primary cursor-pointer'
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}                            
                            >
                                <p className="m-p-med">{userEmail}</p>
                                <BsChevronDown></BsChevronDown>
                            </div>
                            {isDropdownOpen && (
                            <div className='absolute fixed right-0 z-40 bg-neutral-10 rounded-[7px] border space-y-2 p-4 w-[213px] drop-shadow-none'>
                                <p className='m-p-reg cursor-default'>{username}</p>
                                <hr/>
                                <div className='w-full h-full cursor-pointer text-danger hover:text-danger-hover ' onClick={() => setModalKeluar(true)}>
                                    <p className='text-[16px] font-semibold'>Logout</p>
                                </div>

                            </div>)}

                        </div>
                    : null}
                </div>
                <div className="relative h-full z-5 bg-neutral-10 flex flex-row justify-between px-[50px] py-[30px]">
                    <div className='flex flex-col w-full h-full items-start justify-center space-y-10 px-[100px]'>
                        <div className='flex flex-col justify-start items-start'>
                            <h2 className='text-primary'>Halaman tidak</h2>
                            <h2>ditemukan</h2>
                        </div>
                        <Button className="text-button-m btn-primary" label="Kembali ke Beranda" useIcon={false}
                            onClick={() => navigateLogo()}
                        />
                    </div>
                    <div className='flex w-full h-full items-center'>
                        <img src={notFound} className="w-full max-h-[100%]"/>
                    </div>
                </div>     
            </main>
        </div>
        </>
    )
}