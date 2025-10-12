import '../App.css';
import React from 'react';
import { BiSolidErrorCircle } from 'react-icons/bi';

const TextField = ({
    label = "Insert label",
    helper = null,
    ref = null,
    placeholder,
    className,
    id,
    value,
    type = 'text',
    onChange,
    isError = false,
    required = false,
    disabled = false}) => {
        return( 
            <div className="sm:col-span-3 p-2">
                <label htmlFor="order-name" className="block m-p-med leading-6">
                    {label} {required ? <span className="text-danger">*</span> : null}
                </label>
                <div className="mt-1">
                    <input
                    type={type}
                    placeholder={placeholder}
                    className={` block min-w-[25%] rounded-md border-0 py-2 px-2 m-p-reg shadow-sm ring-1 ring-inset ${isError ? 'ring-danger' : 'ring-neutral-40'} focus:ring-1 focus:ring-inset focus:ring-primary focus:outline-none sm:text-sm sm:leading-6 disabled:bg-gray-200 disabled:placeholder-neutral-60 ${className}`} 
                    value={value}
                    onChange={onChange}
                    id={id}
                    disabled={disabled}
                    ref={ref}
                    />
                    {
                        isError ?
                        <div className="flex items-center text-neutral-60">
                            <BiSolidErrorCircle className='text-danger'/>
                            <p className="pl-1 leading-6 s-p-med text-danger">{`Kolom ${label.toLowerCase()} harus diisi.`}</p>
                        </div> :
                        helper === null ? null :
                        <div className="flex items-center text-neutral-60">
                            <BiSolidErrorCircle />
                            <p className="pl-1 leading-6 s-p-med">{helper}</p>
                        </div> 
                    }
                </div>
            </div>
        )
}

export {TextField};